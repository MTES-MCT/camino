import { DomaineId } from './static/domaines'
import { TitreTypeTypeId } from './static/titresTypesTypes'
import { TitreStatutId } from './static/titresStatuts'

export interface CommonTitre {
  id: string
  slug: string
  nom: string
  titreStatutId: TitreStatutId
  references: { nom: string; type: { nom: string } }[]
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
}

export interface CommonTitreONF extends CommonTitre {
  dateCompletudePTMG: string
  dateReceptionONF: string
  dateCARM: string
  enAttenteDeONF: boolean
}

export type TitreLink = Pick<CommonTitre, 'id' | 'nom'>
export type TitreLinks = { amont: TitreLink[]; aval: TitreLink[] }
