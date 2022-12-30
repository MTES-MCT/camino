import { EmitsOptions, HTMLAttributes, SetupContext } from 'vue'

export type Props = {
  color?:
    | 'bg-neutral'
    | 'bg-error'
    | 'bg-info'
    | 'bg-neutral'
    | 'bg-success'
    | 'bg-warning'
    | 'bg-domaine-c'
    | 'bg-domaine-f'
    | 'bg-domaine-g'
    | 'bg-domaine-h'
    | 'bg-domaine-i'
    | 'bg-domaine-m'
    | 'bg-domaine-r'
    | 'bg-domaine-s'
    | 'bg-domaine-w'
} & HTMLAttributes

export function Pill(
  props: Props,
  context: Omit<SetupContext<EmitsOptions>, 'expose'>
) {
  return (
    <span class={`cap-first small bold`}>
      <span class={`${props.color ?? 'bg-neutral'} color-bg pill py-xs px-s`}>
        {context.slots.default ? context.slots.default() : null}
      </span>
    </span>
  )
}
