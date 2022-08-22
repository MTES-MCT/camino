import { markRaw } from '@vue/reactivity'
import TagList from '../_ui/tag-list.vue'
import List from '../_ui/list.vue'
import CaminoDomaine from '../_common/domaine.vue'
import TitreNom from '../_common/titre-nom.vue'
import TitreTypeTypeNom from '../_common/titre-type-type-nom.vue'
import CoordonneesIcone from '../_common/coordonnees-icone.vue'
import ActivitesPills from '../_common/pills.vue'
import Statut from '../_common/statut.vue'
import { DomaineId } from 'camino-common/src/static/domaines'
import {
  TitresTypesTypes,
  TitreTypeTypeId
} from 'camino-common/src/static/titresTypesTypes'
import {
  Column,
  ComponentColumnData,
  TableAutoRow,
  TextColumnData
} from '@/components/_ui/table-auto.type'
import {
  DepartementId,
  Departements
} from 'camino-common/src/static/departement'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/static/region'
import {
  SubstanceLegaleId,
  SubstancesLegale
} from 'camino-common/src/static/substancesLegales'

interface Reference {
  type: { nom: string }
  nom: string
}

interface Titulaire {
  id: string
  nom: string
}
export interface TitreEntreprise {
  id: string
  slug: string
  nom: string
  communes?: { departementId: DepartementId }[]
  references?: Reference[]
  domaine: { id: DomaineId; nom: string }
  coordonnees?: { x: number; y: number }
  // id devrait être une union
  type: {
    id: string
    typeId: string
    domaineId: DomaineId
    type: { id: TitreTypeTypeId; nom: string }
  }
  // id devrait être une union, couleur aussi
  statut: { id: string; nom: string; couleur: string }
  substances: SubstanceLegaleId[]
  titulaires: Titulaire[]
  activitesAbsentes: number | null
  activitesEnConstruction: number | null
}

const STATUTS = [
  'demande initiale',
  'modification en instance',
  'valide',
  'demande classée',
  'échu'
] as const

type DemandeStatut = typeof STATUTS[number]

export const ordreStatut: { [key in DemandeStatut]: number } = {
  'demande initiale': 0,
  'modification en instance': 1,
  valide: 2,
  'demande classée': 3,
  échu: 4
}

export const isDemandeStatut = (
  entry: string | number | string[] | undefined
): entry is DemandeStatut => {
  return STATUTS.includes(entry)
}

export const nomColumn: Column<'nom'> = {
  id: 'nom',
  name: 'Nom',
  class: ['min-width-8']
}
export const domaineColumn: Column<'domaine'> = {
  id: 'domaine',
  name: ''
}
export const typeColumn: Column<'type'> = {
  id: 'type',
  name: 'Type',
  class: ['min-width-8']
}

export const activiteColumn: Column<'activites'> = {
  id: 'activites',
  name: 'Activités',
  class: ['min-width-5'],
  sort: (statut1: TableAutoRow, statut2: TableAutoRow) => {
    const row1Statut = statut1.columns.activites.value
    const row2Statut = statut2.columns.activites.value
    if (typeof row1Statut === 'number' && typeof row2Statut === 'number') {
      return row1Statut - row2Statut
    }
    return 0
  }
}

export const statutColumn: Column<'statut'> = {
  id: 'statut',
  name: 'Statut',
  class: ['nowrap', 'min-width-5'],
  sort: (statut1: TableAutoRow, statut2: TableAutoRow) => {
    const row1Statut = statut1.columns.statut.value
    const row2Statut = statut2.columns.statut.value
    if (isDemandeStatut(row1Statut) && isDemandeStatut(row2Statut)) {
      return ordreStatut[row1Statut] - ordreStatut[row2Statut]
    }
    return 0
  }
}
export const referencesColumn: Column<'references'> = {
  id: 'references',
  name: 'Références',
  class: ['min-width-8']
}
export const titulairesColumn: Column<'titulaires'> = {
  id: 'titulaires',
  name: 'Titulaires',
  class: ['min-width-10']
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
    class: ['min-width-6'],
    noSort: true
  },
  {
    id: 'coordonnees',
    name: 'Carte'
  },
  titulairesColumn,
  {
    id: 'regions',
    name: 'Régions',
    class: ['min-width-8'],
    noSort: true
  },
  {
    id: 'departements',
    name: 'Départements',
    class: ['min-width-8'],
    noSort: true
  },
  referencesColumn
]

