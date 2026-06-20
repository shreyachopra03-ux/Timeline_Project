import api from './axios'

export interface SharedMember {
  clerkId: string
  name?: string
  email?: string
}

export interface SharedItem {
  _id: string
  ownerId: string
  title: string
  description?: string
  mediaIds: Array<{
    _id: string
    cloudinary_url: string
    type: string
    fileName?: string
    duration?: number
  }>
  members: SharedMember[]
  inviteCode: string
  createdAt: string
  updatedAt: string
}

export interface SharedListResponse {
  success: boolean
  count: number
  data: SharedItem[]
}

export interface SharedResponse {
  success: boolean
  message?: string
  data: SharedItem
}

export interface SharedMessageResponse {
  success: boolean
  message: string
}

export async function getSharedAlbums() {
  const { data } = await api.get<SharedListResponse>('/shared')
  return data
}

export async function getSharedAlbum(id: string) {
  const { data } = await api.get<SharedResponse>(`/shared/${id}`)
  return data
}

export async function createSharedAlbum(title: string, description?: string, mediaIds?: string[]) {
  const { data } = await api.post<SharedResponse>('/shared/create', { title, description, mediaIds })
  return data
}

export async function addPhotoToAlbum(albumId: string, mediaId: string) {
  const { data } = await api.post<SharedResponse>(`/shared/${albumId}/add-photo`, { mediaId })
  return data
}

export async function removePhotoFromAlbum(albumId: string, photoId: string) {
  const { data } = await api.delete<SharedResponse>(`/shared/${albumId}/remove-photo/${photoId}`)
  return data
}

export async function inviteMember(albumId: string, clerkId: string, name?: string, email?: string) {
  const { data } = await api.post<SharedResponse>(`/shared/${albumId}/invite`, { clerkId, name, email })
  return data
}

export async function removeMember(albumId: string, clerkId: string) {
  const { data } = await api.delete<SharedResponse>(`/shared/${albumId}/remove-member/${clerkId}`)
  return data
}

export async function deleteSharedAlbum(id: string) {
  const { data } = await api.delete<SharedMessageResponse>(`/shared/${id}`)
  return data
}
