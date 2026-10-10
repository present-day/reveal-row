import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { fn } from 'storybook/test'
import {
  ACTION_PLACEMENT,
  ANIMATION_PRESET,
  type AnimationPreset,
  REVEAL_HANDLE_POSITION,
  REVEAL_POSITION,
  type RevealPosition,
  RevealRow,
  type RevealRowHandle,
  type RevealRowProps,
} from '../src'
import {
  ActionButton,
  Card,
  CONTROL_BUTTON,
  Divider,
  edgeCorners,
  ITEMS,
  ItemContent,
  Scenario,
  useEventLog,
} from './demo'

/** The props exposed as controls; each story forwards them to every row. */
type StoryArgs = Pick<
  RevealRowProps,
  | 'showHandle'
  | 'handlePosition'
  | 'peekOnHandleTap'
  | 'disabled'
  | 'resetWhenDisabled'
  | 'animationPreset'
  | 'actionWidthLeft'
  | 'actionWidthRight'
  | 'onRevealChange'
>

/** Keeps a handle per row id, plus the logging shared by every scenario. */
function useRows(args: StoryArgs) {
  const { log, push } = useEventLog()
  const refs = useRef<Map<number, RevealRowHandle>>(new Map())
  const { onRevealChange } = args

  const refFor = useCallback(
    (id: number) => (el: RevealRowHandle | null) => {
      if (el) refs.current.set(id, el)
      else refs.current.delete(id)
    },
    [],
  )

  const revealChange = useCallback(
    (label: string, pos: RevealPosition) => {
      push(`${label}: onRevealChange → ${pos}`)
      onRevealChange?.(pos)
    },
    [push, onRevealChange],
  )

  const action = useCallback(
    (id: number, name: string) => {
      push(`item ${id}: ${name}`)
      refs.current.get(id)?.close(true)
    },
    [push],
  )

  return { log, push, refs, refFor, revealChange, action }
}

/** Row props that come straight from controls. */
function rowProps({ onRevealChange: _, ...rest }: StoryArgs) {
  return rest
}

