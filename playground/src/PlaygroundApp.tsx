import {
  REVEAL_POSITION,
  type RevealPosition,
  RevealRow,
  type RevealRowHandle,
} from '@present-day/reveal-row'
import { useCallback, useRef, useState } from 'react'

type LogLine = { t: number; text: string }

const ITEMS = [
  { id: 1, title: 'Send invoice to Acme Co.', subtitle: 'Due tomorrow' },
  { id: 2, title: 'Review pull request #42', subtitle: 'Assigned to you' },
  { id: 3, title: 'Update staging environment', subtitle: '3 hours ago' },
  { id: 4, title: 'Call with design team', subtitle: 'Friday at 2pm' },
  { id: 5, title: 'Write release notes', subtitle: 'v1.4.0' },
]

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-full w-full text-sm font-medium text-white ${color} flex items-center justify-center gap-1`}
    >
      {label}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {children}
    </h2>
  )
}

function Description({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm text-zinc-500">{children}</p>
}

function ItemContent({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[56px] flex-col justify-center px-4 py-3">
      <span className="text-sm font-medium text-zinc-900">{title}</span>
      <span className="text-xs text-zinc-500">{subtitle}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-zinc-200" />
}

export function PlaygroundApp() {
  const [log, setLog] = useState<LogLine[]>([])
  const refMap = useRef<Map<number, RevealRowHandle>>(new Map())

  const pushLog = useCallback((text: string) => {
    setLog((prev) => [{ t: Date.now(), text }, ...prev].slice(0, 30))
  }, [])

  const onRevealChange = useCallback(
    (id: number, pos: RevealPosition) => {
      pushLog(`item ${id}: onRevealChange → ${pos}`)
    },
    [pushLog],
  )

  const handleAction = useCallback(
    (id: number, action: string) => {
      pushLog(`item ${id}: ${action}`)
      refMap.current.get(id)?.close()
    },
    [pushLog],
  )

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 pb-56">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          reveal-row playground
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manual test matrix for{' '}
          <code className="text-zinc-800">@present-day/reveal-row</code>. Swipe
          rows horizontally (or drag on desktop) to reveal actions. Events
          appear in the log below.
        </p>
      </header>

      {/* RIGHT mode */}
      <section className="mb-8">
        <SectionTitle>Right mode (default)</SectionTitle>
        <Description>
          Swipe left to reveal a trailing action. Default mode when only{' '}
          <code>right</code> is provided.
        </Description>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {ITEMS.slice(0, 3).map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Divider />}
              <RevealRow
                ref={(el) => {
                  if (el) refMap.current.set(item.id, el)
                  else refMap.current.delete(item.id)
                }}
                right={
                  <ActionButton
                    label="Delete"
                    color="bg-red-500"
                    onClick={() => handleAction(item.id, 'delete')}
                  />
                }
                onRevealChange={(pos) => onRevealChange(item.id, pos)}
              >
                <ItemContent title={item.title} subtitle={item.subtitle} />
              </RevealRow>
            </div>
          ))}
        </div>
      </section>

      {/* LEFT mode */}
      <section className="mb-8">
        <SectionTitle>Left mode</SectionTitle>
        <Description>
          Swipe right to reveal a leading action. Handle sits at the leading
          edge.
        </Description>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {ITEMS.slice(0, 3).map((item, i) => {
            const id = item.id + 10
            return (
              <div key={id}>
                {i > 0 && <Divider />}
                <RevealRow
                  ref={(el) => {
                    if (el) refMap.current.set(id, el)
                    else refMap.current.delete(id)
                  }}
                  left={
                    <ActionButton
                      label="Pin"
                      color="bg-blue-500"
                      onClick={() => handleAction(id, 'pin')}
                    />
                  }
                  onRevealChange={(pos) => onRevealChange(id, pos)}
                >
                  <ItemContent title={item.title} subtitle={item.subtitle} />
                </RevealRow>
              </div>
            )
          })}
        </div>
      </section>

      {/* BOTH mode */}
      <section className="mb-8">
        <SectionTitle>Both mode</SectionTitle>
        <Description>
          Swipe left to reveal a trailing action, right for a leading action.
          Three snap positions: left · center · right.
        </Description>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {ITEMS.map((item, i) => {
            const id = item.id + 20
            return (
              <div key={id}>
                {i > 0 && <Divider />}
                <RevealRow
                  ref={(el) => {
                    if (el) refMap.current.set(id, el)
                    else refMap.current.delete(id)
                  }}
                  left={
                    <ActionButton
                      label="Pin"
                      color="bg-blue-500"
                      onClick={() => handleAction(id, 'pin')}
                    />
                  }
                  right={
                    <ActionButton
                      label="Delete"
                      color="bg-red-500"
                      onClick={() => handleAction(id, 'delete')}
                    />
                  }
                  onRevealChange={(pos) => onRevealChange(id, pos)}
                >
                  <ItemContent title={item.title} subtitle={item.subtitle} />
                </RevealRow>
              </div>
            )
          })}
        </div>
      </section>

      {/* Imperative ref API */}
      <section className="mb-8">
        <SectionTitle>Imperative ref API</SectionTitle>
        <Description>
          Use <code>ref.close()</code> and <code>ref.reveal(position)</code> to
          control programmatically.
        </Description>
        <div className="mb-3 flex flex-wrap gap-2">
          {(['left', 'center', 'right'] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => {
                refMap.current.get(99)?.reveal(pos)
                pushLog(`imperative: reveal("${pos}")`)
              }}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              reveal("{pos}")
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              refMap.current.get(99)?.close()
              pushLog('imperative: close()')
            }}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            close()
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <RevealRow
            ref={(el) => {
              if (el) refMap.current.set(99, el)
              else refMap.current.delete(99)
            }}
            left={
              <ActionButton
                label="Archive"
                color="bg-amber-500"
                onClick={() => handleAction(99, 'archive')}
              />
            }
            right={
              <ActionButton
                label="Delete"
                color="bg-red-500"
                onClick={() => handleAction(99, 'delete')}
              />
            }
            onRevealChange={(pos) => onRevealChange(99, pos)}
          >
            <ItemContent
              title="Controlled via buttons above"
              subtitle="Drag me too"
            />
          </RevealRow>
        </div>
      </section>

      {/* Custom action widths */}
      <section className="mb-8">
        <SectionTitle>Custom action widths</SectionTitle>
        <Description>
          <code>actionWidthLeft={120}</code> and{' '}
          <code>actionWidthRight={64}</code> — different sizes on each side.
        </Description>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <RevealRow
            left={
              <ActionButton
                label="Wide action"
                color="bg-violet-500"
                onClick={() => pushLog('custom-width: wide action')}
              />
            }
            right={
              <ActionButton
                label="Narrow"
                color="bg-orange-500"
                onClick={() => pushLog('custom-width: narrow action')}
              />
            }
            actionWidthLeft={120}
            actionWidthRight={64}
            onRevealChange={(pos) =>
              pushLog(`custom-width: onRevealChange → ${pos}`)
            }
          >
            <ItemContent
              title="Wide left (120px) + narrow right (64px)"
              subtitle="Asymmetric action columns"
            />
          </RevealRow>
        </div>
      </section>

      {/* Disabled */}
      <section className="mb-8">
        <SectionTitle>Disabled state</SectionTitle>
        <Description>
          <code>disabled</code> prevents swiping and resets to closed (via{' '}
          <code>resetWhenDisabled</code>). Toggle to see it snap closed.
        </Description>
        <DisabledDemo onLog={pushLog} />
      </section>

      {/* No handle */}
      <section className="mb-8">
        <SectionTitle>No handle</SectionTitle>
        <Description>
          <code>showHandle={'{false}'}</code> — no drag affordance rendered.
        </Description>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <RevealRow
            showHandle={false}
            right={
              <ActionButton
                label="Delete"
                color="bg-red-500"
                onClick={() => pushLog('no-handle: delete')}
              />
            }
            onRevealChange={(pos) =>
              pushLog(`no-handle: onRevealChange → ${pos}`)
            }
          >
            <ItemContent
              title="No drag handle rendered"
              subtitle="Swipe left to reveal"
            />
          </RevealRow>
        </div>
      </section>

      {/* Event log */}
      <section
        className="pointer-events-auto fixed bottom-0 left-0 right-0 max-h-40 overflow-y-auto border-t border-zinc-200 bg-zinc-50/95 p-2 text-left shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur"
        aria-label="Event log"
      >
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Event log
        </h2>
        {log.length === 0 ? (
          <p className="px-1 text-xs text-zinc-500">No events yet.</p>
        ) : (
          <ol className="m-0 list-decimal p-0 pl-5 font-mono text-[11px] text-zinc-800">
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

function DisabledDemo({ onLog }: { onLog: (text: string) => void }) {
  const [disabled, setDisabled] = useState(false)
  const ref = useRef<RevealRowHandle>(null)

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const next = !disabled
            setDisabled(next)
            onLog(`disabled toggled → ${next}`)
          }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            disabled
              ? 'bg-zinc-900 text-white'
              : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          {disabled ? 'Enable' : 'Disable'}
        </button>
        <button
          type="button"
          onClick={() => {
            ref.current?.reveal(REVEAL_POSITION.right)
            onLog('disabled-demo: reveal("right")')
          }}
          disabled={disabled}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
        >
          reveal("right")
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <RevealRow
          ref={ref}
          disabled={disabled}
          right={
            <ActionButton
              label="Action"
              color="bg-teal-500"
              onClick={() => onLog('disabled-demo: action clicked')}
            />
          }
          onRevealChange={(pos) =>
            onLog(`disabled-demo: onRevealChange → ${pos}`)
          }
        >
          <ItemContent
            title={disabled ? 'Swiping is disabled' : 'Swipe left to reveal'}
            subtitle={
              disabled
                ? 'Toggle above to re-enable'
                : 'Then disable to see snap-back'
            }
          />
        </RevealRow>
      </div>
    </div>
  )
}
