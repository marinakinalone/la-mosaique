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
const MAX_VISIBLE_INDEX = 27
const BLANK_SQUARE = 'BLANK_SQUARE'

const gridCols = 'grid grid-cols-3 max-w-2000'
const gridGaps = 'gap-1 sm:gap-2 md:gap-3 xl:gap-4'
const gridMargins =
  'ml-0 mr-0 md:ml-[5%] md:mr-[5%] lg:ml-[10%] lg:mr-[10%] xl:ml-[15%] xl:mr-[15%] 2xl:ml-[18%] 2xl:mr-[18%]'

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [visibleIndex, setVisibleIndex] = useState<number>(0)

  const getSortedUrlsForGrid = (urls: string[]) => {
    const sortedUrls = sortUrlsByImageNumberDescending(urls)
    const blankSpaces = sortedUrls.length % 3

    if (!blankSpaces) {
      return sortedUrls
    }

    for (let i = 0; i < blankSpaces; i++) {
      sortedUrls.unshift(BLANK_SQUARE)
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
    if (!error && visibleIndex < photos.length) {
      const timer = setTimeout(() => {
        setVisibleIndex((prevIndex) => prevIndex + 1)
      }, ANIMATION_INTERVAL)
      return () => clearTimeout(timer)
    }
  }, [error, visibleIndex, photos.length])

  const displayImage = !loading && !error && visibleIndex >= MAX_VISIBLE_INDEX

  return (
    <main className="flex flex-col">
      <div className={`mb-8 ${gridMargins}`}>
        <Header />
      </div>
      <div className={`${gridMargins}`}>
        {!error && (
          <div className={`${gridCols} ${gridGaps}`}>
            {photos.slice(0, visibleIndex).map((photo, index) => (
              <ImageCard
                key={index}
                index={index}
                source={photo.src}
                altText={photo.alt}
                displayImage={displayImage}
              />
            ))}
          </div>
        )}

        {error && <p>There was an error fetching the images... Refresh the page or come back later.</p>}
      </div>
    </main>
  )
}
