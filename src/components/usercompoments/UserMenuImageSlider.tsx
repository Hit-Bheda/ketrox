"use client"

import * as React from "react"
import Image from "next/image"
import { ChefHat } from "lucide-react"

interface MenuImageSliderProps {
  images?: string[]
  alt: string
}

export function UserMenuImageSlider({ images = [], alt }: MenuImageSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const hasMultipleImages = images.length > 1

  // Scroll helper
  const scrollToIndex = React.useCallback((index: number, smooth = true) => {
    const container = scrollRef.current
    if (!container) return
    const width = container.clientWidth
    container.scrollTo({
      left: width * index,
      behavior: smooth ? "smooth" : "auto",
    })
  }, [])

  // Start auto scroll
  const startAutoScroll = React.useCallback(() => {
    if (intervalRef.current || !hasMultipleImages) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= images.length) {
          scrollToIndex(0, false)
          return 0
        }
        scrollToIndex(next, true)
        return next
      })
    }, 3000)
  }, [images.length, hasMultipleImages, scrollToIndex])

  // Stop auto scroll
  const stopAutoScroll = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])


  React.useEffect(() => {
    if (!isPaused) {
      startAutoScroll()
    } else {
      stopAutoScroll()
    }
    return () => stopAutoScroll()
  }, [isPaused, startAutoScroll, stopAutoScroll])

  // Manual drag scroll
  React.useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let isDragging = false
    let startX = 0
    let scrollStart = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.pageX - container.offsetLeft
      scrollStart = container.scrollLeft
      container.style.cursor = "grabbing"
      container.style.userSelect = "none"
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const x = e.pageX - container.offsetLeft
      const walk = x - startX
      container.scrollLeft = scrollStart - walk
    }

    const stopDragging = () => {
      isDragging = false
      container.style.cursor = "grab"
      container.style.removeProperty("user-select")
    }

    container.addEventListener("mousedown", onMouseDown)
    container.addEventListener("mousemove", onMouseMove)
    container.addEventListener("mouseup", stopDragging)
    container.addEventListener("mouseleave", stopDragging)

    container.style.cursor = "grab"

    return () => {
      container.removeEventListener("mousedown", onMouseDown)
      container.removeEventListener("mousemove", onMouseMove)
      container.removeEventListener("mouseup", stopDragging)
      container.removeEventListener("mouseleave", stopDragging)
    }
  }, [])

  // Fallback if no images
  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-muted relative rounded-t-xl overflow-hidden flex items-center justify-center">
        <ChefHat className="w-12 h-12 text-muted-foreground m-auto" />
      </div>
    )
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-current-index={currentIndex}
    >
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full snap-start"
            style={{ flexBasis: "100%" }}
          >
            <div className="relative w-full aspect-square rounded-t-xl overflow-hidden">
              <Image
                src={imgUrl}
                alt={`${alt} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
