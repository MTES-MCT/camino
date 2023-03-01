import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { defineComponent, ref } from 'vue'
import Accordion from './accordion.vue'

interface Props {
  ranges: number[]
  range: number
  rangeUpdate: (range: number) => void
}
export const Ranges = defineComponent<Props>({
  props: ['ranges', 'range', 'rangeUpdate'] as unknown as undefined,
  setup(props) {
    const opened = ref(false)

    const close = () => {
      opened.value = false
    }
    const toggle = () => {
      opened.value = !opened.value
    }

    return () => (
      <Accordion
        class="mb"
        opened={opened.value}
        slotDefault={true}
        onClose={close}
        onToggle={toggle}
      >
        {{
          title: () => <span> Éléments </span>,
          default: () => (
            <ul class="list-sans mt-m px-m">
              {props.ranges.map(r => (
                <li key={r}>
                  <label>
                    <input
                      checked={r === props.range}
                      value={r}
                      type="radio"
                      class="mr-s"
                      onChange={e => {
                        if (isEventWithTarget(e)) {
                          props.rangeUpdate(Number(e.target.value))
                        }
                      }}
                    />
                    {r}
                  </label>
                </li>
              ))}
            </ul>
          )
        }}
      </Accordion>
    )
  }
})
