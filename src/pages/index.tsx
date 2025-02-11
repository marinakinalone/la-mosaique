import Header from '@/components/Header'
import { useEffect, useState } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '@/utils/firebase'
import { listAll } from 'firebase/storage'
import { sortUrlsByImageNumberDescending } from '@/helpers/imageGridHelpers'
import ImageCard from '@/components/ImageCard'

type Photo = {
  src: string
  alt: string
}

const gridCols = 'grid grid-cols-3 max-w-2000'
const gridGaps = 'gap-1 sm:gap-2 md:gap-3 xl:gap-4'
const gridMargins = 'ml-0 mr-0 md:ml-[4%] md:mr-[4%] xl:ml-[7%] xl:mr-[7%]'

// TODO safeguard against typo in image names.
export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])

  const getSortedUrlsForGrid = (urls: string[]) => {
    const sortedUrls = sortUrlsByImageNumberDescending(urls)
    const blankSpaces = sortedUrls.length % 3

    if (!blankSpaces) {
      return sortedUrls
    }

    for (let i = 0; i < blankSpaces; i++) {
      //TODO fix this
      sortedUrls.unshift('SQUARE')
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
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  useEffect(() => {
    fetchPhotos()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="flex flex-col">
      <div className={`mb-8 ${gridMargins}`}>
        <Header />
      </div>
      <div className={`${gridCols} ${gridGaps} ${gridMargins}`}>
        {photos.map((photo, index) => (
          <ImageCard key={index} source={photo.src} altText={photo.alt} />
        ))}
      </div>
    </main>
  )
}
