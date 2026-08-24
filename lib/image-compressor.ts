export interface CompressedImageResult {
  file: File
  dataUrl: string
  width: number
  height: number
  originalSizeKB: number
  compressedSizeKB: number
  compressionRatio: number
}

/**
 * Client-Side WebP Compression & Dimension Extractor.
 * Returns compressed file, direct dataUrl, and natural dimensions.
 */
export async function compressImage(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // If it's a video/GIF, read directly
    if (!file.type.startsWith('image/') || file.type.includes('gif')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || ''
        const img = new Image()
        img.onload = () => {
          resolve({
            file,
            dataUrl,
            width: img.naturalWidth || 1920,
            height: img.naturalHeight || 1080,
            originalSizeKB: Math.round(file.size / 1024),
            compressedSizeKB: Math.round(file.size / 1024),
            compressionRatio: 0,
          })
        }
        img.onerror = () => {
          resolve({
            file,
            dataUrl,
            width: 1920,
            height: 1080,
            originalSizeKB: Math.round(file.size / 1024),
            compressedSizeKB: Math.round(file.size / 1024),
            compressionRatio: 0,
          })
        }
        img.src = dataUrl
      }
      reader.onerror = () => reject(new Error('Failed to read file.'))
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        let width = img.naturalWidth
        let height = img.naturalHeight

        // Calculate scaled dimensions if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context could not be initialized.'))
          return
        }

        // High-quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/webp', quality)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                dataUrl: compressedDataUrl,
                width,
                height,
                originalSizeKB: Math.round(file.size / 1024),
                compressedSizeKB: Math.round(file.size / 1024),
                compressionRatio: 0,
              })
              return
            }

            const cleanFileName = file.name
              .replace(/\.[^/.]+$/, '')
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '-')

            const compressedFile = new File([blob], `${cleanFileName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            })

            const originalSizeKB = Math.round(file.size / 1024)
            const compressedSizeKB = Math.round(compressedFile.size / 1024)
            const compressionRatio = Number(
              ((1 - compressedFile.size / file.size) * 100).toFixed(1)
            )

            resolve({
              file: compressedFile,
              dataUrl: compressedDataUrl,
              width,
              height,
              originalSizeKB,
              compressedSizeKB,
              compressionRatio: Math.max(0, compressionRatio),
            })
          },
          'image/webp',
          quality
        )
      }

      img.onerror = (err) => reject(err)
    }

    reader.onerror = (err) => reject(err)
  })
}
