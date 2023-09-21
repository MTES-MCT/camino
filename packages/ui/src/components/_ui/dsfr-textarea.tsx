import { caminoDefineComponent, isEventWithTarget, random } from '@/utils/vue-tsx-utils'

type Props = {
  id?: string
  legend: { main: string; description?: string }
  valueChanged: (value: string) => void
  initialValue?: string | null
  required?: boolean
}

export const DsfrTextarea = caminoDefineComponent<Props>(['id', 'initialValue', 'valueChanged', 'legend', 'required'], props => {
  const id = props.id ?? `textarea_${(random() * 1000).toFixed()}`

  const updateFromEvent = (e: Event) => {
    if (isEventWithTarget(e)) {
      props.valueChanged(e.target.value)
    }
  }
  return () => (
    <div class="fr-input-group">
      <label class="fr-label" for={id}>
        {props.legend.main} {props.required ? ' *' : null}
        {props.legend.description ? <span class="fr-hint-text" v-html={props.legend.description}></span> : null}
      </label>
      <textarea onInput={updateFromEvent} value={props.initialValue ?? undefined} class="fr-input" name={id} id={id} required={props.required ?? false} />
    </div>
  )
})
