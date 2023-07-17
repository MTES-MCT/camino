import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { InputCaminoFiltres, caminoFiltres } from './camino-filtres'

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

      <input value={props.initialValue} type="text" placeholder={filter.placeholder} onChange={(e) => {
        if (isEventWithTarget(e)) {

          props.onFilterInput(e.target.value)
        }
      } } />

    </div>
  )
}
