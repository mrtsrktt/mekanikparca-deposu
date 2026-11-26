'use client'

import { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiX, FiPlay, FiVideo, FiImage } from 'react-icons/fi'

interface ProductMediaGalleryProps {
  images: { url: string; alt?: string | null }[]
  videos?: { id?: string; url: string; title?: string | null }[]
  productName: string
}

type MediaItem =
  | { type: 'image'; url: string; alt?: string | null }
  | { type: 'video'; url: string; title?: string | null; id?: string }

export default function ProductMediaGallery({ images, videos = [], productName }: ProductMediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const mediaItems: MediaItem[] = [
    ...images.map(img => ({ type: 'image' as const, url: img.url, alt: img.alt })),
    ...videos.map(vid => ({ type: 'video' as const, url: vid.url, title: vid.title, id: vid.id }))
  ]

  if (!mediaItems.length) {
    return (
      <div className="card aspect-square flex items-center justify-center bg-gray-50 p-8">
        <img src="/placeholder.jpg" alt={productName} className="max-w-full max-h-full object-contain" />
      </div>
    )
  }

  const currentMedia = mediaItems[selectedIndex] || mediaItems[0]

  const nextMedia = () => {
    setSelectedIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevMedia = () => {
    setSelectedIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const hasVideos = videos.length > 0
  const firstVideoIndex = images.length // Videoların başladığı ilk indeks

  return (
    <div>
      {/* Media Type Tabs (video varsa üstte hızlı geçiş butonları) */}
      {hasVideos && (
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setSelectedIndex(0)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentMedia.type === 'image'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiImage className="w-3.5 h-3.5" />
            Fotoğraflar ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedIndex(firstVideoIndex)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentMedia.type === 'video'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <FiPlay className="w-3.5 h-3.5 fill-current" />
            Ürün Videosu ({videos.length})
          </button>
        </div>
      )}

      {/* Main Media Display */}
      {currentMedia.type === 'image' ? (
        <div 
          className="card aspect-square flex items-center justify-center bg-gray-50 p-8 cursor-pointer hover:shadow-lg transition-shadow relative group"
          onClick={() => setShowLightbox(true)}
        >
          <img
            src={currentMedia.url}
            alt={currentMedia.alt || productName}
            className="max-w-full max-h-full object-contain"
          />
          <span className="absolute bottom-3 right-3 text-xs bg-black/60 text-white px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Büyütmek için tıklayın
          </span>
        </div>
      ) : (
        <div className="card aspect-square flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden p-2 relative shadow-lg">
          <video
            key={currentMedia.url}
            controls
            playsInline
            autoPlay
            className="w-full h-full object-contain rounded-lg"
            preload="metadata"
          >
            <source src={currentMedia.url} />
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
          {currentMedia.title && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
              <FiVideo className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentMedia.title}</span>
            </div>
          )}
        </div>
      )}

      {/* Thumbnails Row */}
      {mediaItems.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
          {mediaItems.map((item, i) => {
            const isSelected = i === selectedIndex
            if (item.type === 'image') {
              return (
                <div
                  key={`img-${i}`}
                  onClick={() => setSelectedIndex(i)}
                  className={`card aspect-square p-2 cursor-pointer transition-all relative ${
                    isSelected ? 'ring-2 ring-primary-500 shadow-sm' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <img src={item.url} alt={item.alt || ''} className="w-full h-full object-contain" />
                </div>
              )
            } else {
              return (
                <div
                  key={`vid-${i}`}
                  onClick={() => setSelectedIndex(i)}
                  className={`card aspect-square p-2 cursor-pointer transition-all relative flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden group ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:ring-2 hover:ring-blue-400'
                  }`}
                  title={item.title || 'Video'}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <FiPlay className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                  <span className="text-[10px] font-semibold mt-1 tracking-tight text-blue-200 uppercase">
                    Video
                  </span>
                </div>
              )
            }
          })}
        </div>
      )}

      {/* Lightbox (Sadece fotoğraflar için) */}
      {showLightbox && currentMedia.type === 'image' && (
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
                onClick={prevMedia}
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FiChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FiChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img
              src={currentMedia.url}
              alt={currentMedia.alt || productName}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
