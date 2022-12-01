import { DomaineId } from './static/domaines.js'
import { TitreTypeTypeId } from './static/titresTypesTypes.js'
import { TitreStatutId } from './static/titresStatuts.js'
import { TitreReference } from './titres-references.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { CaminoDate } from './date.js'

export interface CommonTitre {
  id: string
  slug: string
  nom: string
  domaineId: DomaineId
  titreStatutId: TitreStatutId
  references: TitreReference[]
  titulaires: { nom: string }[]
}

export interface CommonTitrePTMG extends CommonTitre {
  enAttenteDePTMG: boolean
}

export interface CommonTitreDREAL extends CommonTitre {
  typeId: TitreTypeTypeId
  activitesAbsentes: number
  activitesEnConstruction: number
  derniereEtape: { etapeTypeId: EtapeTypeId; date: CaminoDate } | null
  enAttenteDeDREAL: boolean
  prochainesEtapes: EtapeTypeId[]
}

export interface CommonTitreONF extends CommonTitre {
  dateCompletudePTMG: string
  dateReceptionONF: string
  dateCARM: string
  enAttenteDeONF: boolean
}

export type TitreLink = Pick<CommonTitre, 'id' | 'nom'>
export type TitreLinks = { amont: TitreLink[]; aval: TitreLink[] }
