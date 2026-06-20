import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTimeline } from '../api/media'
import { generateClip } from '../api/clips'
import MediaCard from '../components/MediaCard'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import type { MediaItem } from '../api/media'

export default function ClipGenerate() {
  const navigate = useNavigate()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    getTimeline()
      .then((m) => setMedia(m.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (selected.size === 0) { toast('Select at least one media item.', 'error'); return }
    if (!title.trim()) { toast('Enter a title.', 'error'); return }

    setGenerating(true)
    try {
      const res = await generateClip(Array.from(selected), title.trim())
      toast('Clip generated!', 'success')
      navigate(`/clips/${res.data._id}`)
    } catch {
      toast('Error generating clip.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <PageHeader title="Generate Clip" subtitle="Select media to create a new clip" />
      <main className="max-w-6xl mx-auto pt-6 px-8 pb-6 space-y-6">
        <div
          className="rounded-sm overflow-hidden p-5 space-y-4"
          style={{
            backgroundColor: '#fefcf7',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8a7d68' }}>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Clip"
              className="w-full rounded-md px-3 py-2 mt-1 outline-none transition-colors"
              style={{
                border: '1px solid #c8bfad',
                fontFamily: 'Caveat, cursive',
                fontSize: '17px',
                backgroundColor: '#f5f0e8',
                color: '#2c2416',
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || selected.size === 0 || !title.trim()}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}
          >
            {generating ? 'Generating...' : `Generate Clip (${selected.size} item${selected.size !== 1 ? 's' : ''} selected)`}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-sm" style={{ backgroundColor: '#ede6d8', padding: '8px' }}>
                <div className="aspect-[4/3] bg-gray-300 rounded-sm" />
              </div>
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '20px', color: '#8a7d68' }}>No media available.</p>
          </div>
        ) : (
          <div>
            <p className="text-xs mb-3" style={{ color: '#8a7d68' }}>
              {media.length} file{media.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((item) => (
                <MediaCard
                  key={item._id}
                  item={item}
                  selectable
                  selected={selected.has(item._id)}
                  onToggle={() => {
                    const next = new Set(selected)
                    next.has(item._id) ? next.delete(item._id) : next.add(item._id)
                    setSelected(next)
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
