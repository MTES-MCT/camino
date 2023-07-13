import { FiltresStatuts } from '../_common/filtres/statuts'
import { FiltresTypes } from '../_common/filtres/types'
import { TitreStatut as TitreStatutComp } from '../_common/titre-statut'
import { Domaine as DomaineComp } from '../_common/domaine'
import { capitalize } from 'camino-common/src/strings'
import { exhaustiveCheck } from 'camino-common/src/typescript-tools'
import { FilterCheckbox, FilterComponentProp } from './all-filters'
import { HTMLAttributes } from 'vue'


type Props = {
  filter: FilterComponentProp<FilterCheckbox>
} & Pick<HTMLAttributes, 'class'>

function DrawComponent(filter: FilterComponentProp<FilterCheckbox>, index: number): JSX.Element | null {
  const component = filter.component
  switch (component) {
    case 'FiltreDomaine':
      return <div class="dsfr" style={{display: 'flex', alignItems: 'baseline'}}>
      <DomaineComp domaineId={filter.elements[index].id}/>
      <div class="h6 bold fr-pl-1w">{capitalize(filter.elements[index].nom)}</div>
    </div>
    case 'FiltresTypes':
      return FiltresTypes({ element: filter.elements[index] }, { attrs: {}, emit: () => {}, slots: {} })
    case 'FiltresStatuts':
      return FiltresStatuts(
        {
          element: filter.elements[index],
        },
        { attrs: {}, emit: () => {}, slots: {} }
      )
    case 'FiltresTitresStatuts':
      return <div class='dsfr'><TitreStatutComp titreStatutId={filter.elements[index].id} /></div>
    case 'FiltresLabel':
      return <span class="cap-first h6 bold">{filter.elements[index].nom}</span>
    default:
      exhaustiveCheck(component)
      return null
  }
}

export function FiltersCheckboxes(props: Props) {
  const isEventWithTarget = (event: any): event is Event & { target: HTMLInputElement } => event.target

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
      props.filter.value = idsSet(e.target.value, props.filter.value)
    }
  }

  const checkboxesSelect = (action: 'none' | 'all') => {
    if (action === 'none') {
      props.filter.value = []
    }

    if (action === 'all') {
      props.filter.value = props.filter.elements.map(({ id }) => id)
    }
  }

  return (
    <div class="mb">
      <h5>{props.filter.name}</h5>
      <hr class="mb-s" />

      <ul class="list-sans">
        {props.filter.elements.map((element, index) => (
          <li key={element.id}>
            <label style={{ display: 'flex', flexDirection: 'row' }}>
              <input value={element.id} checked={props.filter.value.includes(element.id)} type="checkbox" class="mr-s" onChange={event => checkboxToggle(event)} />
              {(DrawComponent(props.filter, index))}
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
}
