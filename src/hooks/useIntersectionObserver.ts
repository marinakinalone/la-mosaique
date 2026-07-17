import { useCallback, useEffect, useRef, useState } from 'react'

type IntersectionObserverOptions = {
  threshold?: number
  rootMargin?: string
}

export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverOptions = {},
) => {
  const { threshold = 0.1, rootMargin = '600px 0px' } = options
  const callbackRef = useRef(callback)
  const [target, setTarget] = useState<HTMLDivElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const ref = useCallback((node: HTMLDivElement | null) => {
    setTarget(node)
  }, [])

  useEffect(() => {
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) {
          callbackRef.current()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [target, threshold, rootMargin])

  return { ref, isIntersecting }
}
