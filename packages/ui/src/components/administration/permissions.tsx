import { Domaine as CaminoDomaine } from '../_common/domaine'
import { Icon } from '../_ui/icon'
import { TitresTypes } from './titres-types'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitresTypes as TT } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { FunctionalComponent } from 'vue'
import { getAdministrationTitresTypesTitresStatuts } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes'
import { TitreStatut } from '../_common/titre-statut'
import { Column, TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { capitalize } from 'camino-common/src/strings'
interface Props {
  administrationId: AdministrationId
}
const restrictionEditionColonnes = [
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
    id: 'titreStatutId',
    name: 'Statut de titre',
    noSort: true,
  },
  {
    id: 'titres',
    name: 'Titres',
    noSort: true,
  },
  {
    id: 'demarches',
    name: 'Démarches',
    noSort: true,
  },
  {
    id: 'etapes',
    name: 'Étapes',
    noSort: true,
  },
] as const satisfies readonly Column[]
const restrictionVisibiliteColonnes = [
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
    id: 'etapeTypeId',
    name: "Type d'étape",
    noSort: true,
  },
  {
    id: 'visibilite',
    name: 'Visibilité',
    noSort: true,
  },
  {
    id: 'modification',
    name: 'Modification',
    noSort: true,
  },
  {
    id: 'creation',
    name: 'Création',
    noSort: true,
  },
] as const satisfies readonly Column[]
const restrictionEditionRows = (entries: ReturnType<typeof getAdministrationTitresTypesTitresStatuts>): TableRow[] =>
  entries.map(ttts => {
    const columns: TableRow['columns'] = {
      domaine: { component: CaminoDomaine, props: { domaineId: TT[ttts.titreTypeId].domaineId }, value: TT[ttts.titreTypeId].domaineId },
      titreTypeId: { value: capitalize(TitresTypesTypes[TT[ttts.titreTypeId].typeId].nom) },
      titreStatutId: { component: TitreStatut, props: { titreStatutId: ttts.titreStatutId }, value: ttts.titreStatutId },
      titres: {
        component: Icon,
        props: {
          name: ttts.titresModificationInterdit ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': ttts.titresModificationInterdit ? 'La modification des titres est interdite' : 'La modification des titres est autorisée',
        },
        value: `${ttts.titresModificationInterdit}`,
      },
      demarches: {
        component: Icon,
        props: {
          name: ttts.demarchesModificationInterdit ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': ttts.demarchesModificationInterdit ? 'La modification des démarches est interdite' : 'La modification des démarches est autorisée',
        },
        value: `${ttts.demarchesModificationInterdit}`,
      },
      etapes: {
        component: Icon,
        props: {
          name: ttts.etapesModificationInterdit ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': ttts.etapesModificationInterdit ? 'La modification des étapes est interdite' : 'La modification des étapes est autorisée',
        },
        value: `${ttts.etapesModificationInterdit}`,
      },
    }

    return {
      id: `${ttts.titreTypeId}-${ttts.titreStatutId}`,
      link: null,
      columns,
    }
  })
const restrictionVisibiliteRows = (entries: ReturnType<typeof getAdministrationTitresTypesEtapesTypes>): TableRow[] =>
  entries.map(ttet => {
    const columns: TableRow['columns'] = {
      domaine: { component: CaminoDomaine, props: { domaineId: TT[ttet.titreTypeId].domaineId }, value: TT[ttet.titreTypeId].domaineId },
      titreTypeId: { value: capitalize(TitresTypesTypes[TT[ttet.titreTypeId].typeId].nom) },
      etapeTypeId: { value: capitalize(EtapesTypes[ttet.etapeTypeId].nom) },
      visibilite: {
        component: Icon,
        props: {
          name: ttet.lectureInterdit ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': ttet.lectureInterdit ? 'Le type d’étape n’est pas visible' : 'Le type d’étape est visible',
        },
        value: `${ttet.lectureInterdit}`,
      },
      modification: {
        component: Icon,
        props: {
          name: ttet.modificationInterdit ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': ttet.modificationInterdit ? 'Le type d’étape n’est pas modifiable' : 'Le type d’étape est modifiable',
        },
        value: `${ttet.modificationInterdit}`,
      },
      creation: {
        component: Icon,
        props: {
          name: ttet.creationInterdit ? 'checkbox' : 'checkbox-blank',
          size: 'M',
          role: 'img',
          'aria-label': ttet.creationInterdit ? 'Ne peut créer d’étape de ce type' : 'Peut créer une étape de ce type',
        },
        value: `${ttet.creationInterdit}`,
      },
    }

    return {
      id: `${ttet.titreTypeId}-${ttet.etapeTypeId}`,
      link: null,
      columns,
    }
  })

export const Permissions: FunctionalComponent<Props> = props => {
  const titresTypesTitresStatuts = getAdministrationTitresTypesTitresStatuts(props.administrationId)
  const titresTypesEtapesTypes = getAdministrationTitresTypesEtapesTypes(props.administrationId)

  return (
    <div>
      <TitresTypes administrationId={props.administrationId} />

      <div class="mb-xxl">
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
        <TableAuto caption="" columns={restrictionEditionColonnes} rows={restrictionEditionRows(titresTypesTitresStatuts)} initialSort={'firstColumnAsc'} />
      </div>

      <div class="mb-xxl">
        <h3>Restrictions de la visibilité, édition et création des étapes</h3>

        <div class="h6">
          <p class="mb-s">Par défaut, un utilisateur d'une administration gestionnaire ou locale peut voir, modifier et créer des étapes des titre.</p>
          <p>Restreint ces droits par domaine / type de titre / type d'étape.</p>
        </div>

        <hr />
        <TableAuto caption="" columns={restrictionVisibiliteColonnes} rows={restrictionVisibiliteRows(titresTypesEtapesTypes)} initialSort={'firstColumnAsc'} />
      </div>
    </div>
  )
}
