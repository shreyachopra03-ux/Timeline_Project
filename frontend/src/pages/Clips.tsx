import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllClips, deleteClip } from '../api/clips'
import ClipCard from '../components/ClipCard'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import type { ClipItem } from '../api/clips'

export default function Clips() {
  const navigate = useNavigate()
  const [clips, setClips] = useState<ClipItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getAllClips().then((res) => setClips(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteClip(id)
      setClips((prev) => prev.filter((c) => c._id !== id))
      toast('Clip deleted.', 'success')
    } catch {
      toast('Error deleting clip.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Clips"
        subtitle={`${clips.length} clip${clips.length !== 1 ? 's' : ''}`}
        action={{ label: 'Generate Clip', onClick: () => navigate('/clips/generate') }}
      />
      <main className="px-8 pt-8 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-sm overflow-hidden" style={{ backgroundColor: '#ede6d8', padding: '10px' }}>
                <div className="aspect-video bg-gray-300 rounded-sm" />
              </div>
            ))}
          </div>
        ) : clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '20px', color: '#8a7d68' }}>No clips yet.</p>
            <Link to="/clips/generate" className="mt-2 text-sm" style={{ color: '#7b1fa2' }}>Generate your first clip</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => (
              <ClipCard key={clip._id} clip={clip} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
