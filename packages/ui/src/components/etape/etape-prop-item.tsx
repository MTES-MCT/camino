import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent } from 'vue'
import { EntreprisesByEtapeId } from 'camino-common/src/demarche'
import { CaminoRouterLink } from '../../router/camino-router-link'

const textProp = 'text'

type ItemProp = {
  item: JSX.Element
}
type TextProp = {
  [textProp]: string
}
type Props = (TextProp | ItemProp) & {
  title: string
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
  let items = <></>
  if (props.entreprises.length > 1) {
    items = (
      <ul class="fr-m-0">
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
  } else {
    const entreprise = props.entreprises?.[0]
    items = (
      <>
        {' '}
        <CaminoRouterLink to={{ name: 'entreprise', params: { id: entreprise.id } }} title={entreprise.nom} class="fr-link">
          {capitalize(entreprise.nom)}
        </CaminoRouterLink>
        {entreprise.operateur ? ' (opérateur)' : ''}
      </>
    )
  }

  return <EtapePropItem title={`${props.title}${(props.entreprises?.length ?? 0) > 1 ? 's' : ''}`} item={items} />
}
