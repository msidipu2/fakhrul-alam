import { journey as defaultJourney } from '@/lib/site-content'
import { SectionLabel } from '@/components/section-label'
import { SiteContent } from '@/lib/types'

interface JourneyProps {
  content?: SiteContent
}

export function Journey({ content }: JourneyProps) {
  const journeyList = content?.journey || defaultJourney

  return (
    <section
      id="journey"
      className="relative overflow-hidden border-b border-border py-20 md:py-28"
      aria-labelledby="journey-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-blueprint opacity-25"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionLabel>Timeline</SectionLabel>
        <h2
          id="journey-heading"
          className="mt-6 max-w-xl text-balance text-3xl font-medium lowercase tracking-tight sm:text-4xl"
        >
          the journey begins here&hellip;
        </h2>

        <ol className="mt-14 flex flex-col">
          {journeyList.map((entry, i) => (
            <li key={entry.year || i} className="relative flex gap-6 sm:gap-10">
              {/* Rail */}
              <div
                aria-hidden="true"
                className="relative flex w-4 shrink-0 justify-center"
              >
                <span className="absolute inset-y-0 w-px bg-border" />
                <span className="relative mt-1.5 size-2 rotate-45 bg-primary" />
                {i === journeyList.length - 1 && (
                  <span className="absolute bottom-0 top-8 w-px bg-background" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 pb-14 sm:flex-row sm:gap-10">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary sm:w-40 sm:shrink-0 sm:pt-1">
                  {entry.date}
                </p>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-medium tracking-tight">
                    {entry.title}
                  </h3>
                  <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
