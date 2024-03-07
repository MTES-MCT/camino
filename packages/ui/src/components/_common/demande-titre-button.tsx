import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { TitresTypesIds } from 'camino-common/src/static/titresTypes'
import { FunctionalComponent } from 'vue'
import { User } from 'camino-common/src/roles'
import { DsfrLink } from '../_ui/dsfr-button'

export const DemandeTitreButton: FunctionalComponent<{ user: User }> = ({ user }) => {
  if (TitresTypesIds.some(titreTypeId => canCreateTitre(user, titreTypeId))) {
    return <DsfrLink to={{ name: 'titre-creation' }} buttonType="primary" title="Demander un titre" icon="fr-icon-add-line" disabled={false} />
  }

  return null
}
