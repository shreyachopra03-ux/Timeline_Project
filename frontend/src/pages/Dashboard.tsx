import { useEffect, useState, useCallback } from 'react'
import { getTimeline, uploadMedia, deleteMedia } from '../api/media'
import { useToast } from '../components/Toast'
import Header from '../components/Header'
import PolaroidCard from '../components/PolaroidCard'
import MemoryDetailModal from '../components/MemoryDetailModal'
import UploadFormModal from '../components/UploadFormModal'
import { getYearColor } from '../components/PolaroidCard'
import type { MediaItem } from '../api/media'

export default function Dashboard() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<MediaItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const { toast } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    getTimeline()
      .then((res) => setMedia(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Group media by year
  const grouped = media.reduce<Record<string, MediaItem[]>>((acc, item) => {
    const year = new Date(item.createdAt).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(item)
    return acc
  }, {})

  const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a))

  const handleOpenMemory = (item: MediaItem) => {
    const allItems = years.flatMap((y) => grouped[y])
    const idx = allItems.findIndex((m) => m._id === item._id)
    setSelectedIndex(idx)
    setSelectedMemory(item)
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMedia(id)
      setSelectedMemory(null)
      toast('Memory deleted.', 'success')
      load()
    } catch {
      toast('Error deleting memory.', 'error')
    }
  }

  const handleUpload = async (file: File, title: string, caption: string) => {
    try {
      await uploadMedia(file, title || caption || undefined)
      toast('Memory added to timeline!', 'success')
      setShowUpload(false)
      load()
    } catch {
      toast('Error uploading memory.', 'error')
    }
  }

  return (
    <>
      <Header mediaCount={media.length} onAddMemory={() => setShowUpload(true)} />

      <main className="px-8 pt-10 pb-6">
        {/* Hero Section */}
        <div className="mb-16 animate-slide-up">
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.1, color: '#2c2416' }}>
            Your Life,<br />
            <span style={{ fontStyle: 'italic' }}>Frame by Frame.</span>
          </h1>
          <p className="mt-3" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', color: '#8a7d68', lineHeight: 1.6, maxWidth: '500px' }}>
            Every moment, a polaroid. Scroll, explore, and look back at your story.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-wrap gap-8 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ width: '200px' }}>
                <div className="bg-gray-200 rounded-sm" style={{ padding: '10px 10px 40px 10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                  <div className="bg-gray-300" style={{ width: '180px', height: '160px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : media.length === 0 ? (
          /* CTA when no memories */
          <div className="flex flex-col items-center gap-4 py-16 animate-slide-up">
            <button
              onClick={() => setShowUpload(true)}
              className="flex flex-col items-center gap-3 transition-all px-10 py-8 rounded-2xl"
              style={{
                border: '2px dashed #c8bfad',
                color: '#8a7d68',
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8d5b7' }}>
                <svg viewBox="0 0 24 24" className="w-5.5 h-5.5" stroke="#7b4f1e" strokeWidth="2" fill="none">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </div>
              <span style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
                Add your first memory
              </span>
            </button>
          </div>
        ) : (
          /* Year sections */
          <>
            {years.map((year) => {
              const items = grouped[year]
              const c = getYearColor(year)
              return (
                <section key={year} id={`year-${year}`} className="mb-16 animate-slide-up">
                  {/* Year divider */}
                  <div className="flex items-center gap-4 mb-8">
                    <div style={{ flex: 1, height: '1px', backgroundColor: c.tape, opacity: 0.5 }} />
                    <div
                      className="px-6 py-2 rounded-full font-bold tracking-widest text-sm"
                      style={{
                        backgroundColor: c.tape,
                        color: c.label,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {year}
                    </div>
                    <div style={{ flex: 1, height: '1px', backgroundColor: c.tape, opacity: 0.5 }} />
                  </div>

                  {/* Cards grid */}
                  <div className="flex flex-wrap gap-8 justify-start items-start px-4">
                    {items.map((item, idx) => (
                      <PolaroidCard
                        key={item._id}
                        item={item}
                        year={year}
                        index={idx}
                        onOpen={handleOpenMemory}
                      />
                    ))}
                  </div>
                </section>
              )
            })}

            {/* Bottom CTA */}
            <div className="flex flex-col items-center gap-4 py-8 animate-slide-up">
              <button
                onClick={() => setShowUpload(true)}
                className="flex flex-col items-center gap-3 transition-all px-10 py-8 rounded-2xl hover:scale-105 active:scale-95"
                style={{
                  border: '2px dashed #c8bfad',
                  color: '#8a7d68',
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8d5b7' }}>
                  <svg viewBox="0 0 24 24" className="w-5.5 h-5.5" stroke="#7b4f1e" strokeWidth="2" fill="none">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
                  Add your next memory
                </span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <MemoryDetailModal
          items={years.flatMap((y) => grouped[y])}
          currentIndex={selectedIndex}
          onClose={() => setSelectedMemory(null)}
          onDelete={handleDeleteMemory}
          onPrev={() => {
            const newIdx = selectedIndex - 1
            if (newIdx >= 0) {
              const allItems = years.flatMap((y) => grouped[y])
              setSelectedIndex(newIdx)
              setSelectedMemory(allItems[newIdx])
            }
          }}
          onNext={() => {
            const allItems = years.flatMap((y) => grouped[y])
            const newIdx = selectedIndex + 1
            if (newIdx < allItems.length) {
              setSelectedIndex(newIdx)
              setSelectedMemory(allItems[newIdx])
            }
          }}
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadFormModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}
    </>
  )
}
