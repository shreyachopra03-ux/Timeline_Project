import api from './axios'

export interface ClipItem {
  _id: string
  clerkId: string
  title: string
  url: string
  public_id: string
  duration: number
  createdAt: string
  updatedAt: string
};

export interface ClipListResponse {
  success: boolean
  count: number
  data: ClipItem[]
};

export interface ClipResponse {
  success: boolean
  message?: string
  data: ClipItem
};

export async function getAllClips() {
  const { data } = await api.get<ClipListResponse>('/api/clips')
  return data
};

export async function getClip(id: string) {
  const { data } = await api.get<ClipResponse>(`/api/clips/${id}`)
  return data
};

export async function generateClip(mediaIds: string[], title?: string, audioUrl?: string, audioVolume?: number) {
  const { data } = await api.post<ClipResponse>('/api/clips/generate', { 
    mediaIds, 
    title,
    audioUrl,
    audioVolume
  })
  return data
};

export async function renameClip(id: string, title: string) {
  const { data } = await api.put<ClipResponse>(`/api/clips/${id}/rename`, { title })
  return data
};

export async function deleteClip(id: string) {
  const { data } = await api.delete(`/api/clips/${id}`)
  return data
};
