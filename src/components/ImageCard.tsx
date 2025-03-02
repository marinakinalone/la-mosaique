/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { getBackgroundColor } from '@/utils/getBackgroundColor'

type ImageCardProps = {
  source: string
  altText: string
  index: number
  displayImage: boolean
}

const ImageCard = ({ source, altText, index, displayImage }: ImageCardProps) => {
  return (
    <div
      className="relative w-full aspect-[1/1] overflow-hidden"
      style={{ backgroundColor: getBackgroundColor(index) }}
    >
      {displayImage ? (
        <img src={source} alt={altText} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute top-0 left-0 w-full h-full"></div>
      )}
    </div>
  )
}

export default ImageCard
