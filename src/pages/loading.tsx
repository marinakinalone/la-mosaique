import React from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getBackgroundColor } from '@/utils/getBackgroundColor'

const LoadingPage = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
    <LoadingSpinner size="lg" />
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="tile-reveal aspect-square w-16 sm:w-20"
          style={
            {
              backgroundColor: getBackgroundColor(i),
              '--tile-index': i,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  </div>
)

export default LoadingPage
