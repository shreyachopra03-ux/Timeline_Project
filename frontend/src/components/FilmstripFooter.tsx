import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getYearColor } from './PolaroidCard'

interface Props {
  years: string[]
};

export default function FilmstripFooter({ years }: Props) {
  const [showNav, setShowNav] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setShowNav(location.pathname === '/')
  }, [location]);

  const scrollToYear = (year: string) => {
    const el = document.getElementById(`year-${year}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }};

  const isHome = location.pathname === '/';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16 z-40"
      style={{ backgroundColor: '#1a1208' }}
    >
      
      <div className="absolute inset-y-0 left-0 right-0 flex overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="flex flex-col justify-between py-1.5 px-0.5 h-full" style={{ flex: '1 0 0' }}>
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#2d1f0a' }} />
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#2d1f0a' }} />
          </div>
        ))}
      </div>

      {showNav && years.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center gap-8">
          {years.map((year) => {
            const c = getYearColor(year)
            return (
              <button
                key={year}
                onClick={() => scrollToYear(year)}
                className="transition-all hover:scale-110"
                style={{ fontFamily: 'Caveat, cursive', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.1em', color: c.tape }}
              >
                {year}
              </button>
            )
          })}
        </div>
      )}

      {!isHome && (
        <div className="absolute inset-0 flex items-center justify-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold tracking-widest transition-all hover:scale-110"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '16px', color: '#ce93d8' }}
          >
            Timeline
          </button>
          <button
            onClick={() => navigate('/clips')}
            className="text-xs font-semibold tracking-widest transition-all hover:scale-110"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '16px', color: '#ce93d8' }}
          >
            Clips
          </button>
          <button
            onClick={() => navigate('/shared')}
            className="text-xs font-semibold tracking-widest transition-all hover:scale-110"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '16px', color: '#ce93d8' }}
          >
            Shared
          </button>
        </div>
      )}
    </div>
)};
