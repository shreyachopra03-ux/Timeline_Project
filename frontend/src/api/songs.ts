import api from './axios';

export interface SongItem {
  _id: string
  clerkId: string
  title: string
  artist?: string
  url: string
  public_id: string
  duration: number
  fileSize?: number
  createdAt: string
  updatedAt: string
};

export interface SongListResponse {
  success: boolean
  count: number
  data: SongItem[]
};

export interface SongResponse {
  success: boolean
  message?: string
  data: SongItem
};

export async function searchSongs(query: string) {
  const { data } = await api.get<SongListResponse>(`/api/songs/search?q=${encodeURIComponent(query)}`)
  return data
};

export async function getAllSongs() {
  const { data } = await api.get<SongListResponse>('/api/songs')
  return data
};

export async function uploadSong(file: File, title?: string, artist?: string) {
  const form = new FormData()
  form.append('audio', file)
  if (title) form.append('title', title)
  if (artist) form.append('artist', artist)
  const { data } = await api.post<SongResponse>('/api/songs/upload', form)
  return data
};

export async function deleteSong(id: string) {
  const { data } = await api.delete(`/api/songs/${id}`)
  return data
};
