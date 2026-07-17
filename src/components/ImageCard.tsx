/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { getBackgroundColor } from '@/utils/getBackgroundColor'
import LoadingSpinner from '@/components/LoadingSpinner'

type ImageCardProps = {
  source: string
  altText: string
  index: number
  isLoading: boolean
  isLoaded: boolean
  onClick?: () => void
}

const ImageCard = ({ source, altText, index, isLoading, isLoaded, onClick }: ImageCardProps) => {
  const showSpinner = isLoading && !isLoaded
  const showImage = isLoaded

  return (
    <div
      className="tile-reveal relative w-full aspect-[1/1] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity [content-visibility:auto]"
      style={
        {
          backgroundColor: getBackgroundColor(index),
          '--tile-index': index % 12,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      {showImage && (
        <img
          src={source}
          alt={altText}
          className="image-fade-in absolute inset-0 h-full w-full object-cover"
        />
      )}

      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  )
}

export default ImageCard
