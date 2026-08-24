/**
 * Extracts YouTube Video ID from standard, shortened, or embed URLs.
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Returns High-Resolution YouTube Thumbnail URL.
 */
export function getYouTubeThumbnail(url?: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * Returns Standard YouTube Embed URL with autoplay.
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
}
