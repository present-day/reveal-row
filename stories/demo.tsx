import { type ReactNode, useCallback, useState } from 'react'

export const ITEMS = [
  { id: 1, title: 'Send invoice to Acme Co.', subtitle: 'Due tomorrow' },
  { id: 2, title: 'Review pull request #42', subtitle: 'Assigned to you' },
  { id: 3, title: 'Update staging environment', subtitle: '3 hours ago' },
  { id: 4, title: 'Call with design team', subtitle: 'Friday at 2pm' },
  { id: 5, title: 'Write release notes', subtitle: 'v1.4.0' },
]

export const CONTROL_BUTTON =
  'rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'

export function ActionButton({
  label,
  color,
  onClick,
  className,
}: {
  label: string
  color: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-full w-full text-sm font-medium text-white ${color} flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80 ${className ?? ''}`}
    >
      {label}
    </button>
  )
}

/**
 * Corner radius for buttons touching the rounded card's clipped edges.
 * Scroll containers get their own compositor layer, so the card's
 * `overflow-hidden` border-radius can't be trusted to clip them mid-scroll —
 * the outermost button in a group carries the matching radius itself.
 */
export function edgeCorners(
  side: 'left' | 'right',
  isFirst: boolean,
  isLast: boolean,
) {
  const corners: string[] = []
  if (side === 'right') {
    if (isFirst) corners.push('rounded-tr-[var(--row-radius)]')
    if (isLast) corners.push('rounded-br-[var(--row-radius)]')
  } else {
    if (isFirst) corners.push('rounded-tl-[var(--row-radius)]')
    if (isLast) corners.push('rounded-bl-[var(--row-radius)]')
  }
  return corners.join(' ')
}

export function ItemContent({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="flex min-h-[56px] flex-col justify-center px-4 py-3">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </span>
    </div>
  )
}

export function Divider() {
  return <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
}

/** The rounded list surface every scenario renders its rows into. */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[var(--row-radius)] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  )
}

type LogLine = { t: number; text: string }

export function useEventLog() {
  const [log, setLog] = useState<LogLine[]>([])
  const push = useCallback((text: string) => {
    setLog((prev) => [{ t: Date.now(), text }, ...prev].slice(0, 30))
  }, [])
  return { log, push }
}

/**
 * Scenario title, description, and a fixed event log. The log stays in the
 * story itself (not only the Actions panel) so it is visible when a story is
 * opened standalone on a phone.
 */
export function Scenario({
  title,
  description,
  log,
  children,
}: {
  title: string
  description: ReactNode
  log: LogLine[]
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-2xl pb-56">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {children}
      <section
        className="pointer-events-auto fixed bottom-0 left-0 right-0 max-h-40 overflow-y-auto border-t border-zinc-200 bg-zinc-50/95 p-2 text-left shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95"
        aria-label="Event log"
      >
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Event log
        </h2>
        {log.length === 0 ? (
          <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400">
            No events yet.
          </p>
        ) : (
          <ol className="m-0 list-decimal p-0 pl-5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
            {log.map((line) => (
              <li key={`${line.t}-${line.text}`} className="py-0.5">
                {line.text}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
