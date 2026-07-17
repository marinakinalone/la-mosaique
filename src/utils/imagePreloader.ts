export type Photo = {
  src: string
  alt: string
  isLoaded: boolean
  isLoading: boolean
}

export const createPlaceholderBatch = (urls: string[]): Photo[] =>
  urls.map((url) => ({
    src: url,
    alt: '',
    isLoaded: false,
    isLoading: true,
  }))

export const loadImage = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
