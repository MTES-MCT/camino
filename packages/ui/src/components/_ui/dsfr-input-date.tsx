import { caminoDefineComponent, random } from '@/utils/vue-tsx-utils'
import { CaminoDate, getAnnee, getDay, getMois, isCaminoDate, toCaminoDate } from 'camino-common/src/date'
import { ref } from 'vue'
import { DsfrInput } from './dsfr-input'

interface Props {
  id?: string
  legend: { main: string; description?: string }
  initialValue?: CaminoDate | string | null
  dateChanged: (date: CaminoDate | null) => void
  required?: boolean
}

const yearMin = 1750
const yearMax = 2099

export const InputDate = caminoDefineComponent<Props>(['id', 'initialValue', 'dateChanged', 'legend', 'required'], props => {
  const id = props.id ?? `date_${(random() * 1000).toFixed()}`
  const dayId = ref<number | null>()
  const monthId = ref<number | null>()
  const yearId = ref<number | null>()
  if (props.initialValue && isCaminoDate(props.initialValue)) {
    dayId.value = getDay(props.initialValue)
    monthId.value = getMois(props.initialValue)
    yearId.value = Number(getAnnee(props.initialValue))
  }

  const changeDay = (value: number | null) => {
    dayId.value = value
    update()
  }

  const changeMonth = (value: number | null) => {
    monthId.value = value
    update()
  }
  const changeYear = (value: number | null) => {
    yearId.value = value
    update()
  }

  const update = () => {
    if (dayId.value && monthId.value && yearId.value) {
      let dayMax = 31
      let date = null
      while (dayMax > 28) {
        try {
          date = toCaminoDate(`${yearId.value}-${String(monthId.value).padStart(2, '0')}-${String(dayId.value).padStart(2, '0')}`)
          dayMax = 1
        } catch (ex) {
          if (dayId.value > 28) {
            dayId.value = dayId.value - 1
          }
        }
        dayMax--
      }
      if (date) {
        props.dateChanged(date)
      }
    } else {
      props.dateChanged(null)
    }
  }
  return () => (
    <div class="dsfr">
      <fieldset class="fr-fieldset" id={`${id}-fieldset`} role="group" aria-labelledby={`${id}-fieldset-legend`}>
        <legend class="fr-fieldset__legend" id={`${id}-fieldset-legend`}>
          {props.legend.main} {props.required ?? false ? ' *' : ' '}
          {props.legend.description ? <span class="fr-hint-text">{props.legend.description}</span> : null}
        </legend>
        <div class="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--number">
          <DsfrInput legend={{ main: 'Jour', description: 'Exemple : 14' }} valueChanged={changeDay} type={{ type: 'number', min: 1, max: 31 }} initialValue={dayId.value} />
        </div>
        <div class="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--number">
          <DsfrInput legend={{ main: 'Mois', description: 'Exemple : 12' }} valueChanged={changeMonth} type={{ type: 'number', min: 1, max: 12 }} initialValue={monthId.value} />
        </div>
        <div class="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--inline-grow fr-fieldset__element--year">
          <DsfrInput legend={{ main: 'Année', description: 'Exemple : 1984' }} valueChanged={changeYear} type={{ type: 'number', min: yearMin, max: yearMax }} initialValue={yearId.value} />
        </div>
      </fieldset>
    </div>
  )
})
