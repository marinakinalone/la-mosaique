import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useEffect, useState, useCallback, useRef } from 'react'
import { ref, getDownloadURL, listAll } from 'firebase/storage'
import { storage } from '@/utils/firebase'
import { sortUrlsByImageNumberDescending } from '@/helpers/imageGridHelpers'
import ImageCard from '@/components/ImageCard'
import ImageModal from '@/components/ImageModal'
import { createPlaceholderBatch, loadImage, Photo } from '@/utils/imagePreloader'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

const BATCH_SIZE = 12
const MOBILE_BATCH_SIZE = 6

const gridCols = 'grid grid-cols-3 max-w-2000'
const gridGaps = 'gap-1 sm:gap-2 md:gap-3 xl:gap-4'
const gridMargins =
  'ml-0 mr-0 md:ml-[5%] md:mr-[5%] lg:ml-[10%] lg:mr-[10%] xl:ml-[15%] xl:mr-[15%] 2xl:ml-[18%] 2xl:mr-[18%]'

export default function Home() {
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [loadedPhotos, setLoadedPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [isPreloading, setIsPreloading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  const isPreloadingRef = useRef(false)
  const loadedCountRef = useRef(0)
  const allPhotosRef = useRef<Photo[]>([])
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const getBatchSize = useCallback(() => {
    if (typeof window === 'undefined') return BATCH_SIZE
    return window.innerWidth < 768 ? MOBILE_BATCH_SIZE : BATCH_SIZE
  }, [])

  const getSortedUrlsForGrid = (urls: string[]) => {
    const sortedUrls = sortUrlsByImageNumberDescending(urls)
    const blankSpaces = sortedUrls.length % 3

    if (!blankSpaces) {
      return sortedUrls
    }

    for (let i = 0; i < blankSpaces + 3; i++) {
      sortedUrls.shift()
    }

    return sortedUrls
  }

  const updatePhotoAtIndex = useCallback((index: number, updates: Partial<Photo>) => {
    setLoadedPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, ...updates } : photo)),
    )
  }, [])

  const isSentinelVisible = useCallback(() => {
    const element = sentinelRef.current
    if (!element) return false
    const rect = element.getBoundingClientRect()
    return rect.top < window.innerHeight + 600
  }, [])

  const loadNextBatchRef = useRef<() => void>(() => {})

  const loadNextBatch = useCallback(async () => {
    if (isPreloadingRef.current || loadedCountRef.current >= allPhotosRef.current.length) return

    isPreloadingRef.current = true
    setIsPreloading(true)

    const batchSize = getBatchSize()
    const startIndex = loadedCountRef.current
    const endIndex = Math.min(startIndex + batchSize, allPhotosRef.current.length)
    const batchUrls = allPhotosRef.current.slice(startIndex, endIndex).map((photo) => photo.src)

    const placeholders = createPlaceholderBatch(batchUrls)
    loadedCountRef.current = endIndex
    setLoadedPhotos((prev) => [...prev, ...placeholders])

    // Start every download in parallel so loading stays fast...
    const loadResults = batchUrls.map((url) =>
      loadImage(url)
        .then(() => true)
        .catch((err) => {
          console.error('Error loading image:', err)
          return false
        }),
    )

    // ...but reveal them one after another in grid order (left to right, top to
    // bottom) so a tile only appears once the previous one has shown up.
    for (let batchIndex = 0; batchIndex < loadResults.length; batchIndex++) {
      const photoIndex = startIndex + batchIndex
      const isLoaded = await loadResults[batchIndex]
      updatePhotoAtIndex(photoIndex, { isLoaded, isLoading: false })
    }

    isPreloadingRef.current = false
    setIsPreloading(false)

    if (isSentinelVisible() && loadedCountRef.current < allPhotosRef.current.length) {
      loadNextBatchRef.current()
    }
  }, [getBatchSize, updatePhotoAtIndex, isSentinelVisible])

  useEffect(() => {
    loadNextBatchRef.current = () => {
      void loadNextBatch()
    }
  }, [loadNextBatch])

  const tryLoadMore = useCallback(() => {
    void loadNextBatch()
  }, [loadNextBatch])

  const { ref: observerRef } = useIntersectionObserver(tryLoadMore)

  const setLoadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelRef.current = node
      observerRef(node)
    },
    [observerRef],
  )

  useEffect(() => {
    let cancelled = false

    const fetchPhotos = async () => {
      const listRef = ref(storage)

      try {
        const mosaic = await listAll(listRef)
        const urls = await Promise.all(mosaic.items.map((item) => getDownloadURL(item)))
        if (cancelled) return

        const sortedUrls = getSortedUrlsForGrid(urls)
        const photos = sortedUrls.map((url) => ({
          src: url,
          alt: '',
          isLoaded: false,
          isLoading: false,
        }))

        allPhotosRef.current = photos
        setAllPhotos(photos)
        setLoading(false)
        void loadNextBatch()
      } catch (err) {
        console.error('Error fetching photos:', err)
        if (!cancelled) setError(true)
      }
    }

    void fetchPhotos()

    return () => {
      cancelled = true
    }
  }, [loadNextBatch])

  const handleImageClick = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <main className="flex flex-col">
      <div className={`mb-8 ${gridMargins}`}>
        <Header />
      </div>
      <div className={`${gridMargins}`}>
        {loading && !error && (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && !error && (
          <div className={`${gridCols} ${gridGaps}`}>
            {loadedPhotos.map((photo, index) => (
              <ImageCard
                key={`${photo.src}-${index}`}
                index={index}
                source={photo.src}
                altText={photo.alt}
                isLoading={photo.isLoading}
                isLoaded={photo.isLoaded}
                onClick={() => handleImageClick(index)}
              />
            ))}

            {loadedPhotos.length < allPhotos.length && (
              <div ref={setLoadMoreRef} className="col-span-3 flex h-32 items-center justify-center">
                {isPreloading && <LoadingSpinner size="md" />}
              </div>
            )}
          </div>
        )}

        {error && (
          <p>There was an error fetching the images... Refresh the page or come back later.</p>
        )}
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={loadedPhotos.map((photo) => photo.src)}
        initialIndex={modalImageIndex}
      />
    </main>
  )
}
