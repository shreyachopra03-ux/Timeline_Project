import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createSharedAlbum } from '../api/shared';
import { getTimeline } from '../api/media';
import MediaCard from '../components/MediaCard';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import type { MediaItem } from '../api/media';

export default function SharedCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getTimeline()
      .then((res) => setMedia(res.data))
      .catch((err: any) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast('Please enter a title', 'error')
      return
    }
    setCreating(true)
    try {
      const res = await createSharedAlbum(
        title.trim(),
        description.trim() || undefined,
        selected.size > 0 ? Array.from(selected) : undefined
      )
      toast('Album created!', 'success')
      navigate(`/shared/${res.data._id}`)
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setCreating(false)
    }
  };

  return (
    <>
      <PageHeader title="Create Shared Album" />
      <main className="max-w-4xl mx-auto pt-6 px-8 pb-6 space-y-6">
        <Link to="/shared" className="text-sm inline-flex items-center gap-1" style={{ color: '#8a7d68' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Albums
        </Link>

        <div className="rounded-sm overflow-hidden p-5 space-y-4" style={{ backgroundColor: '#fefcf7', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8a7d68' }}>
              Title <span style={{ color: '#c0392b' }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Family Trip 2026"
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
          <div>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8a7d68' }}>
              Description <span className="font-normal lowercase" style={{ color: '#b5a898' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description..."
              rows={2}
              className="w-full rounded-md px-3 py-2 mt-1 outline-none transition-colors resize-none"
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
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}
          >
            {creating ? 'Creating...' : 'Create Album'}
          </button>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-3" style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
            Add Media
            {selected.size > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8d5b7', color: '#7b4f1e' }}>
                {selected.size} selected
              </span>
            )}
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-sm" style={{ backgroundColor: '#ede6d8', padding: '8px' }}>
                  <div className="aspect-[4/3] bg-gray-300 rounded-sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {media.map((item) => (
                <MediaCard
                  key={item._id}
                  item={item}
                  selectable
                  selected={selected.has(item._id)}
                  onToggle={() => toggleSelect(item._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
)};
