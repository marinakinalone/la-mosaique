const extractImageNumber = (url: string) => {
  const imageName = url.split('/').pop()
  const imageNumber = imageName?.split('.')[0]

  return imageNumber
}

export const sortUrlsByImageNumberDescending = (urls: string[]): string[] => {
  return urls.sort((a, b) => {
    const imageNumberA = parseInt(extractImageNumber(a) || '0')
    const imageNumberB = parseInt(extractImageNumber(b) || '0')

    return imageNumberB - imageNumberA
  })
}
