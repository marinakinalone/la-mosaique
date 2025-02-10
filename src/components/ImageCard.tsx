import React from 'react'

type ImageCardProps = {
  source: string
  altText: string
}

const ImageCard = ({ source, altText }: ImageCardProps) => {
  return (
      <img src={source} alt={altText} className="w-full h-auto object-cover" />
  )
}

export default ImageCard
