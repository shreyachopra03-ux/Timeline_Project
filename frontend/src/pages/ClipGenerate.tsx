import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTimeline } from '../api/media';
import { generateClip } from '../api/clips';
import { getAllSongs } from '../api/songs';
import MediaCard from '../components/MediaCard';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import type { MediaItem } from '../api/media';
import type { SongItem } from '../api/songs';

const YOUTUBE_LIBRARY_FALLBACKS: SongItem[] = [
  {
    _id: "yt-1",
    clerkId: "system",
    title: "Crock Pot (Lofi Hip Hop)",
    artist: "Diamond Ortiz",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    public_id: "yt_track_1",
    duration: 180,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "yt-2",
    clerkId: "system",
    title: "As You Fade Away (Cinematic)",
    artist: "NEFFEX",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    public_id: "yt_track_2",
    duration: 210,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "yt-3",
    clerkId: "system",
    title: "Sunny Days (Pop/Cheerful)",
    artist: "Anno Domini Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    public_id: "yt_track_3",
    duration: 145,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function ClipGenerate() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [songs, setSongs] = useState<SongItem[]>(YOUTUBE_LIBRARY_FALLBACKS);
  const [selectedSongUrl, setSelectedSongUrl] = useState<string>('');
  const [volume, setVolume] = useState<number>(30);
  const [title, setTitle] = useState('My Timeline Clip');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getTimeline().catch(() => ({ data: [] })),
      getAllSongs().catch(() => ({ data: [] }))
    ])
      .then(([mediaRes, songsRes]) => {
        if (mediaRes && mediaRes.data) setMedia(mediaRes.data);
        const dbSongs = songsRes && songsRes.data ? songsRes.data : [];
        setSongs([...YOUTUBE_LIBRARY_FALLBACKS, ...dbSongs]);
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching data:", err)
        setLoading(false)
      })
  }, []);

  const handleGenerate = async () => {
    if (selected.length === 0) { toast('Select at least one media item.', 'error'); return };
    if (!title.trim()) { toast('Enter a title.', 'error'); return };

    setGenerating(true)
    try {
      const res = await generateClip(
        selected, 
        title.trim(), 
        selectedSongUrl || undefined, 
        (volume / 100) as any
      )
      toast('Clip generated with music config!', 'success')
      navigate(`/clips/${res.data._id}`)
    } catch (err: any) {
      toast(err?.message || 'Error generating clip.', 'error')
    } finally {
      setGenerating(false)
    }
  };

  return (
    <>
      <PageHeader title="Generate Clip" subtitle="Select media and background score to create a new clip" />
      <main className="max-w-6xl mx-auto pt-6 px-8 pb-6 space-y-6">
        
        <div
          className="rounded-sm overflow-hidden p-5 space-y-5"
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
              className="w-full rounded-md px-3 py-2 mt-1 outline-none transition-colors text-sm"
              style={{
                border: '1px solid #c8bfad',
                backgroundColor: '#f5f0e8',
                color: '#2c2416',
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8a7d68' }}>
              Background Music
            </label>
            <div className="mt-1.5 space-y-0.5">
              <button
                onClick={() => setSelectedSongUrl('')}
                className="w-full text-left px-3 py-2 text-sm rounded-sm transition-colors"
                style={{
                  color: selectedSongUrl === '' ? '#2c2416' : '#8a7d68',
                  backgroundColor: selectedSongUrl === '' ? '#ede6d8' : 'transparent',
                  fontWeight: selectedSongUrl === '' ? 600 : 400,
                }}
              >
                🚫 No Background Music
              </button>
              {songs.map((song) => (
                <button
                  key={song._id}
                  onClick={() => setSelectedSongUrl(song.url)}
                  className="w-full text-left px-3 py-2 text-sm rounded-sm transition-colors hover:bg-[#e8e0d0]"
                  style={{
                    color: selectedSongUrl === song.url ? '#2c2416' : '#5c4f3a',
                    backgroundColor: selectedSongUrl === song.url ? '#ede6d8' : 'transparent',
                    fontWeight: selectedSongUrl === song.url ? 600 : 400,
                  }}
                >
                  🎵 {song.title}
                  {song.artist ? <span className="text-xs ml-1" style={{ color: '#8a7d68' }}>by {song.artist}</span> : null}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: '#8a7d68' }}>
              <a href="/songs" className="underline hover:text-[#2c2416]">Upload your own songs</a> to appear here
            </p>
          </div>

          {selectedSongUrl && (
            <div className="p-3 rounded-md border border-dashed transition-all" style={{ borderColor: '#c8bfad', backgroundColor: '#fdfbf7' }}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium tracking-wider" style={{ color: '#5c4f3a' }}>
                  🎛️ Background Music Volume
                </label>
                <span className="text-xs font-bold text-purple-700">{volume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-[10px] mt-1 text-gray-500">
                Tip: Keep it around 20-30% if your videos already have talking audio!
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || selected.length === 0 || !title.trim()}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}
          >
            {generating ? 'Generating...' : `Generate Clip (${selected.length} item${selected.length !== 1 ? 's' : ''} selected)`}
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
        ) : !media || media.length === 0 ? (
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
                  selected={selected.includes(item._id)}
                  onToggle={() => {
                    setSelected((prev) =>
                      prev.includes(item._id)
                        ? prev.filter((id) => id !== item._id)
                        : [...prev, item._id]
                    )
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
)};