"use client"

import * as React from "react"
import Image from "next/image"
import { ChefHat } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface MenuImageSliderProps {
  images?: string[]
  alt: string
}

export function MenuImageSlider({ images = [], alt }: MenuImageSliderProps) {
  if (!images.length) {
    return (
      <div className="w-full aspect-video bg-muted relative rounded-t-xl overflow-hidden flex items-center justify-center">
        <ChefHat className="w-12 h-12 text-muted-foreground m-auto" />
      </div>
    )
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((imgUrl, idx) => (
          <CarouselItem key={idx}>
            <div className="relative w-full aspect-video rounded-t-xl overflow-hidden">
              <Image
                src={imgUrl}
                alt={`${alt} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  )
}
