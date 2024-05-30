import Header from '@/components/Header'
import { useEffect, useState } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '@/utils/firebase'
import { listAll } from 'firebase/storage'
import { sortUrlsByImageNumberDescending } from '@/helpers/imageGridHelpers'

// TODO safeguard against typo in image names.
export default function Home() {
  const [photos, setPhotos] = useState([])

  const getSortedUrlsForGrid = (urls: string[]) => {
    const sortedUrls = sortUrlsByImageNumberDescending(urls)
    const blankSpaces = sortedUrls.length % 3

    if (!blankSpaces) {
      return sortedUrls
    }

    for (let i = 0; i < blankSpaces; i++) {
      sortedUrls.unshift('SQUARE')
    }

    return sortedUrls
  }

  const fetchPhotos = async () => {
    const listRef = ref(storage)

    const res = await listAll(listRef)
    const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)))

    getSortedUrlsForGrid(urls)

    setPhotos(urls.map((url) => ({ src: url, alt: '' })))
  }
  useEffect(() => {
    fetchPhotos()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <main className="flex flex-col items-center">
        <Header />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="flex justify-center items-center">
              <img src={photo.src} alt={photo.alt} className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
