import { Domaine as CaminoDomaine } from '../_common/domaine'
import { DsfrIcon } from '../_ui/icon'
import { TitresTypes } from './titres-types'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitresTypes as TT } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { FunctionalComponent } from 'vue'
import { getAdministrationTitresTypesTitresStatuts } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes'
import { TitreStatut } from '../_common/titre-statut'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'
import { capitalize } from 'camino-common/src/strings'

import { FrIconClassName } from '@codegouvfr/react-dsfr'

interface Props {
  administrationId: AdministrationId
}
const restrictionEditionColonnes = [
  {
    id: 'domaine',
    contentTitle: 'Domaine',
  },
  {
    id: 'titreTypeId',
    contentTitle: 'Type de titre',
  },
  {
    id: 'titreStatutId',
    contentTitle: 'Statut de titre',
  },
  {
    id: 'titres',
    contentTitle: 'Titres',
  },
  {
    id: 'demarches',
    contentTitle: 'Démarches',
  },
  {
    id: 'etapes',
    contentTitle: 'Étapes',
  },
] as const satisfies readonly Column[]
const restrictionVisibiliteColonnes = [
  {
    id: 'domaine',
    contentTitle: 'Domaine',
  },
  {
    id: 'titreTypeId',
    contentTitle: 'Type de titre',
  },
  {
    id: 'etapeTypeId',
    contentTitle: "Type d'étape",
  },
  {
    id: 'visibilite',
    contentTitle: 'Visibilité',
  },
  {
    id: 'modification',
    contentTitle: 'Modification',
  },
  {
    id: 'creation',
    contentTitle: 'Création',
  },
] as const satisfies readonly Column[]

export const checkboxCheckedIcon: FrIconClassName = 'fr-icon-check-line'
export const checkboxBlankIcon: FrIconClassName = 'fr-icon-close-line'

const restrictionEditionRows = (entries: ReturnType<typeof getAdministrationTitresTypesTitresStatuts>): TableRow[] =>
  entries.map(ttts => {
    const columns: TableRow['columns'] = {
      domaine: { type: 'jsx', jsxElement: <CaminoDomaine domaineId={TT[ttts.titreTypeId].domaineId} />, value: TT[ttts.titreTypeId].domaineId },
      titreTypeId: { type: 'text', value: capitalize(TitresTypesTypes[TT[ttts.titreTypeId].typeId].nom) },
      titreStatutId: { type: 'jsx', jsxElement: <TitreStatut titreStatutId={ttts.titreStatutId} />, value: ttts.titreStatutId },
      titres: {
        type: 'jsx',
        jsxElement: (
          <DsfrIcon
            name={ttts.titresModificationInterdit ? checkboxCheckedIcon : checkboxBlankIcon}
            size="md"
            role="img"
            aria-label={ttts.titresModificationInterdit ? 'La modification des titres est interdite' : 'La modification des titres est autorisée'}
          />
        ),
        value: `${ttts.titresModificationInterdit}`,
      },
      demarches: {
        type: 'jsx',
        jsxElement: (
          <DsfrIcon
            name={ttts.demarchesModificationInterdit ? checkboxCheckedIcon : checkboxBlankIcon}
            size="md"
            role="img"
            aria-label={ttts.demarchesModificationInterdit ? 'La modification des démarches est interdite' : 'La modification des démarches est autorisée'}
          />
        ),
        value: `${ttts.demarchesModificationInterdit}`,
      },
      etapes: {
        type: 'jsx',
        jsxElement: (
          <DsfrIcon
            name={ttts.etapesModificationInterdit ? checkboxCheckedIcon : checkboxBlankIcon}
            size="md"
            role="img"
            aria-label={ttts.etapesModificationInterdit ? 'La modification des étapes est interdite' : 'La modification des étapes est autorisée'}
          />
        ),
        value: `${ttts.etapesModificationInterdit}`,
      },
    }

    return {
      id: `${ttts.titreTypeId}-${ttts.titreStatutId}`,
      link: null,
      columns,
    }
  })
