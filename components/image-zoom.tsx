"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
  zoomScale?: number
}

export function ImageZoom({ src, alt, className, zoomScale = 2 }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    setIsZoomed(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x, y })
  }

  return (
    <div className="relative overflow-hidden">
      <div
        ref={imageRef}
        className={cn("relative cursor-zoom-in", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-transform duration-200 ease-out",
            isZoomed && `scale-${zoomScale * 100}`,
          )}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  transform: `scale(${zoomScale})`,
                }
              : {}
          }
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=600&width=600"
          }}
        />
      </div>

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          Zoom: {zoomScale}x
        </div>
      )}
    </div>
  )
}
