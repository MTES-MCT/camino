import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { EntreprisesByEtapeId } from 'camino-common/src/demarche'
import { CaminoRouterLink } from '../../router/camino-router-link'
import { AdministrationId, Administrations } from 'camino-common/src/static/administrations'

const textProp = 'text'

type ItemProp = {
  item: JSX.Element
}
type TextProp = {
  [textProp]: string
}
type Props = (TextProp | ItemProp) & {
  title: string
  style?: HTMLAttributes['style']
}
export const EtapePropItem: FunctionalComponent<Props> = props => {
  return (
    <div>
      <div class="fr-text--sm fr-mb-0">{capitalize(props.title)}</div>
      <div class="fr-text--md fr-mb-0" style={{ fontWeight: '500' }}>
        {textProp in props ? <>{capitalize(props[textProp])}</> : <>{props.item}</>}
      </div>
    </div>
  )
}

export const EtapePropEntreprisesItem: FunctionalComponent<{ title: string; entreprises: EntreprisesByEtapeId[] | null }> = props => {
  if (props.entreprises === null || props.entreprises.length === 0) {
    return null
  }
  const items = (
    <ul class="fr-m-0 fr-p-0" style={{ listStyle: 'none' }}>
      {props.entreprises?.map(entreprise => {
        return (
          <li>
            <CaminoRouterLink to={{ name: 'entreprise', params: { id: entreprise.id } }} title={entreprise.nom} class="fr-link">
              {capitalize(entreprise.nom)}
            </CaminoRouterLink>
            {entreprise.operateur ? ' (opérateur)' : ''}
          </li>
        )
      })}
    </ul>
  )

  return <EtapePropItem title={`${props.title}${(props.entreprises?.length ?? 0) > 1 ? 's' : ''}`} item={items} />
}

export const EtapePropAdministrationsItem: FunctionalComponent<{ administrations: AdministrationId[] | null }> = props => {
  if (props.administrations === null || props.administrations.length === 0) {
    return null
  }
  const items = (
    <ul class="fr-m-0 fr-p-0" style={{ listStyle: 'none' }}>
      {props.administrations?.map(administrationId => {
        const administration = Administrations[administrationId]

        return (
          <li>
            <CaminoRouterLink to={{ name: 'administration', params: { id: administration.id } }} title={administration.nom} class="fr-link">
              {capitalize(administration.abreviation)}
            </CaminoRouterLink>
          </li>
        )
      })}
    </ul>
  )

  return <EtapePropItem title={`Administration${(props.administrations?.length ?? 0) > 1 ? 's' : ''}`} item={items} />
}
