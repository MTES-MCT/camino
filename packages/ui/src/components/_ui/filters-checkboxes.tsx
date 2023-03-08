import { Props as FiltreDomaineProps, FiltreDomaine } from '../_common/filtres/domaine'
import { Props as FiltresStatutsProps, FiltresStatuts } from '../_common/filtres/statuts'
import { Props as FiltresTypesProps, FiltresTypes } from '../_common/filtres/types'

type Props = {
  filter: {
    name: string
    component?: 'FiltreDomaine' | 'FiltresTypes' | 'FiltresStatuts'
    isNumber: boolean
    value: any[]
    elements: ({ id: string; nom: string } & (FiltreDomaineProps['element'] | FiltresStatutsProps['element'] | FiltresTypesProps['element']))[]
  }
}

function DrawComponent(component: Props['filter']['component'], element: FiltreDomaineProps['element'] | FiltresStatutsProps['element'] | FiltresTypesProps['element']): JSX.Element | null {
  if (!component) return <span class="cap-first h6 bold">{element.nom}</span>
  switch (component) {
    case 'FiltreDomaine':
      return FiltreDomaine({
        element: element as FiltreDomaineProps['element'],
      })
    case 'FiltresTypes':
      return FiltresTypes({ element: element as FiltresTypesProps['element'] })
    case 'FiltresStatuts':
      return FiltresStatuts({
        element: element as FiltresStatutsProps['element'],
      })
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
      const target = props.filter?.isNumber === true ? Number(e.target.value) : e.target.value

      props.filter.value = idsSet(target, props.filter.value)
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
        {props.filter.elements.map(element => (
          <li key={element.id}>
            <label>
              <input value={element.id} checked={props.filter.value.includes(element.id)} type="checkbox" class="mr-s" onChange={event => checkboxToggle(event)} />
              {DrawComponent(props.filter.component, element)}
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
