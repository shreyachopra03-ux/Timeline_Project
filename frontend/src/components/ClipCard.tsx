import { Link } from 'react-router-dom';
import type { ClipItem } from '../api/clips';

function cleanName(name: string) {
  return name.replace(/\.[^.]+$/, '')
};

interface Props {
  clip: ClipItem
  onDelete?: (id: string) => void
};

export default function ClipCard({ clip, onDelete }: Props) {
  return (
    <div
      className="rounded-sm"
      style={{
        backgroundColor: '#fefcf7',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}
    >
      <Link to={`/clips/${clip._id}`} className="block p-[10px] pb-0">
        <video
          src={clip.url}
          className="w-full aspect-video object-cover rounded-sm"
          style={{ backgroundColor: '#ede6d8' }}
          muted
          preload="metadata"
        />
        <div className="mt-3 px-1 pb-2">
          <p className="font-medium truncate" style={{ fontFamily: 'Caveat, cursive', fontSize: '18px', color: '#2c2416' }}>
            {cleanName(clip.title)}
          </p>
          <p className="text-xs mt-1" style={{ color: '#8a7d68' }}>
            {Math.round(clip.duration)}s &middot; {new Date(clip.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
      
      {onDelete && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onDelete(clip._id)}
            className="w-full text-xs font-medium py-2 rounded"
            style={{ backgroundColor: '#dc2626', color: 'white' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
)};
