import { markRaw } from 'vue'
import { List } from '../_ui/list'
import { Domaine as CaminoDomaine } from '../_common/domaine'
import { TitreNom } from '../_common/titre-nom'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { ActivitesPills } from '../activites/activites-pills'
import { DomaineId } from 'camino-common/src/static/domaines'
import { Departement, Departements, toDepartementId } from 'camino-common/src/static/departement'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/static/region'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { TitresStatuts, TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { ReferencesTypes, ReferenceTypeId } from 'camino-common/src/static/referencesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getDepartementsBySecteurs } from 'camino-common/src/static/facades'
import { ComponentColumnData, TableRow, TextColumnData, Column } from '../_ui/table'
import { TitreStatut } from '../_common/titre-statut'
import { TitreForTable } from '../titre/titre-api-client'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { Badges } from '../_ui/badges'

export const nomColumn: Column<'nom'> = {
  id: 'nom',
  contentTitle: 'Nom',
}
export const domaineColumn: Column<'domaine'> = {
  id: 'domaine',
  contentTitle: '',
}
export const typeColumn: Column<'type'> = {
  id: 'type',
  contentTitle: 'Type',
}

const activiteColumn: Column<'activites'> = {
  id: 'activites',
  contentTitle: 'Activités',
  noSort: true,
}

export const statutColumn: Column<'statut'> = {
  id: 'statut',
  contentTitle: 'Statut',
}

export const referencesColumn: Column<'references'> = {
  id: 'references',
  contentTitle: 'Références',
  noSort: true,
}
export const titulairesColumn: Column<'titulaires'> = {
  id: 'titulaires',
  contentTitle: 'Titulaires',
  noSort: true,
}
export const titresColonnes = [
  nomColumn,
  domaineColumn,
  typeColumn,
  statutColumn,
  activiteColumn,
  {
    id: 'substances',
    contentTitle: 'Substances',
    noSort: true,
  },
  titulairesColumn,
  {
    id: 'regions',
    contentTitle: 'Régions',
    noSort: true,
  },
  {
    id: 'departements',
    contentTitle: 'Départements',
    noSort: true,
  },
  referencesColumn,
] as const satisfies readonly Column[]

export const nomCell = (titre: { nom: string }): ComponentColumnData => ({
  type: 'component',
  component: markRaw(TitreNom),
  props: { nom: titre.nom },
  value: titre.nom,
})
export const statutCell = (titre: { titre_statut_id: TitreStatutId }): ComponentColumnData => {
  const statut = TitresStatuts[titre.titre_statut_id]

  return {
    type: 'component',
    component: markRaw(TitreStatut),
    props: {
      titreStatutId: titre.titre_statut_id,
    },
    value: statut.nom,
  }
}

export const referencesCell = (titre: { references?: { nom: string; referenceTypeId: ReferenceTypeId }[] }): ComponentColumnData => {
  const references = titre.references?.map(ref => `${ReferencesTypes[ref.referenceTypeId].nom} : ${ref.nom}`)

  return {
    type: 'component',
    component: List,
    props: {
      elements: references,
      mini: true,
    },
    class: 'mb--xs',
    value: references,
  }
}
export const titulairesCell = (titre: { titulaireIds?: EntrepriseId[] }, entreprisesIndex: Record<EntrepriseId, string>): ComponentColumnData => {
  return {
    type: 'component',
    component: markRaw(List),
    props: {
      elements: titre.titulaireIds?.map(id => entreprisesIndex[id]),
      mini: true,
    },
    class: 'mb--xs',
    value: titre.titulaireIds?.map(id => entreprisesIndex[id] ?? '').join(', '),
  }
}
export const domaineCell = (titre: { domaineId: DomaineId }): ComponentColumnData => ({
  type: 'component',
  component: markRaw(CaminoDomaine),
  props: { domaineId: titre.domaineId },
  value: titre.domaineId,
})

export const typeCell = (typeId: TitreTypeId): ComponentColumnData => {
  return {
    type: 'component',
    component: markRaw(TitreTypeTypeNom),
    props: { titreTypeId: typeId },
    value: typeId,
  }
}
const activitesCell = (titre: { activitesAbsentes: number | null; activitesEnConstruction: number | null }): ComponentColumnData => ({
  type: 'component',
  component: markRaw(ActivitesPills),
  props: {
    activitesAbsentes: titre.activitesAbsentes,
    activitesEnConstruction: titre.activitesEnConstruction,
  },
  value: (titre?.activitesAbsentes ?? 0) + (titre?.activitesEnConstruction ?? 0),
})
export const titresLignesBuild = (titres: TitreForTable[], activitesCol: boolean, entreprisesIndex: Record<EntrepriseId, string>): TableRow[] => {
  return titres.map(titre => {
    const departements: Departement[] = [...(titre.communes?.map(({ id }) => toDepartementId(id)) ?? []), ...getDepartementsBySecteurs(titre.secteursMaritime ?? [])]
      .filter(onlyUnique)
      .map(departementId => Departements[departementId])

    const departementNoms: string[] = departements.map(({ nom }) => nom)
    const regionNoms: string[] = departements.map(({ regionId }) => Regions[regionId].nom).filter(onlyUnique)

    const columns: { [key in string]: ComponentColumnData | TextColumnData } = {
      nom: nomCell(titre),
      domaine: domaineCell({ domaineId: getDomaineId(titre.typeId) }),
      type: typeCell(titre.typeId),
      statut: statutCell({ titre_statut_id: titre.titreStatutId }),
      substances: {
        type: 'component',
        component: markRaw(Badges),
        props: {
          elements: titre.substances?.map(substanceId => SubstancesLegale[substanceId].nom) ?? [],
        },
        value: titre.substances?.map(substanceId => SubstancesLegale[substanceId].nom).join(', '),
      },
      titulaires: titulairesCell(titre, entreprisesIndex),
      regions: {
        type: 'component',
        component: markRaw(List),
        props: {
          elements: regionNoms,
          mini: true,
        },
        value: regionNoms,
      },
      departements: {
        type: 'component',
        component: markRaw(List),
        props: {
          elements: departementNoms,
          mini: true,
        },
        value: departementNoms,
      },
      references: referencesCell(titre),
    }

    if (activitesCol) {
      columns.activites = activitesCell(titre)
    }

    return {
      id: titre.id,
      link: { name: 'titre', params: { id: titre.slug } },
      columns,
    }
  })
}
