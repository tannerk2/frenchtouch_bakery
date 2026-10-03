import { remove, uploadData } from 'aws-amplify/storage'
import './aws'
import { CONTENT_PATH, type PhotoShape, type SiteContent } from './site-data'

// Writes go straight to the content bucket using the signed-in admin's temporary AWS credentials.
// The IAM role only allows writing data/site.json and writing or deleting uploads/*.

export async function saveSiteContent(content: SiteContent) {
  await uploadData({
    path: CONTENT_PATH,
    data: JSON.stringify(content),
    options: { contentType: 'application/json', cacheControl: 'no-cache' },
  }).result
}

const UPLOAD_PREFIX = '/uploads/'

function uploadedImages(content: SiteContent) {
  return new Set(
    [...content.menu.map((item) => item.image), ...content.photos.map((photo) => photo.src)].filter((src) =>
      src.startsWith(UPLOAD_PREFIX),
    ),
  )
}

// Removes uploads that `previous` used and `next` no longer does. Bucket versioning keeps a copy for 90 days.
export async function deleteUnusedUploads(previous: SiteContent, next: SiteContent) {
  const kept = uploadedImages(next)
  const unused = [...uploadedImages(previous)].filter((src) => !kept.has(src))
  await Promise.allSettled(unused.map((src) => remove({ path: src.slice(1) })))
}

// Phone photos are often 3–10 MB, so they are shrunk to a web-friendly JPEG before uploading.
export async function uploadImage(file: File): Promise<{ src: string; shape: PhotoShape }> {
  const { blob, width, height } = await resizeImage(file)
  const path = `uploads/${crypto.randomUUID()}.jpg`
  await uploadData({
    path,
    data: blob,
    options: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' },
  }).result
  const ratio = width / height
  return { src: `/${path}`, shape: ratio < 0.9 ? 'portrait' : ratio > 1.15 ? 'landscape' : 'square' }
}

const MAX_EDGE = 1600
const JPEG_QUALITY = 0.82

async function resizeImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not supported in this browser')
  // JPEG has no transparency, so transparent PNGs get a white background instead of black.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob) throw new Error('Could not convert the photo')
  return { blob, width, height }
}
