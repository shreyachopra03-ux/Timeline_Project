import { useEffect, useState } from 'react';
import type { MediaItem } from '../api/media';
import { getYearColor } from './PolaroidCard';

interface Props {
  items: MediaItem[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onDelete?: (id: string) => void
};

export default function MemoryDetailModal({ items, currentIndex, onClose, onPrev, onNext, onDelete }: Props) {
  const item = items[currentIndex];
  const [loaded, setLoaded] = useState(false);
  const year = new Date(item.createdAt).getFullYear().toString();
  const c = getYearColor(year);

  useEffect(() => {
    setLoaded(false)
  }, [currentIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(20, 14, 5, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-sm shadow-2xl animate-slide-up"
        style={{
          backgroundColor: c.bg,
          padding: '16px 16px 72px 16px',
          maxWidth: '520px',
          width: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm z-10"
          style={{
            backgroundColor: c.tape,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 4px, rgba(255,255,255,0.4) 4px 5px)',
            }}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors z-20"
          style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {currentIndex > 0 && (
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-20"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {currentIndex < items.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-20"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        <div className="relative overflow-hidden bg-gray-200 w-full" style={{ aspectRatio: '4/3' }}>
          {!loaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {item.type === 'video' ? (
            <>
              <video
                src={item.cloudinary_url}
                className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
                controls
                preload="metadata"
                onLoadedData={() => setLoaded(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <svg viewBox="0 0 24 24" className="w-7 h-7 ml-1" fill="currentColor">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <img
              src={item.cloudinary_url}
              alt={item.fileName || 'memory'}
              className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: c.label }}>
            {(item.fileName || 'Memory').replace(/\.[^.]+$/, '')}
          </h2>
          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '17px', color: '#5c4f3a', marginTop: '4px' }}>
            {(item.fileName || 'A captured moment').replace(/\.[^.]+$/, '')}
          </p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#8a7d68', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {onDelete && (
            <button
              onClick={() => onDelete(item._id)}
              className="mt-4 text-xs font-medium px-4 py-2 rounded-full"
              style={{ backgroundColor: '#dc2626', color: 'white' }}
            >
              Delete Memory
            </button>
          )}
        </div>
      </div>
    </div>
)};
