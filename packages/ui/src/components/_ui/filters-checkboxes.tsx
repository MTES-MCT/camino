import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { Props as FiltresStatutsProps, FiltresStatuts } from '../_common/filtres/statuts'
import { Props as FiltresTypesProps, FiltresTypes } from '../_common/filtres/types'
import { TitreStatut as TitreStatutComp } from '../_common/titre-statut'
import { Definition } from 'camino-common/src/definition'
import { Domaine as DomaineComp } from '../_common/domaine'
import { capitalize } from 'camino-common/src/strings'
import { Domaine } from 'camino-common/src/static/domaines'

type Props = {
  filter: {
    name: string
    component?: 'FiltreDomaine' | 'FiltresTypes' | 'FiltresStatuts' | 'FiltresTitresStatuts'
    isNumber: boolean
    value: any[]
    elements: ({ id: string; nom: string } & (Domaine | FiltresStatutsProps['element'] | FiltresTypesProps['element']))[]
  }
}

function DrawComponent(component: Props['filter']['component'], element: Domaine | FiltresStatutsProps['element'] | FiltresTypesProps['element'] | Definition<TitreStatutId> | Domaine): JSX.Element | null {
  if (!component) return <span class="cap-first h6 bold">{element.nom}</span>
  switch (component) {
    case 'FiltreDomaine':
      return <div class="dsfr" style={{display: 'flex', alignItems: 'baseline'}}>
      <DomaineComp domaineId={(element as Domaine).id}/>
      <div class="h6 bold fr-pl-1w">{capitalize(element.nom)}</div>
    </div>
    case 'FiltresTypes':
      return FiltresTypes({ element: element as FiltresTypesProps['element'] }, { attrs: {}, emit: () => {}, slots: {} })
    case 'FiltresStatuts':
      return FiltresStatuts(
        {
          element: element as FiltresStatutsProps['element'],
        },
        { attrs: {}, emit: () => {}, slots: {} }
      )
    case 'FiltresTitresStatuts':
      return <div class='dsfr'><TitreStatutComp titreStatutId={(element as Definition<TitreStatutId>).id} /></div>
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
            <label style={{ display: 'flex', flexDirection: 'row' }}>
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
