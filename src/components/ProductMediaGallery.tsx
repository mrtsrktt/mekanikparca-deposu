'use client'

import { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'

interface ProductMediaGalleryProps {
  images: { url: string; alt?: string | null }[]
  productName: string
}

export default function ProductMediaGallery({ images, productName }: ProductMediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  if (!images.length) {
    return (
      <div className="card aspect-square flex items-center justify-center bg-gray-50 p-8">
        <img src="/placeholder.jpg" alt={productName} className="max-w-full max-h-full object-contain" />
      </div>
    )
  }

  const currentImage = images[selectedIndex]

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div>
      {/* Main Image */}
      <div 
        className="card aspect-square flex items-center justify-center bg-gray-50 p-8 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowLightbox(true)}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt || productName}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`card aspect-square p-2 cursor-pointer transition-all ${
                i === selectedIndex ? 'ring-2 ring-primary-500' : 'hover:ring-2 hover:ring-gray-300'
              }`}
            >
              <img src={img.url} alt={img.alt || ''} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FiChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FiChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img
              src={currentImage.url}
              alt={currentImage.alt || productName}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
