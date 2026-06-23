import { useState } from 'react';
import type { MediaItem } from '../api/media';

const rotations = [-4, -2, 1, 3, -3, 2, -1, 4, -2.5, 1.5];

export const yearColors: Record<string, { bg: string; tape: string; label: string }> = {
  '2020': { bg: '#fce4ec', tape: '#f48fb1', label: '#c2185b' },
  '2021': { bg: '#e8f5e9', tape: '#a5d6a7', label: '#388e3c' },
  '2022': { bg: '#e3f2fd', tape: '#90caf9', label: '#1976d2' },
  '2023': { bg: '#fff8e1', tape: '#ffe082', label: '#f57f17' },
  '2024': { bg: '#f3e5f5', tape: '#ce93d8', label: '#7b1fa2' },
  '2025': { bg: '#fbe9e7', tape: '#ffab91', label: '#bf360c' },
  '2026': { bg: '#e0f7fa', tape: '#80deea', label: '#00838f' },
};

export const defaultColor = { bg: '#f3e5f5', tape: '#ce93d8', label: '#7b1fa2' };

export function getYearColor(year: string) {
  return yearColors[year] || defaultColor
};

interface Props {
  item: MediaItem
  year: string
  index: number
  onOpen: (item: MediaItem) => void
};

function cleanName(name: string) {
  return name.replace(/\.[^.]+$/, '')
};

export default function PolaroidCard({ item, year, index, onOpen }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const c = getYearColor(year);
  const rot = rotations[index % rotations.length];

  return (
    <div
      onClick={() => onOpen(item)}
      className="relative cursor-pointer group/card"
      style={{ zIndex: 1 }}
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

      <div
        className="rounded-sm overflow-hidden transition-all duration-300 ease-out"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
          backgroundColor: c.bg,
          padding: '10px 10px 38px 10px',
          width: '200px',
          transform: `rotate(${rot}deg)`,
        }}
      >
  
        <div className="relative overflow-hidden bg-gray-200" style={{ width: '180px', height: '160px' }}>
          {!loaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {item.type === 'video' ? (
            <>
              <video
                src={item.cloudinary_url}
                className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
                muted
                preload="metadata"
                onLoadedData={() => setLoaded(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 ml-0.5" fill="currentColor">
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

          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked) }}
            className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill={liked ? '#e91e63' : 'none'} stroke={liked ? '#e91e63' : 'white'} strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>

        <div className="mt-2 px-1 text-center">
          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '15px', color: c.label, fontWeight: 600, lineHeight: 1.25 }}>
            {cleanName(item.fileName || 'Memory')}
          </p>
          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '12px', color: '#8a7d68', marginTop: '2px' }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
};
