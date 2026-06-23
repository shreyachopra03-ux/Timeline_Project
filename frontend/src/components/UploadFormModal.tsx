import { useState, useCallback, useRef } from 'react';

interface Props {
  onClose: () => void
  onUpload: (file: File, title: string, caption: string) => Promise<void>
};

export default function UploadFormModal({ onClose, onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type.startsWith('image/') || f.type.startsWith('video/'))) {
      setFile(f)
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file, title, caption)
    } finally {
      setUploading(false)
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(20, 14, 5, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-lg shadow-2xl w-full max-w-md mx-4 animate-slide-up"
        style={{ backgroundColor: '#fefcf7', padding: '32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: '#2c2416' }}>
            New Memory
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#ede6d8' }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all mb-5"
          style={{
            height: '160px',
            borderColor: dragging ? '#ce93d8' : '#c8bfad',
            backgroundColor: dragging ? '#f3e5f5' : '#f5f0e8',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
          />
          {!file ? (
            <>
              <svg viewBox="0 0 24 24" className="w-7 h-7 mb-2" stroke="#8a7d68" strokeWidth="2" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#8a7d68' }}>
                Drop photo or video here
              </p>
              <p style={{ fontFamily: 'Caveat, cursive', fontSize: '13px', color: '#b5a898' }}>
                or click to browse
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#e8d5b7' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="#7b4f1e" strokeWidth="2" fill="none">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <p style={{ fontFamily: 'Caveat, cursive', fontSize: '16px', color: '#5c4f3a' }}>
                {file.name}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#8a7d68', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A beautiful sunset..."
              className="w-full rounded-md px-3 py-2 mt-1 outline-none transition-colors"
              style={{
                border: '1px solid #c8bfad',
                fontFamily: 'Caveat, cursive',
                fontSize: '17px',
                backgroundColor: '#f5f0e8',
                color: '#2c2416',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ce93d8' }}
              onBlur={(e) => { e.target.style.borderColor = '#c8bfad' }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#8a7d68', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Caption
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's the story?"
              className="w-full rounded-md px-3 py-2 mt-1 outline-none transition-colors"
              style={{
                border: '1px solid #c8bfad',
                fontFamily: 'Caveat, cursive',
                fontSize: '17px',
                backgroundColor: '#f5f0e8',
                color: '#2c2416',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ce93d8' }}
              onBlur={(e) => { e.target.style.borderColor = '#c8bfad' }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full mt-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          style={{ backgroundColor: '#2c2416', color: '#fefcf7', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 500 }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
          </svg>
          {uploading ? 'Adding...' : 'Add to Timeline'}
        </button>
      </div>
    </div>
  )};
