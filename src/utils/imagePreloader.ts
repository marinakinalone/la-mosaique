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
    img.onload = () => {
      // Wait for the bitmap to be decoded so the tile is actually ready to
      // paint ("shown up") before the next one is revealed. decode() isn't
      // available everywhere, so fall back to resolving on load.
      if (typeof img.decode === 'function') {
        img.decode().then(resolve).catch(resolve)
      } else {
        resolve()
      }
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
