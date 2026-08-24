'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Play, X, Eye, Sparkles } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { Project, ProjectCategory } from '@/lib/types'
import { DEFAULT_PROJECTS } from '@/lib/firestore-service'
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from '@/lib/youtube-utils'
import { cn } from '@/lib/utils'

interface ReelGalleryProps {
  initialProjects?: Project[]
}

const CATEGORIES: { label: string; value: 'all' | ProjectCategory }[] = [
  { label: 'All Works', value: 'all' },
  { label: '3D Game Assets', value: 'game-asset' },
  { label: '3D Visualization', value: '3d-viz' },
  { label: 'Graphic Design', value: 'graphic-design' },
  { label: 'Photography', value: 'photography' },
]

export function ReelGallery({ initialProjects }: ReelGalleryProps) {
  const [projectsList, setProjectsList] = useState<Project[]>(
    initialProjects && initialProjects.length > 0 ? initialProjects : DEFAULT_PROJECTS
  )
  const [activeCategory, setActiveCategory] = useState<'all' | ProjectCategory>('all')
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjectsList(initialProjects)
    }
  }, [initialProjects])

  useEffect(() => {
    if (!activeProject) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activeProject])

  const filteredProjects = projectsList.filter((item) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  )

  const activeYtEmbed = activeProject ? getYouTubeEmbedUrl(activeProject.videoUrl) : null

  return (
    <section
      id="reel"
      className="border-b border-border py-20 md:py-28"
      aria-labelledby="reel-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel>Selected work</SectionLabel>
            <h2
              id="reel-heading"
              className="mt-6 text-balance text-3xl font-medium tracking-tight sm:text-4xl"
            >
              Featured Works & Visualizations
            </h2>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {filteredProjects.length.toString().padStart(2, '0')} assets displayed
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                'border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] transition-all',
                activeCategory === cat.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry / Zero-CLS Gallery Grid */}
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((item) => {
            const thumbUrl = item.imageUrl || getYouTubeThumbnail(item.videoUrl) || '/renders/hero-asset.png'
            const hasVideo = Boolean(item.videoUrl)

            return (
              <li
                key={item.id || item.title}
                className={cn(item.featured && 'sm:col-span-2 lg:row-span-2')}
              >
                <button
                  type="button"
                  onClick={() => setActiveProject(item)}
                  className="group relative block h-full w-full overflow-hidden border border-border bg-card text-left transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none"
                >
                  <div
                    className={cn(
                      'relative w-full',
                      item.featured
                        ? 'aspect-video lg:aspect-4/3'
                        : 'aspect-video'
                    )}
                    style={{
                      aspectRatio:
                        item.width && item.height
                          ? `${item.width} / ${item.height}`
                          : undefined,
                    }}
                  >
                    <Image
                      src={thumbUrl}
                      alt={item.description || item.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-4 flex size-9 items-center justify-center border border-border bg-background/70 backdrop-blur-sm transition-colors group-hover:border-primary group-hover:text-primary"
                    >
                      {hasVideo ? (
                        <Play className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </span>

                    {item.featured && (
                      <span className="absolute right-4 top-4 flex items-center gap-1 bg-primary px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-primary-foreground">
                        <Sparkles className="size-3" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-primary">
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Lightbox / YouTube Player Modal */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="hud-corners relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full overflow-hidden border border-border bg-card">
              {activeYtEmbed ? (
                <iframe
                  key={activeYtEmbed}
                  src={activeYtEmbed}
                  title={activeProject.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="size-full border-0"
                />
              ) : activeProject.videoUrl ? (
                <video
                  key={activeProject.videoUrl}
                  src={activeProject.videoUrl}
                  poster={activeProject.imageUrl || getYouTubeThumbnail(activeProject.videoUrl) || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="size-full object-contain"
                />
              ) : (
                <Image
                  src={activeProject.imageUrl || getYouTubeThumbnail(activeProject.videoUrl) || '/renders/hero-asset.png'}
                  alt={activeProject.description || activeProject.title}
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 56rem, 100vw"
                  className="object-contain"
                />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">{activeProject.title}</span>
                <span className="truncate font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {activeProject.category} · {activeProject.width} × {activeProject.height} px
                </span>
                {activeProject.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeProject.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="flex shrink-0 items-center gap-2 border border-border px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                Close
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
