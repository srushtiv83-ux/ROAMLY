import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages = images.length > 0 ? images : [''];

  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  const goNext = () =>
    setActiveIndex((prev) => (prev + 1) % safeImages.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#172B3A]/10">
        <SafeImage
          src={safeImages[activeIndex]}
          alt={`${title} view ${activeIndex + 1}`}
          fallbackTitle={title}
          className="w-full h-full"
        />
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open full-screen photo gallery"
          className="absolute bottom-3 right-3 min-h-[40px] px-3.5 py-2 rounded-full bg-[#080C10]/70 text-white text-xs font-medium inline-flex items-center gap-1.5 backdrop-blur-sm hover:bg-[#080C10] transition-colors"
        >
          <Expand className="w-3.5 h-3.5" />
          <span>View Gallery ({safeImages.length})</span>
        </button>
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {safeImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Show ${title} photo ${idx + 1}`}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'ring-2 ring-[#FF7043] ring-offset-2 ring-offset-[#FCF9F3]'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <SafeImage
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fallbackTitle={title}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-50 bg-[#080C10]/95 flex flex-col items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close gallery"
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden">
            <SafeImage
              src={safeImages[activeIndex]}
              alt={`${title} enlarged photo ${activeIndex + 1}`}
              fallbackTitle={title}
              className="w-full h-full"
            />
          </div>

          <div className="mt-4 flex items-center gap-4 text-white">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm tabular-nums">
              {activeIndex + 1} / {safeImages.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
