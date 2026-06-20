import api from './axios'

export interface MediaItem {
  _id: string
  public_id: string
  cloudinary_url: string
  type: 'image' | 'video'
  duration: number
  clerkId: string
  fileName?: string
  fileSize?: number
  createdAt: string
  updatedAt: string
}

export interface MediaListResponse {
  success: boolean
  message: string
  count: number
  data: MediaItem[]
}

export async function getTimeline(from?: string, to?: string) {
  const params: Record<string, string> = {}
  if (from) params.from = from
  if (to) params.to = to
  const { data } = await api.get<MediaListResponse>('/media/timeline', { params })
  return data
}

export async function uploadMedia(file: File, title?: string) {
  const form = new FormData()
  form.append('media', file)
  if (title) form.append('title', title)
  const { data } = await api.post('/media/upload', form)
  return data
}

export async function uploadBulkMedia(files: File[]) {
  const form = new FormData()
  files.forEach((f) => form.append('media', f))
  const { data } = await api.post('/media/upload-bulk', form)
  return data
}

export async function deleteMedia(id: string) {
  const { data } = await api.delete(`/media/${id}`)
  return data
}

export async function deleteBulkMedia(ids: string[]) {
  const { data } = await api.delete('/media/bulk-delete', { data: { ids } })
  return data
}
