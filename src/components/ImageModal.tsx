/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules'
import { getBackgroundColor } from '@/utils/getBackgroundColor'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

type ImageModalProps = {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex: number
}

const ImageModal = ({ isOpen, onClose, images, initialIndex }: ImageModalProps) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Set initial slide when modal opens
  useEffect(() => {
    if (isOpen && swiper) {
      swiper.slideTo(initialIndex, 0)
    }
  }, [isOpen, initialIndex, swiper])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 text-primary_light text-2xl font-bold hover:opacity-70 transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
      >
        ×
      </button>

      {/* Swiper container */}
      <div
        className="w-full h-full max-w-7xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Swiper
          modules={[Navigation, Pagination, Keyboard, Mousewheel]}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            renderBullet: (index, className) => {
              const isActive = index === activeIndex
              const backgroundColor = getBackgroundColor(index)
              return `<span class="${className}" style="background-color: ${backgroundColor}; opacity: ${isActive ? '1' : '0.5'}; width: 12px; height: 12px; border-radius: 50%; margin: 0 4px; transition: opacity 0.3s ease;"></span>`
            },
          }}
          keyboard={{
            enabled: true,
          }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
          onSwiper={setSwiper}
          className="w-full h-full"
          spaceBetween={20}
          centeredSlides={true}
          loop={false}
          initialSlide={initialIndex}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="flex items-center justify-center h-full">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom navigation buttons */}
        <div className="swiper-button-prev !text-primary_light !text-2xl hover:!opacity-70 transition-opacity"></div>
        <div className="swiper-button-next !text-primary_light !text-2xl hover:!opacity-70 transition-opacity"></div>
      </div>
    </div>
  )
}

export default ImageModal
