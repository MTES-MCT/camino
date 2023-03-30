import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { CaminoDate, getAnnee, getDay, getMois, isCaminoDate, toCaminoDate } from 'camino-common/src/date'
import { ref } from 'vue'

interface Props {
  initialValue?: CaminoDate | string | null
  dateChanged: (date: CaminoDate | null) => void
}

const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'] as const

const yearMin = 1750
const yearMax = 2099

export const InputDate = caminoDefineComponent<Props>(['initialValue', 'dateChanged'], props => {
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
      const month = event.target.value
      monthId.value = Number(month)
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
    <div class="blobs-mini">
      <div class="blob-mini-1-3">
        <input value={dayId.value} type="number" min="1" max="31" placeholder="jour" class="text-right p-s" onChange={changeDay} />
      </div>
      <div class="blob-mini-1-3">
        <select value={monthId.value} class="mr-s p-s" onChange={changeMonth}>
          <option value="null" disabled hidden>
            mois
          </option>
          {monthNames.map((month, index) => (
            <option key={index + 1} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div class="blob-mini-1-3">
        <input value={yearId.value} type="number" min={yearMin} max={yearMax} placeholder="année" class="text-right p-s" onChange={changeYear} />
      </div>
    </div>
  )
})