const meta = {
  title: 'RevealRow',
  args: {
    showHandle: true,
    peekOnHandleTap: true,
    disabled: false,
    resetWhenDisabled: true,
    animationPreset: ANIMATION_PRESET.quick,
    onRevealChange: fn(),
  },
  argTypes: {
    showHandle: { control: 'boolean' },
    handlePosition: {
      control: 'inline-radio',
      options: Object.values(REVEAL_HANDLE_POSITION),
      description: 'Unset: `start` in left mode, `end` otherwise',
    },
    peekOnHandleTap: { control: 'boolean' },
    disabled: { control: 'boolean' },
    resetWhenDisabled: { control: 'boolean' },
    animationPreset: {
      control: 'inline-radio',
      options: Object.values(ANIMATION_PRESET),
    },
    actionWidthLeft: {
      control: { type: 'number', min: 0, step: 4 },
      description: 'Unset: auto-size to content (88px floor)',
    },
    actionWidthRight: {
      control: { type: 'number', min: 0, step: 4 },
      description: 'Unset: auto-size to content (88px floor)',
    },
    onRevealChange: { table: { disable: true } },
  },
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

function RightModeDemo(args: StoryArgs) {
  const { log, refFor, revealChange, action } = useRows(args)
  return (
    <Scenario
      title="Right mode (default)"
      description={
        <>
          Swipe left to reveal a trailing action. Default mode when only{' '}
          <code>right</code> is provided.
        </>
      }
      log={log}
    >
      <Card>
        {ITEMS.slice(0, 3).map((item, i, arr) => (
          <div key={item.id}>
            {i > 0 && <Divider />}
            <RevealRow
              {...rowProps(args)}
              ref={refFor(item.id)}
              right={
                <ActionButton
                  label="Delete"
                  color="bg-red-500"
                  onClick={() => action(item.id, 'delete')}
                  className={edgeCorners(
                    'right',
                    i === 0,
                    i === arr.length - 1,
                  )}
                />
              }
              onRevealChange={(pos) => revealChange(`item ${item.id}`, pos)}
            >
              <ItemContent title={item.title} subtitle={item.subtitle} />
            </RevealRow>
          </div>
        ))}
      </Card>
    </Scenario>
  )
}

/** Swipe left to reveal a trailing action. */
export const RightMode: Story = {
  name: 'Right mode (default)',
  render: (args) => <RightModeDemo {...args} />,
}

function MultipleActionsDemo(args: StoryArgs) {
  const { log, refFor, revealChange, action } = useRows(args)
  return (
    <Scenario
      title="Multiple actions"
      description={
        <>
          More than one button per side, iOS Mail-style. No width math: the
          column auto-sizes to its content — each button just declares its own
          width. Try keyboard Tab: focus snaps the actions into view, and moving
          focus to another row closes this one.
        </>
      }
      log={log}
    >
      <Card>
        {ITEMS.slice(0, 2).map((item, i, arr) => {
          const id = item.id + 30
          return (
            <div key={id}>
              {i > 0 && <Divider />}
              <RevealRow
                {...rowProps(args)}
                ref={refFor(id)}
                right={
                  <div className="flex h-full">
                    <div className="w-[var(--action-width)]">
                      <ActionButton
                        label="Delete"
                        color="bg-red-500"
                        onClick={() => action(id, 'delete')}
                      />
                    </div>
                    <div className="w-[var(--action-width)]">
                      <ActionButton
                        label="Pin"
                        color="bg-amber-500"
                        onClick={() => action(id, 'pin')}
                        className={edgeCorners(
                          'right',
                          i === 0,
                          i === arr.length - 1,
                        )}
                      />
                    </div>
                  </div>
                }
                onRevealChange={(pos) => revealChange(`item ${id}`, pos)}
              >
                <ItemContent title={item.title} subtitle={item.subtitle} />
              </RevealRow>
            </div>
          )
        })}
      </Card>
    </Scenario>
  )
}

/** Several buttons on one side, laid out with flex. */
export const MultipleActions: Story = {
  render: (args) => <MultipleActionsDemo {...args} />,
}

function LeftModeDemo(args: StoryArgs) {
  const { log, refFor, revealChange, action } = useRows(args)
  return (
    <Scenario
      title="Left mode"
      description="Swipe right to reveal a leading action. Handle sits at the leading edge."
      log={log}
    >
      <Card>
        {ITEMS.slice(0, 3).map((item, i, arr) => {
          const id = item.id + 10
          return (
            <div key={id}>
              {i > 0 && <Divider />}
              <RevealRow
                {...rowProps(args)}
                ref={refFor(id)}
                left={
                  <ActionButton
                    label="Pin"
                    color="bg-blue-500"
                    onClick={() => action(id, 'pin')}
                    className={edgeCorners(
                      'left',
                      i === 0,
                      i === arr.length - 1,
                    )}
                  />
                }
                onRevealChange={(pos) => revealChange(`item ${id}`, pos)}
              >
                <ItemContent title={item.title} subtitle={item.subtitle} />
              </RevealRow>
            </div>
          )
        })}
      </Card>
    </Scenario>
  )
}

/** Swipe right to reveal a leading action. */
export const LeftMode: Story = {
  render: (args) => <LeftModeDemo {...args} />,
}

function BothModeDemo(args: StoryArgs) {
  const { log, refFor, revealChange, action } = useRows(args)
  return (
    <Scenario
      title="Both mode"
      description="Swipe left to reveal a trailing action, right for a leading action. Three snap positions: left · center · right."
      log={log}
    >
      <Card>
        {ITEMS.map((item, i, arr) => {
          const id = item.id + 20
          return (
            <div key={id}>
              {i > 0 && <Divider />}
              <RevealRow
                {...rowProps(args)}
                ref={refFor(id)}
                left={
                  <ActionButton
                    label="Pin"
                    color="bg-blue-500"
                    onClick={() => action(id, 'pin')}
                    className={edgeCorners(
                      'left',
                      i === 0,
                      i === arr.length - 1,
                    )}
                  />
                }
                right={
                  <ActionButton
                    label="Delete"
                    color="bg-red-500"
                    onClick={() => action(id, 'delete')}
                    className={edgeCorners(
                      'right',
                      i === 0,
                      i === arr.length - 1,
                    )}
                  />
                }
                onRevealChange={(pos) => revealChange(`item ${id}`, pos)}
              >
                <ItemContent title={item.title} subtitle={item.subtitle} />
              </RevealRow>
            </div>
          )
        })}
      </Card>
    </Scenario>
  )
}

/** Actions on both sides with three snap positions. */
export const BothMode: Story = {
  render: (args) => <BothModeDemo {...args} />,
}

function ImperativeRefApiDemo(args: StoryArgs) {
  const { log, push, refs, refFor, revealChange, action } = useRows(args)
  const id = 99
  return (
    <Scenario
      title="Imperative ref API"
      description={
        <>
          Use <code>ref.close()</code> and <code>ref.reveal(position)</code> to
          control programmatically.
        </>
      }
      log={log}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.values(REVEAL_POSITION).map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => {
              refs.current.get(id)?.reveal(pos)
              push(`imperative: reveal("${pos}")`)
            }}
            className={CONTROL_BUTTON}
          >
            reveal("{pos}")
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            refs.current.get(id)?.close()
            push('imperative: close()')
          }}
          className={CONTROL_BUTTON}
        >
          close()
        </button>
      </div>
      <Card>
        <RevealRow
          {...rowProps(args)}
          ref={refFor(id)}
          left={
            <ActionButton
              label="Archive"
              color="bg-amber-500"
              onClick={() => action(id, 'archive')}
              className={edgeCorners('left', true, true)}
            />
          }
          right={
            <ActionButton
              label="Delete"
              color="bg-red-500"
              onClick={() => action(id, 'delete')}
              className={edgeCorners('right', true, true)}
            />
          }
          onRevealChange={(pos) => revealChange(`item ${id}`, pos)}
        >
          <ItemContent
            title="Controlled via buttons above"
            subtitle="Drag me too"
          />
        </RevealRow>
      </Card>
    </Scenario>
  )
}

