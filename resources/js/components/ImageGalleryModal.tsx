import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  carName?: string;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  carName = 'Car'
}) => {

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset current index when modal opens with new images
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, goToNext, goToPrevious, onClose]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-0">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{carName}</h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} of {images.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Image */}
        <div className="relative flex items-center justify-center h-full min-h-[60vh]">
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Current Image */}
          <div className="flex items-center justify-center w-full h-full p-8">
            <img
              src={currentImage}
              alt={`${carName} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/images/car-placeholder.jpeg';
              }}
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white shadow-lg'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = '/images/car-placeholder.jpeg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Instructions */}
        <div className="absolute bottom-4 right-4 z-10 text-white text-xs opacity-70">
          <p>Use ← → keys or click arrows to navigate</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryModal;
