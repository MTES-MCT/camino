import { defineComponent, ref, Transition, watch } from 'vue'
import { Icon } from './icon'

export type Props = {
  open?: boolean
  onToggle: (newState: boolean) => void
  title: () => JSX.Element
  content: () => JSX.Element
}
export const Dropdown = defineComponent<Props>({
  props: ['open', 'onToggle', 'title', 'content'] as unknown as undefined,
  setup(props) {
    const open = ref<boolean>(props.open ?? false)
    watch(
      () => props.open,
      state => (open.value = state ?? false),
      { immediate: true }
    )
    return () => (
      <div class="relative flex flex-direction-column dropdown">
        <div class="absolute border rnd-s bg-bg full-x overflow-hidden">
          <button
            class={`${
              open.value ? 'rnd-t-s border-b-s' : ''
            } accordion-header flex btn-alt py-s px-s full-x`}
            onClick={() => {
              open.value = !open.value
              props.onToggle(open.value)
            }}
          >
            <div>{props.title()}</div>
            <div class="flex flex-right flex-end">
              <Icon
                size="M"
                name={open.value ? 'chevron-haut' : 'chevron-bas'}
              />
            </div>
          </button>

          <div class={`${open.value ? 'opened' : ''} overflow-hidden`}>
            <Transition name="slide">
              {open.value ? props.content() : null}
            </Transition>
          </div>
        </div>
      </div>
    )
  }
})
