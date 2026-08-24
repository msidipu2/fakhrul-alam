export type ProjectCategory = 'game-asset' | '3d-viz' | 'graphic-design' | 'photography'

export interface Project {
  id?: string
  title: string
  category: ProjectCategory
  description?: string
  imageUrl: string
  imagePath?: string // Storage path for deletion
  videoUrl?: string // Optional video/reel URL
  width: number // Extracted width for Zero-CLS Masonry
  height: number // Extracted height for Zero-CLS Masonry
  order: number // Sorting index
  featured?: boolean
  createdAt?: any
}

export interface Achievement {
  id?: string
  title: string
  issuer: string
  date: string
  imageUrl?: string
  imagePath?: string
  order: number
}

export interface StatItem {
  value: string
  title: string
  note: string
}

export interface ExpertiseItem {
  index?: string
  title: string
  description: string
  tools: string[]
}

export interface TimelineItem {
  date: string
  year: string
  title: string
  description: string
}

export interface SocialLinks {
  facebook: string
  linkedin: string
  artstation: string
  behance: string
  instagram: string
}

export interface SiteContent {
  profile: {
    name: string
    greeting: string
    role: string
  }
  heroBeautyPass: {
    imageUrl: string
    caption: string
    renderEngine: string
    samples: string
    resolution: string
  }
  stats: StatItem[]
  socials: { label: string; href: string }[]
  aboutStory: string
  email: string
  expertise: ExpertiseItem[]
  journey: TimelineItem[]
  clients: { name: string; logo?: string }[]
}
