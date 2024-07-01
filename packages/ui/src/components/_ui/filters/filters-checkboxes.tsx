import { FiltresTypes } from '../../_common/filtres/types'
import { TitreStatut as TitreStatutComp } from '../../_common/titre-statut'
import { Domaine as DomaineComp } from '../../_common/domaine'
import { capitalize } from 'camino-common/src/strings'
import { exhaustiveCheck } from 'camino-common/src/typescript-tools'
import { HTMLAttributes, defineComponent, ref, Ref, watch } from 'vue'
import { CheckboxesCaminoFiltres } from './camino-filtres'
import { caminoFiltres } from 'camino-common/src/filters'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { DemarcheStatut } from '../../_common/demarche-statut'
import type { JSX } from 'vue/jsx-runtime'
import { DsfrButton } from '../dsfr-button'
import { ActiviteStatut } from '@/components/_common/activite-statut'

type Props = {
  filter: CheckboxesCaminoFiltres
  valuesSelected: (values: (typeof caminoFiltres)[CheckboxesCaminoFiltres]['validator']['_output']) => void
  initialValues: (typeof caminoFiltres)[CheckboxesCaminoFiltres]['validator']['_output']
} & Pick<HTMLAttributes, 'class'>

function DrawComponent(filter: CheckboxesCaminoFiltres, index: number): JSX.Element | null {
  const fullFilter = caminoFiltres[filter]

  const component = fullFilter.component
  switch (component) {
    case 'FiltreDomaine':
      return (
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <DomaineComp domaineId={fullFilter.elements[index].id} />
          <div class="h6 bold fr-pl-1w">{capitalize(fullFilter.elements[index].nom)}</div>
        </div>
      )
    case 'FiltresTypes':
      return FiltresTypes({ element: fullFilter.elements[index] }, { attrs: {}, emit: () => {}, slots: {} })
    case 'FiltresActivitesStatuts':
      return (
          <div>
            <ActiviteStatut activiteStatutId={fullFilter.elements[index].id} />
          </div>
        )
    case 'FiltresTitresStatuts':
      return (
        <div>
          <TitreStatutComp titreStatutId={fullFilter.elements[index].id} />
        </div>
      )
    case 'FiltresDemarchesStatuts':
      return (
        <div>
          <DemarcheStatut demarcheStatutId={fullFilter.elements[index].id} />
        </div>
      )
    case 'FiltresLabel':
      return <span class="h6 bold">{capitalize(fullFilter.elements[index].nom)}</span>
    default:
      exhaustiveCheck(component)

      return null
  }
}

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
      {fullFilter.name}
      <ul class="list-sans" style={{ listStyleType: 'none' }}>
        {fullFilter.elements.map((element, index) => (
          <li key={element.id}>
            <label style={{ display: 'flex', flexDirection: 'row' }}>
              <input
                value={element.id}
                // @ts-ignore typescript est perdu ici, probablement un distributive union à supprimer
                checked={selectedValues.value.includes(element.id)}
                type="checkbox"
                class="fr-mr-1v"
                onChange={event => checkboxToggle(event)}
              />
              {DrawComponent(props.filter, index)}
            </label>
          </li>
        ))}
      </ul>
      <DsfrButton title="Aucun" class="fr-mr-1w" buttonType="tertiary" buttonSize="sm" onClick={() => checkboxesSelect('none')} />
      <DsfrButton title="Tous" buttonType="tertiary" buttonSize="sm" onClick={() => checkboxesSelect('all')} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
FiltersCheckboxes.props = ['filter', 'valuesSelected', 'initialValues']
