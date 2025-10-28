/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { getBackgroundColor } from '@/utils/getBackgroundColor'

type ImageCardProps = {
  source: string
  altText: string
  index: number
  displayImage: boolean
  onClick?: () => void
}

const ImageCard = ({ source, altText, index, displayImage, onClick }: ImageCardProps) => {
  return (
    <div
      className="relative w-full aspect-[1/1] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: getBackgroundColor(index) }}
      onClick={onClick}
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
