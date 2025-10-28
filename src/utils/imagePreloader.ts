export type Photo = {
  src: string
  alt: string
  isLoaded: boolean
  isLoading: boolean
}

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export const preloadBatch = async (urls: string[]): Promise<Photo[]> => {
  const photos: Photo[] = urls.map((url) => ({
    src: url,
    alt: '',
    isLoaded: false,
    isLoading: true,
  }))

  try {
    // Preload all images in the batch
    await Promise.all(urls.map((url) => preloadImage(url)))

    // Mark all as loaded
    return photos.map((photo) => ({ ...photo, isLoaded: true, isLoading: false }))
  } catch (error) {
    console.error('Error preloading batch:', error)
    return photos.map((photo) => ({ ...photo, isLoaded: false, isLoading: false }))
  }
}
