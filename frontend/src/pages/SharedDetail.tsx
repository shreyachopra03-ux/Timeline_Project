import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSharedAlbum, addPhotoToAlbum, removePhotoFromAlbum, inviteMember, removeMember, deleteSharedAlbum } from '../api/shared';
import { getTimeline } from '../api/media';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import type { SharedItem } from '../api/shared';
import type { MediaItem } from '../api/media';

export default function SharedDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<SharedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [inviteClerkId, setInviteClerkId] = useState('');
  const [inviteName, setInviteName] = useState('');
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return
    getSharedAlbum(id)
      .then((res) => setAlbum(res.data))
      .catch((err: any) => { toast(err.message, 'error'); navigate('/shared') })
      .finally(() => setLoading(false))
  }, [id, navigate, toast]);

  const loadMedia = async () => {
    setMediaLoading(true)
    try {
      const res = await getTimeline()
      setAllMedia(res.data)
    } catch (err: any) { toast(err.message, 'error') }
    finally { setMediaLoading(false) }
  };

  const handleAddPhoto = async (mediaId: string) => {
    if (!album) return
    try {
      const res = await addPhotoToAlbum(album._id, mediaId)
      setAlbum(res.data)
      toast('Photo added', 'success')
    } catch (err: any) { toast(err.message, 'error') }
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (!album) return
    try {
      const res = await removePhotoFromAlbum(album._id, photoId)
      setAlbum(res.data)
      toast('Photo removed', 'success')
    } catch (err: any) { toast(err.message, 'error') }
  };

  const handleInvite = async () => {
    if (!album || !inviteClerkId.trim()) return
    try {
      const res = await inviteMember(album._id, inviteClerkId.trim(), inviteName.trim() || undefined)
      setAlbum(res.data)
      setInviteClerkId('')
      setInviteName('')
      toast('Member invited!', 'success')
    } catch (err: any) { toast(err.message, 'error') }
  };

  const handleRemoveMember = async (clerkId: string) => {
    if (!album) return
    try {
      const res = await removeMember(album._id, clerkId)
      setAlbum(res.data)
      toast('Member removed', 'success')
    } catch (err: any) { toast(err.message, 'error') }
  };

  const handleDelete = async () => {
    if (!album) return
    try {
      await deleteSharedAlbum(album._id)
      toast('Album deleted', 'success')
      navigate('/shared')
    } catch (err: any) { toast(err.message, 'error') }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pt-8 px-8">
        <div className="animate-pulse rounded-sm overflow-hidden p-5" style={{ backgroundColor: '#ede6d8' }}>
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
    )
  };

  if (!album) return null;

  const isOwner = album.ownerId === user?.id;

  return (
    <>
      <PageHeader title={album.title} />
      <main className="max-w-5xl mx-auto pt-6 px-8 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/shared" className="text-sm inline-flex items-center gap-1" style={{ color: '#8a7d68' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Albums
          </Link>
          {isOwner && (
            <button onClick={handleDelete} className="text-xs font-medium px-3 py-1.5 rounded-full transition-all" style={{ backgroundColor: '#c0392b', color: 'white' }}>
              Delete Album
            </button>
          )}
        </div>

        {album.description && (
          <p className="text-sm" style={{ color: '#8a7d68' }}>{album.description}</p>
        )}

        <p className="text-xs font-mono" style={{ color: '#8a7d68' }}>
          Invite Code: <span style={{ color: '#7b1fa2' }}>#{album.inviteCode}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
                Media ({album.mediaIds.length})
              </h2>
              {isOwner && (
                <button
                  onClick={() => { setShowAddMedia(!showAddMedia); if (!showAddMedia) loadMedia() }}
                  className="text-xs transition-colors" style={{ color: '#7b1fa2' }}
                >
                  {showAddMedia ? 'Cancel' : '+ Add Media'}
                </button>
              )}
            </div>

            {showAddMedia && (
              <div className="rounded-sm overflow-hidden p-4 max-h-60 overflow-y-auto" style={{ backgroundColor: '#fefcf7', border: '1px solid rgba(44,36,22,0.08)' }}>
                {mediaLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#ce93d8', borderTopColor: 'transparent' }} />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {allMedia.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => handleAddPhoto(m._id)}
                        className="rounded-sm overflow-hidden aspect-[4/3] transition-colors"
                        style={{ border: '1px solid rgba(44,36,22,0.1)' }}
                      >
                        {m.type === 'video' ? (
                          <video src={m.cloudinary_url} className="w-full h-full object-cover" muted preload="metadata" />
                        ) : (
                          <img src={m.cloudinary_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {album.mediaIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 rounded-sm" style={{ backgroundColor: 'rgba(237,230,216,0.5)', border: '1px dashed #c8bfad' }}>
                <p className="text-sm" style={{ color: '#8a7d68' }}>No media in this album yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {album.mediaIds.map((m) => (
                  <div key={m._id} className="group relative rounded-sm overflow-hidden" style={{ backgroundColor: '#fefcf7', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {m.type === 'video' ? (
                      <video src={m.cloudinary_url} className="w-full aspect-[4/3] object-cover" muted preload="metadata" />
                    ) : (
                      <img src={m.cloudinary_url} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
                    )}
                    {isOwner && (
                      <button
                        onClick={() => handleRemovePhoto(m._id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: '#c0392b', color: 'white' }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-sm overflow-hidden p-5 space-y-4" style={{ backgroundColor: '#fefcf7', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
              Members ({album.members.length + 1})
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 py-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}>
                  Y
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium" style={{ color: '#2c2416' }}>You <span className="text-xs" style={{ color: '#7b1fa2' }}>(Owner)</span></p>
                </div>
              </div>
              {album.members.map((m) => (
                <div key={m.clerkId} className="flex items-center gap-2.5 py-1 group hover:bg-[#ede6d8] rounded-md px-2 -mx-2 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#ede6d8', color: '#8a7d68' }}>
                    {(m.name || m.clerkId)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: '#2c2416' }}>{m.name || m.clerkId}</p>
                    {m.email && <p className="text-xs truncate" style={{ color: '#8a7d68' }}>{m.email}</p>}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveMember(m.clerkId)}
                      className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#c0392b' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isOwner && (
              <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(44,36,22,0.08)' }}>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#8a7d68' }}>Invite Member</p>
                <input
                  value={inviteClerkId}
                  onChange={(e) => setInviteClerkId(e.target.value)}
                  placeholder="Clerk ID"
                  className="w-full rounded-md px-3 py-2 outline-none transition-colors text-sm"
                  style={{ border: '1px solid #c8bfad', backgroundColor: '#f5f0e8', color: '#2c2416' }}
                />
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Name (optional)"
                  className="w-full rounded-md px-3 py-2 outline-none transition-colors text-sm"
                  style={{ border: '1px solid #c8bfad', backgroundColor: '#f5f0e8', color: '#2c2416' }}
                />
                <button
                  onClick={handleInvite}
                  disabled={!inviteClerkId.trim()}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}
                >
                  Invite
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
)};
