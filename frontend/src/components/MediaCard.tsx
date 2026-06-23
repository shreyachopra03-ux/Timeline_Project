import { useState } from 'react';
import type { MediaItem } from '../api/media';

interface Props {
  item: MediaItem
  selected?: boolean
  onToggle?: () => void
  selectable?: boolean
  onDelete?: (id: string) => void
};

function cleanName(name: string) {
  return name.replace(/\.[^.]+$/, '')
};

export default function MediaCard({ item, selected, onToggle, selectable, onDelete }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={selectable ? onToggle : undefined}
      className={`relative rounded-sm transition-all duration-200 ${
        selectable ? 'cursor-pointer hover:shadow-md' : ''
      } ${selected ? 'ring-2' : ''}`}
      style={{
        backgroundColor: '#fefcf7',
        boxShadow: selected ? '0 0 0 2px #ce93d8' : '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      {selectable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggle) onToggle();
          }}
          className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
            selected ? 'bg-[#ce93d8] border-[#ce93d8] text-white' : 'bg-white/80 border-gray-400'
          }`}
        >
          {selected && <span className="text-[10px] font-bold">&#10003;</span>}
        </button>
      )}

      <div className="p-[8px] pb-0">
        <div className="relative overflow-hidden" style={{ backgroundColor: '#ede6d8' }}>
          {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
          {item.type === 'video' ? (
            <video
              src={item.cloudinary_url}
              className={`w-full aspect-[4/3] object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
              muted
              preload="metadata"
              onLoadedData={() => setLoaded(true)}
            />
          ) : (
            <img
              src={item.cloudinary_url}
              alt={item.fileName || 'media'}
              className={`w-full aspect-[4/3] object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          )}
        </div>
        <div className="mt-1.5 px-1 pb-2">
          <p className="text-xs truncate" style={{ fontFamily: 'Caveat, cursive', fontSize: '13px', color: '#5c4f3a' }}>
            {cleanName(item.fileName || 'Untitled')}
          </p>
          <span className="text-[9px] uppercase tracking-wider" style={{ color: '#b5a898' }}>{item.type}</span>
        </div>
      </div>

      {onDelete && (
        <div className="px-2 pb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(item._id);
            }}
            className="w-full text-xs font-medium py-1.5 rounded"
            style={{ backgroundColor: '#dc2626', color: 'white' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
)};