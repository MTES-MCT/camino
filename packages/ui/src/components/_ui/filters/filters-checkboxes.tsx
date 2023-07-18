import { FiltresStatuts } from '../../_common/filtres/statuts'
import { FiltresTypes } from '../../_common/filtres/types'
import { TitreStatut as TitreStatutComp } from '../../_common/titre-statut'
import { Domaine as DomaineComp } from '../../_common/domaine'
import { capitalize } from 'camino-common/src/strings'
import { exhaustiveCheck } from 'camino-common/src/typescript-tools'
import { FilterCheckbox, FilterComponentProp } from './all-filters'
import { HTMLAttributes, defineComponent, ref, Ref, watch } from 'vue'
import { CheckboxesCaminoFiltres, caminoFiltres } from './camino-filtres'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'

type Props = {
  filter: CheckboxesCaminoFiltres
  valuesSelected: (values: (typeof caminoFiltres)[CheckboxesCaminoFiltres]['validator']['_output']) => void
  initialValues: (typeof caminoFiltres)[CheckboxesCaminoFiltres]['validator']['_output']
} & Pick<HTMLAttributes, 'class'>

function DrawComponent(filter: CheckboxesCaminoFiltres, index: number): JSX.Element | null {
  const fullFilter = caminoFiltres[filter]

  const component = fullFilter.component
  switch (component) {
    // case 'FiltreDomaine':
    //   return (
    //     <div class="dsfr" style={{ display: 'flex', alignItems: 'baseline' }}>
    //       <DomaineComp domaineId={filter.elements[index].id} />
    //       <div class="h6 bold fr-pl-1w">{capitalize(filter.elements[index].nom)}</div>
    //     </div>
    //   )
    // case 'FiltresTypes':
    //   return FiltresTypes({ element: filter.elements[index] }, { attrs: {}, emit: () => {}, slots: {} })
    // case 'FiltresStatuts':
    //   return FiltresStatuts(
    //     {
    //       element: filter.elements[index],
    //     },
    //     { attrs: {}, emit: () => {}, slots: {} }
    //   )
    // case 'FiltresTitresStatuts':
    //   return (
    //     <div class="dsfr">
    //       <TitreStatutComp titreStatutId={filter.elements[index].id} />
    //     </div>
    //   )
    case 'FiltresLabel':
      return <span class="cap-first h6 bold">{fullFilter.elements[index].nom}</span>
    default:
      exhaustiveCheck(component)
      return null
  }
}

// FIXME TESTS
export const FiltersCheckboxes = defineComponent((props: Props) => {
  const fullFilter = caminoFiltres[props.filter]

  watch(
    () => props.initialValues,
    () => {
      selectedValues.value = props.initialValues
    }
  )
  const selectedValues = ref(props.initialValues) as Ref<(typeof caminoFiltres)[CheckboxesCaminoFiltres]['validator']['_output']>
  const idsSet = (v: any, values: any[]) => {
    const index = values.indexOf(v)

    const value = values.slice()

    if (index > -1) {
      value.splice(index, 1)
    } else {
      value.push(v)
    }

    return value.sort()
  }

  const checkboxToggle = (e: Event) => {
    if (isEventWithTarget(e) && e.target.value !== null) {
      selectedValues.value = idsSet(e.target.value, selectedValues.value)
      props.valuesSelected(fullFilter.validator.parse(selectedValues.value))
    }
  }

  const checkboxesSelect = (action: 'none' | 'all') => {
    if (action === 'none') {
      selectedValues.value = []
      props.valuesSelected(fullFilter.validator.parse(selectedValues.value))
    }

    if (action === 'all') {
      selectedValues.value = fullFilter.validator.parse(fullFilter.elements.map(({ id }) => id))
      props.valuesSelected(selectedValues.value)
    }
  }

  return () => (
    <div class="mb">
      <h5>{fullFilter.name}</h5>
      <hr class="mb-s" />

      <ul class="list-sans">
        {fullFilter.elements.map((element, index) => (
          <li key={element.id}>
            <label style={{ display: 'flex', flexDirection: 'row' }}>
              <input
                value={element.id}
                // @ts-ignore typescript est perdu ici, probablement un distributive union à supprimer
                checked={selectedValues.value.includes(element.id)}
                type="checkbox"
                class="mr-s"
                onChange={event => checkboxToggle(event)}
              />
              {DrawComponent(props.filter, index)}
            </label>
          </li>
        ))}
      </ul>
      <button ref="button" class="btn-border small px-s p-xs rnd-xs mr-xs" onClick={() => checkboxesSelect('none')}>
        Aucun
      </button>
      <button ref="button" class="btn-border small px-s p-xs rnd-xs mr-xs" onClick={() => checkboxesSelect('all')}>
        Tous
      </button>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
FiltersCheckboxes.props = ['filter', 'valuesSelected', 'initialValues']
