import { useNavigate, useLocation } from 'react-router-dom'

interface Props {
  mediaCount?: number
  onAddMemory: () => void
}

export default function Header({ mediaCount = 0, onAddMemory }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
      style={{
        backgroundColor: 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(44, 36, 22, 0.08)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2c2416' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px' }}>Memories</span>
            {isHome && mediaCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8d5b7', color: '#7b4f1e', fontFamily: 'Caveat, cursive' }}>
                {mediaCount} moments
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Navigation dots for non-home pages */}
        {!isHome && (
          <>
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: '#ede6d8', color: '#2c2416' }}
            >
              Timeline
            </button>
            <button
              onClick={() => navigate('/clips')}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: location.pathname.startsWith('/clips') ? '#2c2416' : '#ede6d8', color: location.pathname.startsWith('/clips') ? '#fefcf7' : '#2c2416' }}
            >
              Clips
            </button>
            <button
              onClick={() => navigate('/shared')}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: location.pathname.startsWith('/shared') ? '#2c2416' : '#ede6d8', color: location.pathname.startsWith('/shared') ? '#fefcf7' : '#2c2416' }}
            >
              Shared
            </button>
          </>
        )}

        {isHome && (
          <>
            <button
              onClick={() => navigate('/clips/generate')}
              className="text-xs font-medium px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
              style={{ backgroundColor: '#ede6d8', color: '#2c2416' }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 3v18" />
                <path d="M3 7.5h4" />
                <path d="M3 12h18" />
                <path d="M3 16.5h4" />
                <path d="M17 3v18" />
                <path d="M17 7.5h4" />
                <path d="M17 16.5h4" />
              </svg>
              Create Video
            </button>
            <button
              onClick={onAddMemory}
              className="text-xs font-medium px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
              style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Memory
            </button>
          </>
        )}
      </div>
    </header>
  )
}
