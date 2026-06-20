import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSharedAlbums, deleteSharedAlbum } from '../api/shared'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import type { SharedItem } from '../api/shared'

export default function Shared() {
  const navigate = useNavigate()
  const [albums, setAlbums] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getSharedAlbums()
      .then((res) => setAlbums(res.data))
      .catch((err: any) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      await deleteSharedAlbum(id)
      setAlbums((prev) => prev.filter((a) => a._id !== id))
      toast('Album deleted', 'success')
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Shared Albums"
        subtitle={`${albums.length} album${albums.length !== 1 ? 's' : ''}`}
        action={{ label: 'New Album', onClick: () => navigate('/shared/create') }}
      />
      <main className="max-w-6xl mx-auto pt-6 px-8 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-sm overflow-hidden" style={{ backgroundColor: '#ede6d8', padding: '16px' }}>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '20px', color: '#8a7d68' }}>No shared albums yet.</p>
            <Link to="/shared/create" className="mt-2 text-sm" style={{ color: '#7b1fa2' }}>Create your first album</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((album) => (
              <div
                key={album._id}
                className="group rounded-sm overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: '#fefcf7',
                  padding: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(44,36,22,0.06)',
                }}
              >
                <Link to={`/shared/${album._id}`} className="block">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate" style={{ fontFamily: 'Caveat, cursive', fontSize: '18px', color: '#2c2416' }}>
                      {album.title}
                    </h3>
                    <span className="shrink-0 text-[10px] ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ede6d8', color: '#8a7d68' }}>
                      {album.mediaIds.length} items
                    </span>
                  </div>
                  {album.description && (
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: '#8a7d68' }}>{album.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs" style={{ color: '#8a7d68' }}>
                    <span>{album.members.length} member{album.members.length !== 1 ? 's' : ''}</span>
                    <span className="font-mono opacity-60">#{album.inviteCode.slice(0, 6)}</span>
                  </div>
                </Link>
                <div className="mt-3 flex -space-x-2">
                  {album.mediaIds.slice(0, 4).map((m) => (
                    <div key={m._id} className="w-7 h-7 rounded-full border-2 overflow-hidden hover:scale-110 transition-transform" style={{ borderColor: '#fefcf7' }}>
                      {m.type === 'video' ? (
                        <video src={m.cloudinary_url} className="w-full h-full object-cover" muted preload="metadata" />
                      ) : (
                        <img src={m.cloudinary_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                  ))}
                  {album.mediaIds.length > 4 && (
                    <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-medium" style={{ backgroundColor: '#ede6d8', borderColor: '#fefcf7', color: '#8a7d68' }}>
                      +{album.mediaIds.length - 4}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleDelete(album._id)}
                    className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    style={{ color: '#c0392b' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
