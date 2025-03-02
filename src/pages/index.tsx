import Header from '@/components/Header'
import { useEffect, useState } from 'react'
import { ref, getDownloadURL, listAll } from 'firebase/storage'
import { storage } from '@/utils/firebase'
import { sortUrlsByImageNumberDescending } from '@/helpers/imageGridHelpers'
import ImageCard from '@/components/ImageCard'

type Photo = {
  src: string
  alt: string
}

const ANIMATION_INTERVAL = 100
const MAX_VISIBLE_INDEX = 24
const MORE_INDEXES = 9

const gridCols = 'grid grid-cols-3 max-w-2000'
const gridGaps = 'gap-1 sm:gap-2 md:gap-3 xl:gap-4'
const gridMargins =
  'ml-0 mr-0 md:ml-[5%] md:mr-[5%] lg:ml-[10%] lg:mr-[10%] xl:ml-[15%] xl:mr-[15%] 2xl:ml-[18%] 2xl:mr-[18%]'

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [visibleBackgroundIndex, setVisibleBackgroundIndex] = useState<number>(0)
  const [visibleImageIndex, setVisibleImageIndex] = useState<number>(-1)
  const [maxVisibleIndex, setMaxVisibleIndex] = useState<number>(MAX_VISIBLE_INDEX)
  const [isEndOfScroll, setIsEndOfScroll] = useState<boolean>(false)

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

  const fetchPhotos = async () => {
    const listRef = ref(storage)

    try {
      const mosaic = await listAll(listRef)
      const urls = await Promise.all(mosaic.items.map((item) => getDownloadURL(item)))
      const sortedUrls = getSortedUrlsForGrid(urls)

      setPhotos(sortedUrls.map((url) => ({ src: url, alt: '' })))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setError(true)
    }
  }

  useEffect(() => {
    fetchPhotos()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!error && visibleBackgroundIndex < maxVisibleIndex) {
      const timer = setTimeout(() => {
        setVisibleBackgroundIndex((prevIndex) => prevIndex + 1)
      }, ANIMATION_INTERVAL)
      return () => clearTimeout(timer)
    }
  }, [error, visibleBackgroundIndex, maxVisibleIndex])

  useEffect(() => {
    if (!loading && !error && visibleBackgroundIndex >= visibleImageIndex) {
      const timer = setTimeout(() => {
        setVisibleImageIndex((prevIndex) => prevIndex + 1)
      }, ANIMATION_INTERVAL * 2)
      return () => clearTimeout(timer)
    }
  }, [error, loading, maxVisibleIndex, visibleBackgroundIndex, visibleImageIndex])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setIsEndOfScroll(true)
      } else {
        setIsEndOfScroll(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (visibleImageIndex >= maxVisibleIndex && isEndOfScroll) {
      setMaxVisibleIndex((prevIndex) => prevIndex + MORE_INDEXES)
    }
  }, [visibleImageIndex, isEndOfScroll, maxVisibleIndex])

  const displayImage = (index: number): boolean => !loading && !error && index <= visibleImageIndex

  return (
    <main className="flex flex-col">
      <div className={`mb-8 ${gridMargins}`}>
        <Header />
      </div>
      <div className={`${gridMargins}`}>
        {!error && (
          <div className={`${gridCols} ${gridGaps}`}>
            {photos.slice(0, visibleBackgroundIndex).map((photo, index) => (
              <ImageCard
                key={index}
                index={index}
                source={photo.src}
                altText={photo.alt}
                displayImage={displayImage(index)}
              />
            ))}
          </div>
        )}

        {error && (
          <p>There was an error fetching the images... Refresh the page or come back later.</p>
        )}
      </div>
    </main>
  )
}
