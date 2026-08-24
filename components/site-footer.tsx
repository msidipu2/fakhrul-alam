import { ArrowUpRight } from 'lucide-react'
import { profile as defaultProfile, socials as defaultSocials } from '@/lib/site-content'
import { SectionLabel } from '@/components/section-label'
import { SiteContent } from '@/lib/types'

interface SiteFooterProps {
  content?: SiteContent
}

export function SiteFooter({ content }: SiteFooterProps) {
  const profile = content?.profile || defaultProfile
  const socials = content?.socials !== undefined ? content.socials : defaultSocials

  return (
    <footer id="contact" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-6">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="max-w-2xl text-balance text-3xl font-medium tracking-tight sm:text-5xl">
              Have an asset, a render or a campaign in mind?
            </h2>
          </div>

          <ul className="flex flex-col gap-px bg-border lg:w-64">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-background px-4 py-3.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {social.label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {profile.name}
          </p>
          <p>3D Generalist · Game Assets · Multimedia</p>
        </div>
      </div>
    </footer>
  )
}
