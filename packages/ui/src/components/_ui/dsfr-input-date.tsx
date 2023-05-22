import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { CaminoDate, getAnnee, getDay, getMois, isCaminoDate, toCaminoDate } from 'camino-common/src/date'
import { ref } from 'vue'

interface Props {
  id?: string
  legend: { main: string; description?: string }
  initialValue?: CaminoDate | string | null
  dateChanged: (date: CaminoDate | null) => void
}

const yearMin = 1750
const yearMax = 2099

export const InputDate = caminoDefineComponent<Props>(['id', 'initialValue', 'dateChanged', 'legend'], props => {
  const id = props.id ?? `date_${(Math.random() * 1000).toFixed()}`
  const dayId = ref<number | null>()
  const monthId = ref<number | null>()
  const yearId = ref<number | null>()
  if (props.initialValue && isCaminoDate(props.initialValue)) {
    dayId.value = getDay(props.initialValue)
    monthId.value = getMois(props.initialValue)
    yearId.value = Number(getAnnee(props.initialValue))
  }

  const changeDay = (event: Event) => {
    if (isEventWithTarget(event)) {
      let day = null
      if (event.target.value) {
        day = event.target.valueAsNumber
      }
      dayId.value = day
      update()
    }
  }

  const changeMonth = (event: Event) => {
    if (isEventWithTarget(event)) {
      let month = null
      if (event.target.value) {
        month = event.target.valueAsNumber
      }
      monthId.value = month
      update()
    }
  }
  const changeYear = (event: Event) => {
    if (isEventWithTarget(event)) {
      let year = null
      if (event.target.value) {
        year = event.target.valueAsNumber
      }
      yearId.value = year
      update()
    }
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
          dayId.value = dayId.value - 1
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
      <fieldset class="fr-fieldset" id={`${id}-fieldset`} role="group" aria-labelledby={`${id}-fieldset-legend ${id}-fieldset-messages`}>
        <legend class="fr-fieldset__legend" id={`${id}-fieldset-legend`}>
          {props.legend.main}
          {props.legend.description ? <span class="fr-hint-text">{props.legend.description}</span> : null}
        </legend>
        <div class="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--number">
          <div class="fr-input-group">
            <label class="fr-label" for={`${id}-date-jour`}>
              Jour
              <span class="fr-hint-text">Exemple : 14</span>
            </label>
            <input class="fr-input" value={dayId.value} type="number" min="1" max="31" name="day" id={`${id}-date-jour`} onChange={changeDay} />
          </div>
        </div>
        <div class="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--number">
          <div class="fr-input-group">
            <label class="fr-label" for={`${id}-date-mois`}>
              Mois
              <span class="fr-hint-text">Exemple : 12</span>
            </label>
            <input class="fr-input" value={monthId.value} type="number" min="1" max="12" name="mois" id={`${id}-date-mois`} onChange={changeMonth} />
          </div>
        </div>
        <div class="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--inline-grow fr-fieldset__element--year">
          <div class="fr-input-group">
            <label class="fr-label" for={`${id}-date-annee`}>
              Année
              <span class="fr-hint-text">Exemple : 1984</span>
            </label>
            <input class="fr-input" value={yearId.value} type="number" min={yearMin} max={yearMax} name="annee" id={`${id}-date-annee`} onChange={changeYear} />
          </div>
        </div>
        <div class="fr-messages-group" id={`${id}-fieldset-messages`} aria-live="assertive"></div>
      </fieldset>
    </div>
  )
})
