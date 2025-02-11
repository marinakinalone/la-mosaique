/* eslint-disable @next/next/no-img-element */
import React from 'react'

type ImageCardProps = {
  source: string
  altText: string
}

const ImageCard = ({ source, altText }: ImageCardProps) => {
  return (
    <div className="relative w-full aspect-[1/1] overflow-hidden">
      <img src={source} alt={altText} className="w-full h-full object-cover" />
    </div>
  )
}

export default ImageCard