/** `ref.close()` and `ref.reveal(position)` driven from buttons. */
export const ImperativeRefApi: Story = {
  name: 'Imperative ref API',
  render: (args) => <ImperativeRefApiDemo {...args} />,
}

function CustomActionWidthsDemo(args: StoryArgs) {
  const { log, push, revealChange } = useRows(args)
  const { actionWidthLeft, actionWidthRight } = args
  const describe = (width: number | undefined) =>
    width === undefined ? 'auto' : `${width}px`
  return (
    <Scenario
      title="Custom action widths"
      description={
        <>
          <code>actionWidthLeft={'{120}'}</code> and{' '}
          <code>actionWidthRight={'{64}'}</code> — different sizes on each side.
          Adjust both in the controls.
        </>
      }
      log={log}
    >
      <Card>
        <RevealRow
          {...rowProps(args)}
          left={
            <ActionButton
              label="Wide action"
              color="bg-violet-500"
              onClick={() => push('custom-width: wide action')}
              className={edgeCorners('left', true, true)}
            />
          }
          right={
            <ActionButton
              label="Narrow"
              color="bg-orange-500"
              onClick={() => push('custom-width: narrow action')}
              className={edgeCorners('right', true, true)}
            />
          }
          onRevealChange={(pos) => revealChange('custom-width', pos)}
        >
          <ItemContent
            title={`Wide left (${describe(actionWidthLeft)}) + narrow right (${describe(actionWidthRight)})`}
            subtitle="Asymmetric action columns"
          />
        </RevealRow>
      </Card>
    </Scenario>
  )
}

/** Fixed, asymmetric column widths via `actionWidthLeft` / `actionWidthRight`. */
export const CustomActionWidths: Story = {
  args: { actionWidthLeft: 120, actionWidthRight: 64 },
  render: (args) => <CustomActionWidthsDemo {...args} />,
}

const PRESETS: Array<{
  preset: AnimationPreset
  label: string
  color: string
}> = [
  { preset: ANIMATION_PRESET.none, label: 'None', color: 'bg-gray-500' },
  { preset: ANIMATION_PRESET.quick, label: 'Quick', color: 'bg-blue-500' },
  { preset: ANIMATION_PRESET.smooth, label: 'Smooth', color: 'bg-green-500' },
]

