import { useEffect, useRef, useState } from 'react'

export const useIntersectionObserver = (callback: () => void, threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          callback()
        } else {
          setIsIntersecting(false)
        }
      },
      { threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [callback, threshold])

  return { ref, isIntersecting }
}
