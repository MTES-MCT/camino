import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { TransitionGroup } from 'vue'

interface Props {
  messages: { type: 'error' | 'success'; value: string | Error }[]
}
export const Messages = caminoDefineComponent<Props>(['messages'], props => {
  return () => (
    <TransitionGroup name="slide-bottom" tag="div">
      {props.messages.map((message, index) => (
        <div key={index} class={`mb p-s color-bg bg-${message.type}`}>
          <span class="cap-first">{message.value instanceof Error ? message.value.message : message.value}</span>
        </div>
      ))}
    </TransitionGroup>
  )
})