function AnimationPresetsDemo(args: StoryArgs) {
  const { log, push, refs, refFor, revealChange } = useRows(args)
  return (
    <Scenario
      title="Animation presets"
      description={
        <>
          Test different animation presets when action buttons are clicked.
          Default is <code>quick</code> for a smooth close animation.
        </>
      }
      log={log}
    >
      <Card>
        {PRESETS.map(({ preset, label, color }, i, arr) => (
          <div key={preset}>
            {i > 0 && <Divider />}
            <RevealRow
              {...rowProps(args)}
              ref={refFor(40 + i)}
              animationPreset={preset}
              right={
                <ActionButton
                  label="Close"
                  color={color}
                  className={edgeCorners(
                    'right',
                    i === 0,
                    i === arr.length - 1,
                  )}
                  onClick={() => {
                    push(
                      `animation-demo: ${label.toLowerCase()} animation close`,
                    )
                    refs.current.get(40 + i)?.close(preset)
                  }}
                />
              }
              onRevealChange={(pos) =>
                revealChange(`animation-demo: ${label.toLowerCase()}`, pos)
              }
            >
              <ItemContent
                title={`${label} animation preset`}
                subtitle={`Swipe left and click action to see ${label.toLowerCase()} animation`}
              />
            </RevealRow>
          </div>
        ))}
      </Card>
    </Scenario>
  )
}

/** One row per `animationPreset`: none, quick, smooth. */
export const AnimationPresets: Story = {
  argTypes: { animationPreset: { table: { disable: true } } },
  render: (args) => <AnimationPresetsDemo {...args} />,
}

function DisabledStateDemo(args: StoryArgs) {
  const { log, push, revealChange } = useRows(args)
  const [disabled, setDisabled] = useState(false)
  const ref = useRef<RevealRowHandle>(null)
  return (
    <Scenario
      title="Disabled state"
      description={
        <>
          <code>disabled</code> prevents swiping and resets to closed (via{' '}
          <code>resetWhenDisabled</code>). Toggle to see it snap closed.
        </>
      }
      log={log}
    >
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const next = !disabled
            setDisabled(next)
            push(`disabled toggled → ${next}`)
          }}
          className={
            disabled
              ? 'rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
              : CONTROL_BUTTON
          }
        >
          {disabled ? 'Enable' : 'Disable'}
        </button>
        <button
          type="button"
          onClick={() => {
            ref.current?.reveal(REVEAL_POSITION.right)
            push('disabled-demo: reveal("right")')
          }}
          disabled={disabled}
          className={CONTROL_BUTTON}
        >
          reveal("right")
        </button>
      </div>
      <Card>
        <RevealRow
          {...rowProps(args)}
          ref={ref}
          disabled={disabled}
          right={
            <ActionButton
              label="Action"
              color="bg-teal-500"
              onClick={() => push('disabled-demo: action clicked')}
              className={edgeCorners('right', true, true)}
            />
          }
          onRevealChange={(pos) => revealChange('disabled-demo', pos)}
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
      </Card>
    </Scenario>
  )
}

/** Toggle `disabled` to see the row snap closed. */
export const DisabledState: Story = {
  argTypes: { disabled: { table: { disable: true } } },
  render: (args) => <DisabledStateDemo {...args} />,
}

function NoHandleDemo(args: StoryArgs) {
  const { log, push, revealChange } = useRows(args)
  return (
    <Scenario
      title="No handle"
      description={
        <>
          <code>showHandle={'{false}'}</code> — no drag affordance rendered.
        </>
      }
      log={log}
    >
      <Card>
        <RevealRow
          {...rowProps(args)}
          right={
            <ActionButton
              label="Delete"
              color="bg-red-500"
              onClick={() => push('no-handle: delete')}
              className={edgeCorners('right', true, true)}
            />
          }
          onRevealChange={(pos) => revealChange('no-handle', pos)}
        >
          <ItemContent
            title="No drag handle rendered"
            subtitle="Swipe left to reveal"
          />
        </RevealRow>
      </Card>
    </Scenario>
  )
}

/** `showHandle={false}`: no drag affordance. */
export const NoHandle: Story = {
  args: { showHandle: false },
  render: (args) => <NoHandleDemo {...args} />,
}

const SESSIONS = [
  {
    id: 1,
    title: 'Fr-editor-brief mkt scope',
    meta: 'present-day/cue.quest',
    age: '9h',
  },
  { id: 2, title: 'Cue Quest Strategist', meta: 'Remote control', age: '9h' },
  {
    id: 3,
    title: 'Fr-app-brief.md in cue-quest',
    meta: 'present-day/app.cue.quest',
    age: '13h',
  },
  { id: 4, title: 'Cue Quest Sonnet', meta: 'Remote control', age: '14h' },
  {
    id: 5,
    title: 'Backend phase 1 schema',
    meta: 'present-day/ola',
    age: '1d',
  },
]

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  )
}