const restrictionVisibiliteRows = (entries: ReturnType<typeof getAdministrationTitresTypesEtapesTypes>): TableRow[] => {
  return entries.map(ttet => {
    const columns: TableRow['columns'] = {
      domaine: { type: 'jsx', jsxElement: <CaminoDomaine domaineId={TT[ttet.titreTypeId].domaineId} />, value: TT[ttet.titreTypeId].domaineId },
      titreTypeId: { type: 'text', value: capitalize(TitresTypesTypes[TT[ttet.titreTypeId].typeId].nom) },
      etapeTypeId: { type: 'text', value: capitalize(EtapesTypes[ttet.etapeTypeId].nom) },
      visibilite: {
        type: 'jsx',
        jsxElement: (
          <DsfrIcon
            name={ttet.lectureInterdit ? checkboxCheckedIcon : checkboxBlankIcon}
            size="md"
            role="img"
            aria-label={ttet.lectureInterdit ? 'Le type d’étape n’est pas visible' : 'Le type d’étape est visible'}
          />
        ),
        value: `${ttet.lectureInterdit}`,
      },
      modification: {
        type: 'jsx',

        jsxElement: (
          <DsfrIcon
            name={ttet.modificationInterdit ? checkboxCheckedIcon : checkboxBlankIcon}
            size="md"
            role="img"
            aria-label={ttet.modificationInterdit ? 'Le type d’étape n’est pas modifiable' : 'Le type d’étape est modifiable'}
          />
        ),
        value: `${ttet.modificationInterdit}`,
      },
      creation: {
        type: 'jsx',
        jsxElement: (
          <DsfrIcon
            name={ttet.creationInterdit ? checkboxCheckedIcon : checkboxBlankIcon}
            size="md"
            role="img"
            aria-label={ttet.creationInterdit ? 'Ne peut créer d’étape de ce type' : 'Peut créer une étape de ce type'}
          />
        ),
        value: `${ttet.creationInterdit}`,
      },
    }

    return {
      id: `${ttet.titreTypeId}-${ttet.etapeTypeId}`,
      link: null,
      columns,
    }
  })
}
export const Permissions: FunctionalComponent<Props> = props => {
  const titresTypesTitresStatuts = getAdministrationTitresTypesTitresStatuts(props.administrationId)
  const titresTypesEtapesTypes = getAdministrationTitresTypesEtapesTypes(props.administrationId)

  return (
    <div>
      <TitresTypes administrationId={props.administrationId} />

      <div>
        <h3>Restrictions de l'édition des titres, démarches et étapes</h3>

        <div class="h6">
          <p class="mb-s">Par défaut :</p>
          <ul class="mb-s">
            <li>Un utilisateur d'une administration gestionnaire peut modifier les titres, démarches et étapes.</li>
            <li>Un utilisateur d'une administration locale peut modifier les démarches et étapes.</li>
          </ul>
          <p>Restreint ces droits par domaine / type de titre / statut de titre.</p>
        </div>
        <hr />
        <TableSimple caption={{ value: '', visible: false }} columns={restrictionEditionColonnes} rows={restrictionEditionRows(titresTypesTitresStatuts)} />
      </div>

      <div>
        <h3>Restrictions de la visibilité, édition et création des étapes</h3>

        <div class="h6">
          <p class="mb-s">Par défaut, un utilisateur d'une administration gestionnaire ou locale peut voir, modifier et créer des étapes des titre.</p>
          <p>Restreint ces droits par domaine / type de titre / type d'étape.</p>
        </div>

        <hr />
        <TableSimple caption={{ value: '', visible: false }} columns={restrictionVisibiliteColonnes} rows={restrictionVisibiliteRows(titresTypesEtapesTypes)} />
      </div>
    </div>
  )
}
