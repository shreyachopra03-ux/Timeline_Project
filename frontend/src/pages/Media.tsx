import { useEffect, useState, useCallback, useRef } from 'react'
import { uploadMedia, getTimeline, deleteMedia } from '../api/media'
import MediaCard from '../components/MediaCard'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import type { MediaItem } from '../api/media'

export default function Media() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const load = () => {
    setLoading(true)
    getTimeline().then((res) => setMedia(res.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const results = await Promise.allSettled(Array.from(files).map((f) => uploadMedia(f)))
      const ok = results.filter((r) => r.status === 'fulfilled').length
      const fail = results.filter((r) => r.status === 'rejected').length
      if (ok > 0) {
        toast(`${ok} file${ok > 1 ? 's' : ''} uploaded.`, 'success')
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
    await deleteMedia(id)
    toast('Media deleted.', 'success')
    load()
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    await Promise.all(ids.map((id) => deleteMedia(id)))
    toast(`${ids.length} file${ids.length > 1 ? 's' : ''} deleted.`, 'success')
    setSelected(new Set())
    setSelectMode(false)
    load()
  }

  return (
    <>
      <PageHeader
        title="Media"
        subtitle={`${media.length} file${media.length !== 1 ? 's' : ''}`}
      />
      <main className="max-w-6xl mx-auto pt-6 px-8 pb-6 space-y-6">
        {selectMode && selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{ backgroundColor: '#c0392b', color: 'white' }}
          >
            Delete {selected.size} selected
          </button>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer"
          style={{ borderColor: '#c8bfad', backgroundColor: '#f5f0e8' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="text-sm" style={{ color: '#8a7d68' }}>
            {uploading ? 'Uploading...' : 'Click to browse media files'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()) }}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{
              backgroundColor: selectMode ? '#2c2416' : '#ede6d8',
              color: selectMode ? '#fefcf7' : '#2c2416',
            }}
          >
            {selectMode ? 'Done' : 'Select'}
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
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '20px', color: '#8a7d68' }}>No media yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <MediaCard
                key={item._id}
                item={item}
                selectable={selectMode}
                selected={selected.has(item._id)}
                onToggle={() => {
                  const next = new Set(selected)
                  next.has(item._id) ? next.delete(item._id) : next.add(item._id)
                  setSelected(next)
                }}
                onDelete={selectMode ? undefined : handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
