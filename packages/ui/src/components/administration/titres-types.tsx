import { FunctionalComponent } from 'vue'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getTitreTypeIdsByAdministration } from 'camino-common/src/static/administrationsTitresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitresTypes as TT, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { Domaine as CaminoDomaine } from '@/components/_common/domaine'
import { Icon } from '@/components/_ui/icon'
import { Column, TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { capitalize } from 'camino-common/src/strings'

interface Props {
  administrationId: AdministrationId
}

type AdministrationTitresTypes = {
  titreTypeId: TitreTypeId
  domaineId: DomaineId
  gestionnaire: boolean
  associee: boolean
}

const titresTypes = (administrationId: AdministrationId): AdministrationTitresTypes[] => {
  return getTitreTypeIdsByAdministration(administrationId).map(att => {
    const titreType = TT[att.titreTypeId]

    return {
      titreTypeId: att.titreTypeId,
      domaineId: titreType.domaineId,
      gestionnaire: att.gestionnaire,
      associee: att.associee,
    }
  })
}
const colonnes = [
  {
    id: 'domaine',
    name: 'Domaine',
    noSort: true,
  },
  {
    id: 'titreTypeId',
    name: 'Type de titre',
    noSort: true,
  },
  {
    id: 'gestionnaire',
    name: 'Gestionnaire',
    noSort: true,
  },
  {
    id: 'associee',
    name: 'Associée',
    noSort: true,
  },
] as const satisfies readonly Column[]

const rows = (entries: AdministrationTitresTypes[]): TableRow[] =>
  entries.map(titreType => {
    const columns: TableRow['columns'] = {
      domaine: { component: CaminoDomaine, props: { domaineId: TT[titreType.titreTypeId].domaineId }, value: TT[titreType.titreTypeId].domaineId },
      titreTypeId: { value: capitalize(TitresTypesTypes[TT[titreType.titreTypeId].typeId].nom) },
      gestionnaire: {
        component: Icon,
        props: {
          name: titreType.gestionnaire ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': titreType.gestionnaire ? 'Est gestionnaire de ce type de titre' : 'N’est pas gestionnaire de ce type de titre',
        },
        value: `${titreType.gestionnaire}`,
      },
      associee: {
        component: Icon,
        props: {
          name: titreType.associee ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': titreType.associee ? 'Est associée à ce type de titre' : 'N’est pas associée à ce type de titre',
        },
        value: `${titreType.associee}`,
      },
    }

    return {
      id: titreType.titreTypeId,
      link: null,
      columns,
    }
  })
export const TitresTypes: FunctionalComponent<Props> = props => (
  <div>
    <h3>Administration gestionnaire ou associée</h3>

    <div class="h6">
      <ul>
        <li>
          Un utilisateur d'une <b>administration gestionnaire</b> peut créer et modifier les titres et leur contenu.
        </li>
        <li>
          Un utilisateur d'une <b>administration associée</b> peut voir les titres non-publics. Cette administration n'apparaît pas sur les pages des titres.
        </li>
      </ul>
    </div>

    <hr />
    <TableAuto caption="" columns={colonnes} rows={rows(titresTypes(props.administrationId))} initialSort={'firstColumnAsc'} />
  </div>
)
