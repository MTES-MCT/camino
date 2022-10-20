import { DepartementId, DEPARTEMENT_IDS } from './departement'
import { getEntries, onlyUnique } from '../typescript-tools'

const facades = {
  'Manche Est - Mer du Nord': {
    'Manche Ouest au large des îles anglo-normandes': { ids: [1], secteurId: '8', departementIds: [] },
    'Caps et détroit du Pas de Calais': { ids: [2], secteurId: '1', departementIds: [] },
    "Estuaires picards et mer d'Opale": { ids: [3], secteurId: '2', departementIds: [] },
    "Côte d'Albâtre et ses ouverts": { ids: [4], secteurId: '3', departementIds: [] },
    'Baie de Seine': { ids: [5], secteurId: '4', departementIds: [] },
    'Nord Cotentin': { ids: [6], secteurId: '6', departementIds: [] },
    'Ouest Cotentin - Baie du Mont Saint-Michel': { ids: [7], secteurId: '7', departementIds: [] },
    'Large baie de Seine': { ids: [8], secteurId: '5', departementIds: [] }
  },
  'Nord Atlantique - Manche Ouest': {
    'Plaine abyssale': { ids: [9], secteurId: '1', departementIds: [] },
    'Talus continental': { ids: [10], secteurId: '2', departementIds: [] },
    'Manche occidentale': { ids: [11], secteurId: '4', departementIds: [] },
    'Rade de Brest': { ids: [12], secteurId: '5d', departementIds: [] },
    'Bretagne nord': { ids: [13], secteurId: '5b', departementIds: [] },
    "Parc naturel marin d'Iroise": { ids: [14], secteurId: '5c', departementIds: [] },
    'Golfe normand breton et baie du Mont Saint-Michel': { ids: [15], secteurId: '5a', departementIds: [] },
    "Parc naturel marin de l'estuaire de la Gironde et de la mer des Pertuis": { ids: [16], secteurId: '5h', departementIds: [] },
    'Plateau continental central': { ids: [17], secteurId: '3b', departementIds: [DEPARTEMENT_IDS.Vendée] },
    'Plateau continental nord': { ids: [18], secteurId: '3a', departementIds: [] },
    'Baie de Bourgneuf et littoral vendéen': { ids: [19], secteurId: '5g', departementIds: [DEPARTEMENT_IDS.Vendée] },
    'Estuaire de la Loire': { ids: [20], secteurId: '5f', departementIds: [] },
    'Bretagne sud': { ids: [21], secteurId: '5e', departementIds: [] }
  },
  'Sud Atlantique': {
    "Parc Naturel Marin de l'estuaire de la Gironde et de la Mer des Pertuis": { ids: [22], secteurId: '1', departementIds: [] },
    'Plateau continental du Golfe de Gascogne': { ids: [23], secteurId: '5', departementIds: [] },
    "Parc naturel marin du Bassin d'Arcachon": { ids: [24], secteurId: '3', departementIds: [] },
    'Côte sableuse aquitaine': { ids: [25], secteurId: '2', departementIds: [] },
    'Talus du Golfe de Gascogne': { ids: [26], secteurId: '6', departementIds: [] },
    'Plaine abyssale du Golfe de Gascogne': { ids: [27], secteurId: '7', departementIds: [] },
    "Côte rocheuse basque, estuaire de l'Adour, Gouf de Capbreton": { ids: [28], secteurId: '4', departementIds: [] }
  },
  Méditerranée: {
    Sète: { ids: [29], secteurId: '4', departementIds: [] },
    'Littoral varois Ouest': { ids: [30], secteurId: '11', departementIds: [] },
    Camargue: { ids: [31], secteurId: '5', departementIds: [] },
    'Rade de Marseille': { ids: [32], secteurId: '9', departementIds: [] },
    'Port-la-Nouvelle': { ids: [35], secteurId: '2', departementIds: [] },
    'Bouches de Bonifacio Ouest': { ids: [33], secteurId: '28', departementIds: [] },
    'Plaine orientale et large Est de la Corse': { ids: [34], secteurId: '30', departementIds: [] },
    Bastia: { ids: [36], secteurId: '22', departementIds: [] },
    'Canyons du Golfe du Lion': { ids: [37], secteurId: '20', departementIds: [] },
    'Littoral languedocien': { ids: [38, 39], secteurId: '3', departementIds: [] },
    'Périmètre du Parc national de Port-Cros': { ids: [40], secteurId: '13', departementIds: [] },
    'Littoral des Alpes-Maritimes': { ids: [41, 42], secteurId: '17', departementIds: [] },
    Riviera: { ids: [43], secteurId: '15', departementIds: [] },
    'Périmètre du Parc naturel marin du Golfe du Lion': { ids: [44], secteurId: '1', departementIds: [] },
    'Littoral varois Est': { ids: [45], secteurId: '14', departementIds: [] },
    "Périmètre du Parc naturel marin du Cap Corse et de l'Agriate": { ids: [46], secteurId: '21', departementIds: [] },
    'Plateau du Golfe du Lion': { ids: [47], secteurId: '6', departementIds: [] },
    'Côte Bleue': { ids: [48], secteurId: '8', departementIds: [] },
    "Golfe d'Ajaccio": { ids: [49], secteurId: '26', departementIds: [] },
    'Rade de Toulon': { ids: [50], secteurId: '12', departementIds: [] },
    'Périmètre du parc national des Calanques': { ids: [51], secteurId: '10', departementIds: [] },
    'Nice et abords': { ids: [52], secteurId: '16', departementIds: [] },
    'Large côte occidental de la Corse': { ids: [53], secteurId: '27', departementIds: [] },
    'Plaine bathyale': { ids: [54], secteurId: '19', departementIds: [] },
    "Large Provence Alpes Côte d'Azur": { ids: [55, 56], secteurId: '18', departementIds: [] },
    'Bouches de Bonifacio Est - Porto-Vecchio': { ids: [57], secteurId: '29', departementIds: [] },
    'Golfe de Fos-sur-Mer': { ids: [58], secteurId: '7', departementIds: [] },
    'Littoral occidental de la Corse': { ids: [59, 60], secteurId: '25', departementIds: [] },
    Balagne: { ids: [61], secteurId: '23', departementIds: [] },
    Scandola: { ids: [62], secteurId: '24', departementIds: [] }
  }
}

