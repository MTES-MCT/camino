import { FunctionalComponent } from 'vue'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitresTypes as TT, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { Domaine as CaminoDomaine } from '@/components/_common/domaine'
import { Icon } from '@/components/_ui/icon'

interface Props {
  administrationId: AdministrationId
}

type AdministrationTitresTypes = {
  titreTypeId: TitreTypeId
  domaineId: DomaineId
  titreTypeTypeNom: string
  gestionnaire: boolean
  associee: boolean
}

const titresTypes = (administrationId: AdministrationId): AdministrationTitresTypes[] => {
  return getTitreTypeIdsByAdministration(administrationId).map(att => {
    const titreType = TT[att.titreTypeId]

    return {
      titreTypeId: att.titreTypeId,
      domaineId: titreType.domaineId,
      titreTypeTypeNom: TitresTypesTypes[titreType.typeId].nom,
      gestionnaire: att.gestionnaire,
      associee: att.associee,
    }
  })
}

export const TitresTypes: FunctionalComponent<Props> = props => (
  <div class="mb-xxl">
    <h3>Administration gestionnaire ou associée</h3>

    <div class="h6">
      <ul class="list-prefix">
        <li>
          Un utilisateur d'une <b>administration gestionnaire</b> peut créer et modifier les titres et leur contenu.
        </li>
        <li>
          Un utilisateur d'une <b>administration associée</b> peut voir les titres non-publics. Cette administration n'apparaît pas sur les pages des titres.
        </li>
      </ul>
    </div>

    <div class="line width-full" />
    <div class="width-full-p">
      <div class="overflow-scroll-x mb">
        <table>
          <tr>
            <th>Domaine</th>
            <th>Type de titre</th>
            <th>Gestionnaire</th>
            <th>Associée</th>
          </tr>

          {titresTypes(props.administrationId).map(titreType => (
            <tr key={titreType.titreTypeId}>
              <td class="dsfr">
                <CaminoDomaine domaineId={titreType.domaineId} class="mt-s" />
              </td>
              <td>
                <span class="small bold cap-first mt-s">{titreType.titreTypeTypeNom}</span>
              </td>
              <td>
                <Icon
                  name={titreType.gestionnaire ? 'checkbox' : 'checkbox-blank'}
                  size="M"
                  role="img"
                  aria-label={titreType.gestionnaire ? 'Est gestionnaire de ce type de titre' : 'N’est pas gestionnaire de ce type de titre'}
                />
              </td>
              <td>
                <Icon
                  name={titreType.associee ? 'checkbox' : 'checkbox-blank'}
                  size="M"
                  role="img"
                  aria-label={titreType.associee ? 'Est associée à ce type de titre' : 'N’est pas associée à ce type de titre'}
                />
              </td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  </div>
)
