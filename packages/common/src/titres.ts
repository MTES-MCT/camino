import { DomaineId } from './static/domaines'
import { TitreTypeTypeId } from './static/titresTypesTypes'
import { TitreStatutId } from './static/titresStatuts'
import { TitreReference } from './titres-references'

export interface CommonTitre {
  id: string
  slug: string
  nom: string
  titreStatutId: TitreStatutId
  references: TitreReference[]
  titulaires: { nom: string }[]
}

export interface CommonTitrePTMG extends CommonTitre {
  enAttenteDePTMG: boolean
}

export interface CommonTitreDREAL extends CommonTitre {
  domaineId: DomaineId
  typeId: TitreTypeTypeId
  activitesAbsentes: number
  activitesEnConstruction: number
  enAttenteDeDREAL: boolean
}

export interface CommonTitreONF extends CommonTitre {
  dateCompletudePTMG: string
  dateReceptionONF: string
  dateCARM: string
  enAttenteDeONF: boolean
}

export type TitreLink = Pick<CommonTitre, 'id' | 'nom'>
export type TitreLinks = { amont: TitreLink[]; aval: TitreLink[] }