export const nomCell = (titre: { nom: string }): ComponentColumnData => ({
  component: markRaw(TitreNom),
  props: { nom: titre.nom },
  value: titre.nom
})
export const statutCell = (titre: {
  statut: { nom: string; couleur: string }
}): ComponentColumnData => ({
  component: markRaw(Statut),
  props: {
    color: titre.statut.couleur,
    nom: titre.statut.nom
  },
  value: titre.statut.nom
})

export const referencesCell = (titre: {
  references?: { nom: string; type: { nom: string } }[]
}) => {
  const references = titre.references?.map(
    ref => `${ref.type.nom} : ${ref.nom}`
  )

  return {
    component: List,
    props: {
      elements: references,
      mini: true
    },
    class: 'mb--xs',
    value: references
  }
}
export const titulairesCell = (titre: { titulaires?: { nom: string }[] }) => ({
  component: markRaw(List),
  props: {
    elements: titre.titulaires?.map(({ nom }) => nom),
    mini: true
  },
  class: 'mb--xs',
  value: titre.titulaires?.map(({ nom }) => nom).join(', ')
})
export const domaineCell = (titre: { domaineId: DomaineId }) => ({
  component: markRaw(CaminoDomaine),
  props: { domaineId: titre.domaineId },
  value: titre.domaineId
})

export const typeCell = (titre: { typeId: TitreTypeTypeId }) => ({
  component: markRaw(TitreTypeTypeNom),
  props: { nom: TitresTypesTypes[titre.typeId].nom },
  value: TitresTypesTypes[titre.typeId].nom
})
export const activitesCell = (titre: {
  activitesAbsentes: number | null
  activitesEnConstruction: number | null
}) => ({
  component: markRaw(ActivitesPills),
  props: {
    activitesAbsentes: titre.activitesAbsentes,
    activitesEnConstruction: titre.activitesEnConstruction
  },
  value: (titre?.activitesAbsentes ?? 0) + (titre?.activitesEnConstruction ?? 0)
})
export const titresLignesBuild = (
  titres: TitreEntreprise[],
  activitesCol: boolean,
  ordre = 'asc'
): TableAutoRow[] =>
  titres.map(titre => {
    const departements =
      titre.communes
        ?.map(({ departementId }) => Departements[departementId])
        .filter(onlyUnique) ?? []
    const departementNoms: string[] = departements.map(({ nom }) => nom)
    const regionNoms: string[] = departements
      .map(({ regionId }) => Regions[regionId].nom)
      .filter(onlyUnique)

    const columns: { [key in string]: ComponentColumnData | TextColumnData } = {
      nom: nomCell(titre),
      domaine: domaineCell({ domaineId: titre.domaine.id }),
      coordonnees: {
        component: markRaw(CoordonneesIcone),
        props: { coordonnees: titre.coordonnees },
        value: titre.coordonnees ? '·' : ''
      },
      type: typeCell({ typeId: titre.type.type.id }),
      statut: statutCell(titre),
      substances: {
        component: markRaw(TagList),
        props: {
          elements: titre.substances?.map(
            substanceId => SubstancesLegale[substanceId].nom
          )
        },
        class: 'mb--xs',
        value: titre.substances
          ?.map(substanceId => SubstancesLegale[substanceId].nom)
          .join(', ')
      },
      titulaires: titulairesCell(titre),
      regions: {
        component: markRaw(List),
        props: {
          elements: regionNoms,
          mini: true
        },
        class: 'mb--xs',
        value: regionNoms
      },
      departements: {
        component: markRaw(List),
        props: {
          elements: departementNoms,
          mini: true
        },
        class: 'mb--xs',
        value: departementNoms
      },
      references: referencesCell(titre)
    }

    if (activitesCol) {
      columns.activites = activitesCell(titre)
    }

    return {
      id: titre.id,
      link: { name: 'titre', params: { id: titre.slug } },
      columns
    }
  })