const EditIcon = (
  <>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13 7l4 4" />
  </>
)
const PinIcon = (
  <>
    <path d="M9 4h6l-1 6 3 3H7l3-3z" />
    <path d="M12 13v7" />
  </>
)
const ShareIcon = (
  <>
    <path d="M12 15V4" />
    <path d="M8 8l4-4 4 4" />
    <path d="M6 12H5v8h14v-8h-1" />
  </>
)
const ArchiveIcon = (
  <>
    <rect x="3.5" y="4" width="17" height="4.5" rx="1" />
    <path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5" />
    <path d="M10 12.5h4" />
  </>
)

function SessionCard({ title, meta, age }: (typeof SESSIONS)[number]) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-zinc-900 bg-zinc-950 px-5 py-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-lg text-zinc-100">{title}</span>
          <span className="shrink-0 text-sm text-zinc-500">{age}</span>
        </div>
        <div className="mt-1 truncate text-sm text-zinc-500">
          <span className="text-green-500">Connected</span> • {meta}
        </div>
      </div>
    </div>
  )
}

function BehindDemo(args: StoryArgs) {
  const { log, refFor, revealChange, action } = useRows(args)
  return (
    <Scenario
      title="Behind reveal"
      description={
        <>
          <code>actionPlacement="behind"</code>: the whole card slides and the
          buttons stay put, already in place underneath it.
        </>
      }
      log={log}
    >
      <div className="-mx-0 bg-zinc-900 py-2">
        {SESSIONS.map((s) => (
          <RevealRow
            key={s.id}
            {...rowProps(args)}
            ref={refFor(s.id)}
            actionPlacement={ACTION_PLACEMENT.behind}
            classNames={{ main: 'px-4 py-1.5' }}
            right={
              <div className="flex h-full items-center gap-3 pr-4 pl-4">
                <IconButton label="Edit" onClick={() => action(s.id, 'edit')}>
                  {EditIcon}
                </IconButton>
                <IconButton
                  label="Archive"
                  onClick={() => action(s.id, 'archive')}
                >
                  {ArchiveIcon}
                </IconButton>
              </div>
            }
            onRevealChange={(pos) => revealChange(`item ${s.id}`, pos)}
          >
            <SessionCard {...s} />
          </RevealRow>
        ))}
      </div>
    </Scenario>
  )
}

/** The Claude iOS session list: the card slides, round buttons wait behind. */
export const BehindReveal: Story = {
  args: { showHandle: false },
  render: (args) => <BehindDemo {...args} />,
}

function BehindBothDemo(args: StoryArgs) {
  const { log, refFor, revealChange, action } = useRows(args)
  return (
    <Scenario
      title="Behind reveal, both sides"
      description="Swipe either way: two actions per side wait behind the card."
      log={log}
    >
      <div className="bg-zinc-900 py-2">
        {SESSIONS.slice(0, 3).map((s) => (
          <RevealRow
            key={s.id}
            {...rowProps(args)}
            ref={refFor(s.id)}
            actionPlacement={ACTION_PLACEMENT.behind}
            classNames={{ main: 'px-4 py-1.5' }}
            left={
              <div className="flex h-full items-center gap-3 pr-4 pl-4">
                <IconButton label="Pin" onClick={() => action(s.id, 'pin')}>
                  {PinIcon}
                </IconButton>
                <IconButton label="Edit" onClick={() => action(s.id, 'edit')}>
                  {EditIcon}
                </IconButton>
              </div>
            }
            right={
              <div className="flex h-full items-center gap-3 pr-4 pl-4">
                <IconButton label="Share" onClick={() => action(s.id, 'share')}>
                  {ShareIcon}
                </IconButton>
                <IconButton
                  label="Archive"
                  onClick={() => action(s.id, 'archive')}
                >
                  {ArchiveIcon}
                </IconButton>
              </div>
            }
            onRevealChange={(pos) => revealChange(`item ${s.id}`, pos)}
          >
            <SessionCard {...s} />
          </RevealRow>
        ))}
      </div>
    </Scenario>
  )
}

export const BehindRevealBothSides: Story = {
  args: { showHandle: false },
  render: (args) => <BehindBothDemo {...args} />,
}
