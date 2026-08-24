import { cn } from '@/lib/utils'

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-primary" />
      {children}
    </p>
  )
}
