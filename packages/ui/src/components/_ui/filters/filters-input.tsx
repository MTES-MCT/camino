import { InputCaminoFiltres } from './camino-filtres'
import { caminoFiltres } from 'camino-common/src/filters'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import type { JSX } from 'vue/jsx-runtime'

type Props = {
  filter: InputCaminoFiltres
  initialValue: string
  onFilterInput: (value: string) => void
}

export function FiltersInput(props: Props): JSX.Element {
  const filter = caminoFiltres[props.filter]

  return <DsfrInput initialValue={props.initialValue} class="fr-mb-2w" type={{ type: 'text' }} legend={{ placeholder: filter.placeholder, main: filter.name }} valueChanged={props.onFilterInput} />
}
