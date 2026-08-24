import { aboutStory as defaultStory, clients as defaultClients } from '@/lib/site-content'
import { SectionLabel } from '@/components/section-label'
import { SiteContent } from '@/lib/types'

interface AboutProps {
  content?: SiteContent
}

export function About({ content }: AboutProps) {
  const story = content?.aboutStory || defaultStory
  const clientList = content?.clients || defaultClients

  return (
    <section
      id="about"
      className="border-b border-border py-20 md:py-28"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
          <div className="lg:w-1/3">
            <SectionLabel>Origin</SectionLabel>
            <h2
              id="about-heading"
              className="mt-6 text-balance text-3xl font-medium tracking-tight sm:text-4xl"
            >
              About Me
            </h2>
          </div>

          <div className="flex flex-col gap-10 lg:w-2/3">
            <p className="whitespace-pre-line text-pretty text-lg leading-relaxed text-muted-foreground">
              {story}
            </p>

            <div className="flex flex-col gap-5 border-t border-border pt-8">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                Companies I&apos;ve worked with
              </p>
              <ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5">
                {clientList.map((client) => (
                  <li
                    key={client.name}
                    className="flex items-center justify-center bg-background px-5 py-6"
                  >
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/70">
                      {client.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
