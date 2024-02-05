import { caminoDefineComponent, random } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ref } from 'vue'

type Props = {
  id?: string
  legendLabel: string
  legendHint?: string
  valueChanged: (value: boolean) => void
  initialValue: boolean
}

export const DsfrToggle = caminoDefineComponent<Props>(['id', 'initialValue', 'valueChanged', 'legendLabel', 'legendHint'], props => {
  const id = props.id ?? `toggle_${(random() * 1000).toFixed()}`

  const toggled = ref<boolean>(props.initialValue)

  const updateFromEvent = () => {
    toggled.value = !toggled.value
    props.valueChanged(toggled.value)
  }

  const hintId = `toggle-${id}-hint-text`

  const extraInputProps = isNotNullNorUndefined(props.legendHint) ? { 'aria-describedby': hintId } : {}

  return () => (
    <div class="fr-toggle">
      <input type="checkbox" class="fr-toggle__input" checked={toggled.value} {...extraInputProps} id={id} onClick={updateFromEvent} />
      <label class="fr-toggle__label" for={id} data-fr-checked-label="Activé" data-fr-unchecked-label="Désactivé">
        <span class=" fr-ml-4w">{props.legendLabel}</span>
      </label>
      {isNotNullNorUndefined(props.legendHint) ? (
        <p class="fr-hint-text" id={hintId}>
          {props.legendHint}
        </p>
      ) : null}
    </div>
  )
})
