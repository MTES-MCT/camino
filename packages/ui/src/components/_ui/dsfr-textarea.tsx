import { isEventWithTarget, random } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { defineComponent } from 'vue'

type Props = {
  id?: string
  legend: { main: string; description?: string }
  valueChanged: (value: string) => void
  initialValue?: string | null
  required: boolean
}

export const DsfrTextarea = defineComponent<Props>(props => {
  const id = props.id ?? `textarea_${(random() * 1000).toFixed()}`

  const updateFromEvent = (e: Event) => {
    if (isEventWithTarget(e)) {
      props.valueChanged(e.target.value)
    }
  }

  return () => (
    <div class="fr-input-group">
      <label class="fr-label" for={id}>
        {props.legend.main} {!props.required ? (isNotNullNorUndefinedNorEmpty(props.legend.main) ? ' (optionnel)' : 'Champ optionnel') : null}
        {isNotNullNorUndefinedNorEmpty(props.legend.description) ? <span class="fr-hint-text" v-html={props.legend.description}></span> : null}
      </label>
      <textarea onInput={updateFromEvent} value={props.initialValue ?? undefined} class="fr-input" name={id} id={id} required={props.required} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrTextarea.props = ['id', 'initialValue', 'valueChanged', 'legend', 'required']
