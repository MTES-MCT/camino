import { fr } from '@codegouvfr/react-dsfr'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { defineComponent, ref } from 'vue'

type Props = {
  id: string
  legendLabel: string
  legendHint?: string
  valueChanged: (value: boolean) => void
  initialValue: boolean
}

export const DsfrToggle = defineComponent<Props>(props => {
  const toggled = ref<boolean>(props.initialValue)

  const updateFromEvent = () => {
    toggled.value = !toggled.value
    props.valueChanged(toggled.value)
  }

  const hintId = `toggle-${props.id}-hint-text`

  const extraInputProps = isNotNullNorUndefined(props.legendHint) ? { 'aria-describedby': hintId } : {}

  return () => (
    <div class={[fr.cx('fr-toggle')]}>
      <input type="checkbox" class={[fr.cx('fr-toggle__input')]} checked={toggled.value} {...extraInputProps} id={props.id} onClick={updateFromEvent} />
      <label class={[fr.cx('fr-toggle__label')]} for={props.id} data-fr-checked-label="Activé" data-fr-unchecked-label="Désactivé">
        <span class=" fr-ml-4w">{props.legendLabel}</span>
      </label>
      {isNotNullNorUndefined(props.legendHint) ? (
        <p class={[fr.cx('fr-hint-text')]} id={hintId}>
          {props.legendHint}
        </p>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrToggle.props = ['id', 'initialValue', 'valueChanged', 'legendLabel', 'legendHint']
