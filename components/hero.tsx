import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { SiteContent } from '@/lib/types'
import {
  profile as defaultProfile,
  socials as defaultSocials,
  stats as defaultStats,
} from '@/lib/site-content'

interface HeroProps {
  content?: SiteContent
}

export function Hero({ content }: HeroProps) {
  const profile = content?.profile || defaultProfile
  const stats = content?.stats || defaultStats
  const socials = content?.socials !== undefined ? content.socials : defaultSocials
  const heroBeautyPass = content?.heroBeautyPass

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border pt-28 pb-16 md:pt-36 md:pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-blueprint opacity-[0.35]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-16">
          {/* Copy */}
          <div className="flex flex-1 flex-col gap-8">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
              {profile.greeting}
            </p>

            <div className="flex flex-col gap-6">
              <h1 className="text-pretty text-5xl font-medium leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                {profile.name}
              </h1>
              <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {profile.role}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#reel"
                className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
              >
                View the reel
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-border px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                Get in touch
              </a>
            </div>
          </div>

          {/* Signature element: render viewport */}
          <div className="flex-1">
            <figure className="hud-corners relative">
              <div className="relative aspect-4/3 overflow-hidden border border-border bg-card">
                <Image
                  src={heroBeautyPass?.imageUrl || '/renders/hero-asset.png'}
                  alt="Studio render of hard-surface 3D asset"
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-tr from-background/50 via-transparent to-transparent"
                />

                {/* HUD readout */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-border bg-background/70 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                    Render complete
                  </span>
                  <span className="hidden sm:inline">
                    {heroBeautyPass?.renderEngine || 'Cycles'} · {heroBeautyPass?.samples || '512 spp'}
                  </span>
                  <span>{heroBeautyPass?.resolution || '4096 × 3072'}</span>
                </div>
              </div>
              <figcaption className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {heroBeautyPass?.caption || 'Latest beauty pass — hard-surface asset'}
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Stats */}
        <dl className="mt-16 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3 md:mt-24">
          {stats.map((stat, idx) => (
            <div
              key={stat.title || idx}
              className="flex flex-col gap-1 bg-background p-6"
            >
              <dt className="order-2 text-sm font-medium">{stat.title}</dt>
              <dd className="order-1 text-4xl font-medium tracking-tight text-primary">
                {stat.value}
              </dd>
              <p className="order-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {stat.note}
              </p>
            </div>
          ))}
        </dl>

        {/* Socials */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            Find me on
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {social.label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
