import { expertise as defaultExpertise } from '@/lib/site-content'
import { SectionLabel } from '@/components/section-label'
import { SiteContent } from '@/lib/types'

interface ExpertiseProps {
  content?: SiteContent
}

export function Expertise({ content }: ExpertiseProps) {
  const list = content?.expertise && content.expertise.length > 0 ? content.expertise : defaultExpertise

  return (
    <section
      id="expertise"
      className="border-b border-border py-20 md:py-28"
      aria-labelledby="expertise-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel>Disciplines</SectionLabel>
        <h2
          id="expertise-heading"
          className="mt-6 text-balance text-3xl font-medium tracking-tight sm:text-4xl"
        >
          Expertise in
        </h2>

        <ul className="mt-12 border-t border-border">
          {list.map((item, idx) => (
            <li
              key={item.title || idx}
              className="group border-b border-border transition-colors hover:bg-card"
            >
              <div className="flex flex-col gap-6 py-8 md:flex-row md:items-start md:gap-12">
                <span className="font-mono text-xs tracking-[0.2em] text-primary md:w-16 md:pt-2">
                  {item.index || (idx + 1).toString().padStart(2, '0')}
                </span>

                <h3 className="text-2xl font-medium tracking-tight md:w-64 md:shrink-0">
                  {item.title}
                </h3>

                <div className="flex flex-1 flex-col gap-4">
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  {item.tools && item.tools.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {item.tools.map((tool) => (
                        <li
                          key={tool}
                          className="border border-border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground"
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
