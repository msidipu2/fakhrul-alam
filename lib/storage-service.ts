import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { compressImage } from '@/lib/image-compressor'

export interface UploadProgressCallback {
  (progressPercent: number): void
}

export interface UploadResult {
  url: string
  storagePath: string
  width: number
  height: number
  sizeKB: number
}

/**
 * Uploads an image or video to Firebase Storage with a strict 3.5s fail-safe timeout.
 * If Firebase Storage is unreachable or CORS blocked, it falls back gracefully to WebP DataURL.
 */
export async function uploadMedia(
  file: File,
  folder = 'portfolio',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  // 1. Compress Image
  let uploadFile = file
  let width = 1920
  let height = 1080
  let dataUrl = ''

  if (file.type.startsWith('image/')) {
    const compressed = await compressImage(file)
    uploadFile = compressed.file
    width = compressed.width
    height = compressed.height
    dataUrl = compressed.dataUrl
  }

  // Fallback result if storage is unavailable
  const fallbackResult: UploadResult = {
    url: dataUrl || '/renders/hero-asset.png',
    storagePath: '',
    width,
    height,
    sizeKB: Math.round(uploadFile.size / 1024),
  }

  if (!storage) {
    return fallbackResult
  }

  // 2. Generate storage path
  const timestamp = Date.now()
  const sanitizedName = uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${folder}/${timestamp}_${sanitizedName}`
  const storageRef = ref(storage, storagePath)

  return new Promise((resolve) => {
    let completed = false

    // Fail-safe timer: if Firebase Storage is hanging/unreachable, resolve fallback after 3.5s
    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true
        console.warn('Firebase Storage upload timed out. Using optimized WebP DataURL fallback.')
        resolve(fallbackResult)
      }
    }, 3500)

    try {
      const uploadTask = uploadBytesResumable(storageRef, uploadFile)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (completed) return
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress && !isNaN(progress)) {
            onProgress(Math.min(99, Math.round(progress)))
          }
        },
        (error) => {
          if (completed) return
          completed = true
          clearTimeout(timeoutId)
          console.warn('Firebase Storage error, using fallback:', error)
          resolve(fallbackResult)
        },
        async () => {
          if (completed) return
          completed = true
          clearTimeout(timeoutId)
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
            if (onProgress) onProgress(100)
            resolve({
              url: downloadUrl,
              storagePath,
              width,
              height,
              sizeKB: Math.round(uploadFile.size / 1024),
            })
          } catch {
            resolve(fallbackResult)
          }
        }
      )
    } catch (err) {
      if (!completed) {
        completed = true
        clearTimeout(timeoutId)
        resolve(fallbackResult)
      }
    }
  })
}

/**
 * Deletes a file from Firebase Storage
 */
export async function deleteMedia(storagePath: string): Promise<void> {
  if (!storage || !storagePath) return
  try {
    const storageRef = ref(storage, storagePath)
    await deleteObject(storageRef)
  } catch (error) {
    console.warn('Storage deletion warning:', error)
  }
}
