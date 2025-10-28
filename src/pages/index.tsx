import Header from '@/components/Header'
import { useEffect, useState, useCallback } from 'react'
import { ref, getDownloadURL, listAll } from 'firebase/storage'
import { storage } from '@/utils/firebase'
import { sortUrlsByImageNumberDescending } from '@/helpers/imageGridHelpers'
import ImageCard from '@/components/ImageCard'
import ImageModal from '@/components/ImageModal'
import { preloadBatch, Photo } from '@/utils/imagePreloader'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

const BATCH_SIZE = 12 // Load 12 images at a time (4 rows of 3)
const STAGGER_DELAY = 50 // Delay between displaying each image

const gridCols = 'grid grid-cols-3 max-w-2000'
const gridGaps = 'gap-1 sm:gap-2 md:gap-3 xl:gap-4'
const gridMargins =
  'ml-0 mr-0 md:ml-[5%] md:mr-[5%] lg:ml-[10%] lg:mr-[10%] xl:ml-[15%] xl:mr-[15%] 2xl:ml-[18%] 2xl:mr-[18%]'

export default function Home() {
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [loadedPhotos, setLoadedPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const [loadedBatches, setLoadedBatches] = useState(0)
  const [isPreloading, setIsPreloading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

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

  const fetchPhotos = useCallback(async () => {
    const listRef = ref(storage)

    try {
      const mosaic = await listAll(listRef)
      const urls = await Promise.all(mosaic.items.map((item) => getDownloadURL(item)))
      const sortedUrls = getSortedUrlsForGrid(urls)

      setAllPhotos(
        sortedUrls.map((url) => ({
          src: url,
          alt: '',
          isLoaded: false,
          isLoading: false,
        })),
      )
      setLoading(false)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setError(true)
    }
  }, [])

  const loadNextBatch = useCallback(async () => {
    if (isPreloading || loadedBatches * BATCH_SIZE >= allPhotos.length) return

    setIsPreloading(true)
    const startIndex = loadedBatches * BATCH_SIZE
    const endIndex = Math.min(startIndex + BATCH_SIZE, allPhotos.length)
    const batchUrls = allPhotos.slice(startIndex, endIndex).map((photo) => photo.src)

    try {
      const loadedBatch = await preloadBatch(batchUrls)
      setLoadedPhotos((prev) => [...prev, ...loadedBatch])
      setLoadedBatches((prev) => prev + 1)
    } catch (error) {
      console.error('Error loading batch:', error)
    } finally {
      setIsPreloading(false)
    }
  }, [isPreloading, loadedBatches, allPhotos])

  const { ref: loadMoreRef } = useIntersectionObserver(() => {
    if (!isPreloading && loadedBatches * BATCH_SIZE < allPhotos.length) {
      loadNextBatch()
    }
  }, 0.1)

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  // Load first batch when photos are fetched
  useEffect(() => {
    if (allPhotos.length > 0 && loadedBatches === 0) {
      loadNextBatch()
    }
  }, [allPhotos, loadedBatches, loadNextBatch])

  // Staggered display of loaded images
  useEffect(() => {
    if (loadedPhotos.length > 0 && visibleCount < loadedPhotos.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1)
      }, STAGGER_DELAY)

      return () => clearTimeout(timer)
    }
  }, [loadedPhotos.length, visibleCount])

  const displayImage = (index: number): boolean => !loading && !error && index < visibleCount

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
        {!error && (
          <div className={`${gridCols} ${gridGaps}`}>
            {loadedPhotos.map((photo, index) => (
              <ImageCard
                key={index}
                index={index}
                source={photo.src}
                altText={photo.alt}
                displayImage={displayImage(index)}
                onClick={() => handleImageClick(index)}
              />
            ))}

            {/* Load more trigger - invisible div that triggers loading */}
            {loadedBatches * BATCH_SIZE < allPhotos.length && (
              <div ref={loadMoreRef} className="col-span-3 h-20" />
            )}
          </div>
        )}

        {error && (
          <p>There was an error fetching the images... Refresh the page or come back later.</p>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={loadedPhotos.map((photo) => photo.src)}
        initialIndex={modalImageIndex}
      />
    </main>
  )
}
