import { InputCaminoFiltres } from './camino-filtres'
import { caminoFiltres } from 'camino-common/src/filters'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import type { JSX } from 'vue/jsx-runtime'

type Props = {
  id: string
  filter: InputCaminoFiltres
  initialValue: string
  onFilterInput: (value: string) => void
}

export function FiltersInput(props: Props): JSX.Element {
  const filter = caminoFiltres[props.filter]

  return (
    <DsfrInput
      id={props.id}
      required={false}
      initialValue={props.initialValue}
      type={{ type: 'text' }}
      legend={{ placeholder: filter.placeholder, main: filter.name, visible: false }}
      valueChanged={props.onFilterInput}
    />
  )
}
