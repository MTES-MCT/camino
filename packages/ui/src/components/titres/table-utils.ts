import { markRaw } from 'vue'
import { TagList } from '../_ui/tag-list'
import { List } from '../_ui/list'
import { Domaine as CaminoDomaine } from '../_common/domaine'
import { TitreNom } from '../_common/titre-nom'
import { TitreTypeTypeNom } from '../_common/titre-type-type-nom'
import { CoordonneesIcone } from '../_common/coordonnees-icone'
import { ActivitesPills } from '../activites/activites-pills'
import { Statut } from '../_common/statut'
import { DomaineId } from 'camino-common/src/static/domaines'
import { Departement, Departements, toDepartementId } from 'camino-common/src/static/departement'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/static/region'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { sortedTitresStatuts, TitresStatuts, TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { ReferencesTypes, ReferenceTypeId } from 'camino-common/src/static/referencesTypes'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getDepartementsBySecteurs } from 'camino-common/src/static/facades'
import { Column } from '../_ui/table-auto'
import { ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { TitreEntreprise } from 'camino-common/src/entreprise'
import { TitreStatut } from '../_common/titre-statut'

const ordreStatut: { [key in TitreStatutId]: number } = {
  dmi: 0,
  mod: 1,
  val: 2,
  dmc: 3,
  ech: 4,
  ind: 5,
}

const ordreFromStatut = (entry: string) => {
  const titreStatut = sortedTitresStatuts.find(({ nom }) => nom === entry)
  if (titreStatut) {
    return ordreStatut[titreStatut.id]
  }
  return -1
}

const isTitreStatut = (entry: string | number | string[] | undefined): entry is string => {
  return sortedTitresStatuts.some(({ nom }) => nom === entry)
}

export const nomColumn: Column<'nom'> = {
  id: 'nom',
  name: 'Nom',
}
export const domaineColumn: Column<'domaine'> = {
  id: 'domaine',
  name: '',
}
export const typeColumn: Column<'type'> = {
  id: 'type',
  name: 'Type',
}

export const activiteColumn: Column<'activites'> = {
  id: 'activites',
  name: 'Activités',
  sort: (statut1: TableRow, statut2: TableRow) => {
    const row1Statut = statut1.columns.activites.value
    const row2Statut = statut2.columns.activites.value
    if (typeof row1Statut === 'number' && typeof row2Statut === 'number') {
      return row1Statut - row2Statut
    }
    return 0
  },
}

export const statutColumn: Column<'statut'> = {
  id: 'statut',
  name: 'Statut',
  sort: (statut1: TableRow, statut2: TableRow) => {
    const row1Statut = statut1.columns.statut.value
    const row2Statut = statut2.columns.statut.value
    if (isTitreStatut(row1Statut) && isTitreStatut(row2Statut)) {
      return ordreFromStatut(row1Statut) - ordreFromStatut(row2Statut)
    }
    return 0
  },
}
export const referencesColumn: Column<'references'> = {
  id: 'references',
  name: 'Références',
  noSort: true,
}
export const titulairesColumn: Column<'titulaires'> = {
  id: 'titulaires',
  name: 'Titulaires',
}
export const titresColonnes: Column[] = [
  nomColumn,
  domaineColumn,
  typeColumn,
  statutColumn,
  activiteColumn,
  {
    id: 'substances',
    name: 'Substances',
    noSort: true,
  },
  {
    id: 'coordonnees',
    name: 'Carte',
  },
  titulairesColumn,
  {
    id: 'regions',
    name: 'Régions',
    noSort: true,
  },
  {
    id: 'departements',
    name: 'Départements',
    noSort: true,
  },
  referencesColumn,
]

export const nomCell = (titre: { nom: string }): ComponentColumnData => ({
  component: markRaw(TitreNom),
  props: { nom: titre.nom },
  value: titre.nom,
})
export const statutCell = (titre: { titre_statut_id: TitreStatutId }): ComponentColumnData => {
  const statut = TitresStatuts[titre.titre_statut_id]
  return {
    component: markRaw(TitreStatut),
    props: {
      titreStatutId: titre.titre_statut_id,
    },
    value: statut.nom,
  }
}

export const referencesCell = (titre: { references?: { nom: string; referenceTypeId: ReferenceTypeId }[] }) => {
  const references = titre.references?.map(ref => `${ReferencesTypes[ref.referenceTypeId].nom} : ${ref.nom}`)

  return {
    component: List,
    props: {
      elements: references,
      mini: true,
    },
    class: 'mb--xs',
    value: references,
  }
}
export const titulairesCell = (titre: { titulaires?: { nom?: string }[] }) => ({
  component: markRaw(List),
  props: {
    elements: titre.titulaires?.map(({ nom }) => nom ?? ''),
    mini: true,
  },
  class: 'mb--xs',
  value: titre.titulaires?.map(({ nom }) => nom ?? '').join(', '),
})
export const domaineCell = (titre: { domaineId: DomaineId }) => ({
  component: markRaw(CaminoDomaine),
  props: { domaineId: titre.domaineId },
  value: titre.domaineId,
})

export const typeCell = (typeId: TitreTypeId) => {
  return {
    component: markRaw(TitreTypeTypeNom),
    props: { titreTypeId: typeId },
    value: typeId,
  }
}
export const activitesCell = (titre: { activitesAbsentes: number | null; activitesEnConstruction: number | null }) => ({
  component: markRaw(ActivitesPills),
  props: {
    activitesAbsentes: titre.activitesAbsentes,
    activitesEnConstruction: titre.activitesEnConstruction,
  },
  value: (titre?.activitesAbsentes ?? 0) + (titre?.activitesEnConstruction ?? 0),
})
export const titresLignesBuild = (titres: TitreEntreprise[], activitesCol: boolean, ordre = 'asc'): TableRow[] =>
  titres.map(titre => {
    const departements: Departement[] = [...(titre.communes?.map(({ id }) => toDepartementId(id)) ?? []), ...getDepartementsBySecteurs(titre.secteursMaritime ?? [])]
      .filter(onlyUnique)
      .map(departementId => Departements[departementId])

    const departementNoms: string[] = departements.map(({ nom }) => nom)
    const regionNoms: string[] = departements.map(({ regionId }) => Regions[regionId].nom).filter(onlyUnique)

    const columns: { [key in string]: ComponentColumnData | TextColumnData } = {
      nom: nomCell(titre),
      domaine: domaineCell({ domaineId: getDomaineId(titre.typeId) }),
      coordonnees: {
        component: markRaw(CoordonneesIcone),
        props: { coordonnees: titre.coordonnees },
        value: titre.coordonnees ? '·' : '',
      },
      type: typeCell(titre.typeId),
      statut: statutCell({ titre_statut_id: titre.titreStatutId }),
      substances: {
        component: markRaw(List),
        props: {
          elements: titre.substances?.map(substanceId => SubstancesLegale[substanceId].nom) ?? [],
        },
        value: titre.substances?.map(substanceId => SubstancesLegale[substanceId].nom).join(', '),
      },
      titulaires: titulairesCell(titre),
      regions: {
        component: markRaw(List),
        props: {
          elements: regionNoms,
          mini: true,
        },
        value: regionNoms,
      },
      departements: {
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
