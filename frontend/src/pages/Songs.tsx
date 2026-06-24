import { useEffect, useState, useCallback, useRef } from 'react'
import { getAllSongs, uploadSong, deleteSong } from '../api/songs'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import type { SongItem } from '../api/songs'

export default function Songs() {
  const [songs, setSongs] = useState<SongItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const load = () => {
    setLoading(true)
    getAllSongs().then((res) => setSongs(res.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const results = await Promise.allSettled(Array.from(files).map((f) => uploadSong(f)))
      const ok = results.filter((r) => r.status === 'fulfilled').length
      const fail = results.filter((r) => r.status === 'rejected').length
      if (ok > 0) {
        toast(`${ok} song${ok > 1 ? 's' : ''} uploaded.`, 'success')
        load()
      }
      if (fail > 0) toast(`${fail} upload${fail > 1 ? 's' : ''} failed.`, 'error')
    } catch {
      toast('Upload error.', 'error')
    } finally {
      setUploading(false)
    }
  }, [toast])

  const handleDelete = async (id: string) => {
    await deleteSong(id)
    toast('Song deleted.', 'success')
    load()
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      <PageHeader
        title="Songs"
        subtitle={`${songs.length} song${songs.length !== 1 ? 's' : ''}`}
      />
      <main className="max-w-6xl mx-auto pt-6 px-8 pb-6 space-y-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer"
          style={{ borderColor: '#c8bfad', backgroundColor: '#f5f0e8' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="text-sm" style={{ color: '#8a7d68' }}>
            {uploading ? 'Uploading...' : 'Click to browse audio files'}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 rounded-sm" style={{ backgroundColor: '#ede6d8' }} />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '20px', color: '#8a7d68' }}>No songs yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song) => (
              <div
                key={song._id}
                className="flex items-center gap-3 px-4 py-3 rounded-sm transition-colors"
                style={{ backgroundColor: '#fefcf7', border: '1px solid #ede6d8' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#2c2416' }}>{song.title}</p>
                  {song.artist && (
                    <p className="text-xs truncate" style={{ color: '#8a7d68' }}>{song.artist}</p>
                  )}
                </div>
                {song.duration > 0 && (
                  <span className="text-xs shrink-0" style={{ color: '#8a7d68' }}>{formatDuration(song.duration)}</span>
                )}
                <audio
                  src={song.url}
                  controls
                  className="h-8 w-36 shrink-0"
                  style={{ filter: 'sepia(0.2)' }}
                />
                <button
                  onClick={() => handleDelete(song._id)}
                  className="text-xs shrink-0 px-2 py-1 rounded transition-colors hover:bg-red-50"
                  style={{ color: '#c0392b' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
