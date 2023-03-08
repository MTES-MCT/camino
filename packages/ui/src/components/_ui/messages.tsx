import { defineComponent, TransitionGroup } from 'vue'

export interface Props {
  messages: { type: 'error' | 'success'; value: string }[]
}
export const Messages = defineComponent<Props>({
  props: ['messages'] as unknown as undefined,
  setup(props) {
    return () => (
      <TransitionGroup name="slide-bottom" class="list-sans mb-0" tag="ul">
        {props.messages.map((message, index) => (
          <li key={index} class={`mb p-s color-bg bg-${message.type}`}>
            <span class="cap-first">{message.value}</span>
          </li>
        ))}
      </TransitionGroup>
    )
  },
})