const FACADES = Object.keys(facades) as FacadesMaritimes[]
const SECTEURS = Object.values(facades).flatMap(f => Object.keys(f)) as SecteursMaritimes[]

export type FacadesMaritimes = keyof typeof facades
export type SecteursMaritimes = { [Key in FacadesMaritimes]: keyof typeof facades[Key] }[FacadesMaritimes]
type sect = { [Facade in FacadesMaritimes]: { [Secteur in keyof typeof facades[Facade]]: typeof facades[Facade][Secteur] }[keyof typeof facades[Facade]] }[FacadesMaritimes]
export type SecteursMaritimesIds = sect['ids'][number]

export const getDepartementsByIds = (ids: SecteursMaritimesIds[]): DepartementId[] => {
  return Object.values(facades)
    .flatMap(f =>
      Object.values(f)
        .filter(s => s.ids.some((id: SecteursMaritimesIds) => ids.includes(id)))
        .flatMap(s => s.departementIds ?? [])
    )
    .filter(onlyUnique)
}

export const getSecteurMaritime = (id: SecteursMaritimesIds): SecteursMaritimes => {
  const result: [SecteursMaritimes, any] | undefined = Object.values<Record<string, { ids: number[] }>>(facades)
    .flatMap(f => getEntries(f, isSecteurMaritime))
    .find(([_secteur, value]) => value?.ids?.includes(id))
  if (result === undefined) {
    throw new Error(`Cas impossible, l'id ${id} n'est pas connu`)
  }
  if (!isSecteurMaritime(result[0])) {
    throw new Error(`Cas impossible, le secteur maritime ${result[0]} n'est pas connu`)
  }

  return result[0]
}

export function isSecteurMaritime(secteurMaritime: unknown): secteurMaritime is SecteursMaritimes {
  return SECTEURS.includes(secteurMaritime)
}
export function assertsFacade(facade: unknown): asserts facade is FacadesMaritimes {
  if (!FACADES.includes(facade)) {
    throw new Error(`La façade ${facade} n'existe pas`)
  }
}

export function assertsSecteur<T extends FacadesMaritimes>(facade: T, secteur: unknown): asserts secteur is keyof typeof facades[T] {
  if (!Object.keys(facades[facade]).includes(secteur)) {
    throw new Error(`Le secteur ${secteur} n’existe pas`)
  }
}

export const secteurAJour = (facade: FacadesMaritimes, secteur: SecteursMaritimes, id: unknown, secteurId: unknown): boolean => {
  assertsSecteur(facade, secteur)
  const result: never | { ids: number[]; secteurId: string } = facades[facade][secteur]

  return result.ids.includes(id) && result.secteurId === secteurId
}
