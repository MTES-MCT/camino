import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { InputCaminoFiltres } from './camino-filtres'
import { caminoFiltres } from 'camino-common/src/filters'

type Props = {
  filter: InputCaminoFiltres
  initialValue: string
  onFilterInput: (value: string) => void
}

export function FiltersInput(props: Props) {
  const filter = caminoFiltres[props.filter]
  return (
    <div class="mb">
      <h5>{filter.name}</h5>
      <hr class="mb-s" />

      <input
        class="p-xs"
        value={props.initialValue}
        type="text"
        placeholder={filter.placeholder}
        onInput={e => {
          if (isEventWithTarget(e)) {
            props.onFilterInput(e.target.value)
          }
        }}
      />
    </div>
  )
}
