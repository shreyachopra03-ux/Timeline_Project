import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClip, deleteClip } from '../api/clips';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import type { ClipItem } from '../api/clips';

export default function ClipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clip, setClip] = useState<ClipItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return
    getClip(id).then((res) => setClip(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteClip(id)
      toast('Clip deleted.', 'success')
      navigate('/clips')
    } catch {
      toast('Error deleting clip.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-8 px-8">
        <div className="animate-pulse rounded-sm overflow-hidden" style={{ backgroundColor: '#ede6d8', padding: '10px' }}>
          <div className="aspect-video bg-gray-300 rounded-sm" />
        </div>
      </div>
    )
  }

  if (!clip) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ fontFamily: 'Caveat, cursive', fontSize: '20px', color: '#8a7d68' }}>Clip not found.</p>
      </div>
    )
  }

  return (
    <>
      <PageHeader title={clip.title} />
      <main className="max-w-4xl mx-auto pt-6 px-8 pb-6">
        <button
          onClick={() => navigate('/clips')}
          className="text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          style={{ color: '#8a7d68' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to clips
        </button>

        <div
          className="rounded-sm overflow-hidden"
          style={{
            backgroundColor: '#fefcf7',
            padding: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <video
            src={clip.url}
            controls
            className="w-full rounded-sm"
            style={{ backgroundColor: '#ede6d8' }}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm" style={{ color: '#8a7d68' }}>
            {Math.round(clip.duration)}s &middot; {new Date(clip.createdAt).toLocaleDateString()}
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
            style={{ backgroundColor: '#c0392b', color: 'white' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </main>
    </>
)};
