import { DepartementId, DEPARTEMENT_IDS } from './departement.js'
import { getEntries, getKeys, onlyUnique } from '../typescript-tools.js'
import { z } from 'zod'

// prettier-ignore
const IDS = ['Manche Est - Mer du Nord', 'Nord Atlantique - Manche Ouest', 'Sud Atlantique', 'Méditerranée'] as const

// prettier-ignore
const SECTEURS_MARITIME_IDS = [
  'Caps et détroit du Pas de Calais', "Estuaires picards et mer d'Opale", "Côte d'Albâtre et ses ouverts", 'Baie de Seine', 'Large baie de Seine', 'Nord Cotentin', 'Ouest Cotentin - Baie du Mont Saint-Michel', 'Manche Ouest au large des îles anglo-normandes', 'Plaine abyssale', 'Talus continental', 'Plateau continental nord', 'Plateau continental central', 'Manche occidentale', 'Golfe normand breton et baie du Mont Saint-Michel', 'Bretagne nord', "Parc naturel marin d'Iroise", 'Rade de Brest', 'Bretagne sud', 'Estuaire de la Loire', 'Baie de Bourgneuf et littoral vendéen', "Parc naturel marin de l'estuaire de la Gironde et de la mer des Pertuis", "Parc Naturel Marin de l'estuaire de la Gironde et de la Mer des Pertuis", 'Côte sableuse aquitaine', "Parc naturel marin du Bassin d'Arcachon", "Côte rocheuse basque, estuaire de l'Adour, Gouf de Capbreton", 'Talus du Golfe de Gascogne', 'Plaine abyssale du Golfe de Gascogne', 'Périmètre du Parc naturel marin du Golfe du Lion', 'Port-la-Nouvelle', 'Littoral languedocien', 'Sète', 'Camargue', 'Plateau du Golfe du Lion', 'Côte Bleue', 'Golfe de Fos-sur-Mer', 'Rade de Marseille', 'Périmètre du parc national des Calanques', 'Littoral varois Ouest', 'Rade de Toulon', 'Périmètre du Parc national de Port-Cros', 'Littoral varois Est', 'Riviera', 'Nice et abords', 'Littoral des Alpes-Maritimes', "Large Provence Alpes Côte d'Azur", 'Plaine bathyale', 'Canyons du Golfe du Lion', "Périmètre du Parc naturel marin du Cap Corse et de l'Agriate", 'Bastia', 'Balagne', 'Scandola', 'Littoral occidental de la Corse', "Golfe d'Ajaccio", 'Large côte occidental de la Corse', 'Bouches de Bonifacio Ouest', 'Bouches de Bonifacio Est - Porto-Vecchio', 'Plaine orientale et large Est de la Corse', 'Plateau continental du Golfe de Gascogne',] as const
export const facadeMaritimeIdValidator = z.enum(IDS)
export type FacadesMaritimes = z.infer<typeof facadeMaritimeIdValidator>

export const secteurMaritimeValidator = z.enum(SECTEURS_MARITIME_IDS)
export type SecteursMaritimes = z.infer<typeof secteurMaritimeValidator>
const facades = {
  'Manche Est - Mer du Nord': {
    'Caps et détroit du Pas de Calais': { ids: [2], secteurId: '1', departementIds: [DEPARTEMENT_IDS.Nord, DEPARTEMENT_IDS['Pas-de-Calais']] },
    "Estuaires picards et mer d'Opale": { ids: [3], secteurId: '2', departementIds: [DEPARTEMENT_IDS['Pas-de-Calais'], DEPARTEMENT_IDS.Somme] },
    "Côte d'Albâtre et ses ouverts": { ids: [4], secteurId: '3', departementIds: [DEPARTEMENT_IDS['Seine-Maritime']] },
    'Baie de Seine': { ids: [5], secteurId: '4', departementIds: [DEPARTEMENT_IDS['Seine-Maritime'], DEPARTEMENT_IDS.Calvados, DEPARTEMENT_IDS.Manche] },
    'Large baie de Seine': { ids: [8], secteurId: '5', departementIds: [DEPARTEMENT_IDS['Seine-Maritime'], DEPARTEMENT_IDS.Calvados, DEPARTEMENT_IDS.Manche] },
    'Nord Cotentin': { ids: [6], secteurId: '6', departementIds: [DEPARTEMENT_IDS.Manche] },
    'Ouest Cotentin - Baie du Mont Saint-Michel': { ids: [7], secteurId: '7', departementIds: [DEPARTEMENT_IDS.Manche] },
    'Manche Ouest au large des îles anglo-normandes': { ids: [1], secteurId: '8', departementIds: [DEPARTEMENT_IDS.Manche] },
  },
  'Nord Atlantique - Manche Ouest': {
    'Plaine abyssale': { ids: [9], secteurId: '1', departementIds: [] },
    'Talus continental': { ids: [10], secteurId: '2', departementIds: [] },
    'Plateau continental nord': { ids: [18], secteurId: '3a', departementIds: [DEPARTEMENT_IDS.Finistère] },
    'Plateau continental central': { ids: [17], secteurId: '3b', departementIds: [DEPARTEMENT_IDS.Finistère, DEPARTEMENT_IDS.Morbihan, DEPARTEMENT_IDS['Loire-Atlantique'], DEPARTEMENT_IDS.Vendée] },
    'Manche occidentale': { ids: [11], secteurId: '4', departementIds: [DEPARTEMENT_IDS.Finistère, DEPARTEMENT_IDS["Côtes-d'Armor"]] },
    'Golfe normand breton et baie du Mont Saint-Michel': { ids: [15], secteurId: '5a', departementIds: [DEPARTEMENT_IDS['Ille-et-Vilaine']] },
    'Bretagne nord': { ids: [13], secteurId: '5b', departementIds: [DEPARTEMENT_IDS['Ille-et-Vilaine'], DEPARTEMENT_IDS["Côtes-d'Armor"], DEPARTEMENT_IDS.Finistère] },
    "Parc naturel marin d'Iroise": { ids: [14], secteurId: '5c', departementIds: [DEPARTEMENT_IDS.Finistère] },
    'Rade de Brest': { ids: [12], secteurId: '5d', departementIds: [DEPARTEMENT_IDS.Finistère] },
    'Bretagne sud': { ids: [21], secteurId: '5e', departementIds: [DEPARTEMENT_IDS.Finistère, DEPARTEMENT_IDS.Morbihan, DEPARTEMENT_IDS['Loire-Atlantique']] },
    'Estuaire de la Loire': { ids: [20], secteurId: '5f', departementIds: [DEPARTEMENT_IDS['Loire-Atlantique']] },
    'Baie de Bourgneuf et littoral vendéen': { ids: [19], secteurId: '5g', departementIds: [DEPARTEMENT_IDS['Loire-Atlantique'], DEPARTEMENT_IDS.Vendée] },
    "Parc naturel marin de l'estuaire de la Gironde et de la mer des Pertuis": { ids: [16], secteurId: '5h', departementIds: [DEPARTEMENT_IDS.Vendée] },
  },
  'Sud Atlantique': {
    "Parc Naturel Marin de l'estuaire de la Gironde et de la Mer des Pertuis": { ids: [22], secteurId: '1', departementIds: [DEPARTEMENT_IDS['Charente-Maritime'], DEPARTEMENT_IDS.Gironde] },
    'Côte sableuse aquitaine': { ids: [25], secteurId: '2', departementIds: [DEPARTEMENT_IDS.Gironde, DEPARTEMENT_IDS.Landes] },
    "Parc naturel marin du Bassin d'Arcachon": { ids: [24], secteurId: '3', departementIds: [DEPARTEMENT_IDS.Gironde] },
    "Côte rocheuse basque, estuaire de l'Adour, Gouf de Capbreton": { ids: [28], secteurId: '4', departementIds: [DEPARTEMENT_IDS.Landes, DEPARTEMENT_IDS['Pyrénées-Atlantiques']] },
    'Plateau continental du Golfe de Gascogne': {
      ids: [23],
      secteurId: '5',
      departementIds: [DEPARTEMENT_IDS['Charente-Maritime'], DEPARTEMENT_IDS.Gironde, DEPARTEMENT_IDS.Landes, DEPARTEMENT_IDS['Pyrénées-Atlantiques']],
    },
    'Talus du Golfe de Gascogne': { ids: [26], secteurId: '6', departementIds: [] },
    'Plaine abyssale du Golfe de Gascogne': { ids: [27], secteurId: '7', departementIds: [] },
  },
  Méditerranée: {
    'Périmètre du Parc naturel marin du Golfe du Lion': { ids: [44], secteurId: '1', departementIds: [] },
    'Port-la-Nouvelle': { ids: [35], secteurId: '2', departementIds: [] },
    'Littoral languedocien': { ids: [38, 39], secteurId: '3', departementIds: [] },
    Sète: { ids: [29], secteurId: '4', departementIds: [] },
    Camargue: { ids: [31], secteurId: '5', departementIds: [] },
    'Plateau du Golfe du Lion': { ids: [47], secteurId: '6', departementIds: [] },
    'Côte Bleue': { ids: [48], secteurId: '8', departementIds: [] },
    'Golfe de Fos-sur-Mer': { ids: [58], secteurId: '7', departementIds: [] },
    'Rade de Marseille': { ids: [32], secteurId: '9', departementIds: [] },
    'Périmètre du parc national des Calanques': { ids: [51], secteurId: '10', departementIds: [] },
    'Littoral varois Ouest': { ids: [30], secteurId: '11', departementIds: [] },
    'Rade de Toulon': { ids: [50], secteurId: '12', departementIds: [] },
    'Périmètre du Parc national de Port-Cros': { ids: [40], secteurId: '13', departementIds: [] },
    'Littoral varois Est': { ids: [45], secteurId: '14', departementIds: [] },
    Riviera: { ids: [43], secteurId: '15', departementIds: [] },
    'Nice et abords': { ids: [52], secteurId: '16', departementIds: [] },
    'Littoral des Alpes-Maritimes': { ids: [41, 42], secteurId: '17', departementIds: [] },
    "Large Provence Alpes Côte d'Azur": { ids: [55, 56], secteurId: '18', departementIds: [] },
    'Plaine bathyale': { ids: [54], secteurId: '19', departementIds: [] },
    'Canyons du Golfe du Lion': { ids: [37], secteurId: '20', departementIds: [] },
    "Périmètre du Parc naturel marin du Cap Corse et de l'Agriate": { ids: [46], secteurId: '21', departementIds: [] },
    Bastia: { ids: [36], secteurId: '22', departementIds: [] },
    Balagne: { ids: [61], secteurId: '23', departementIds: [] },
    Scandola: { ids: [62], secteurId: '24', departementIds: [] },
    'Littoral occidental de la Corse': { ids: [59, 60], secteurId: '25', departementIds: [] },
    "Golfe d'Ajaccio": { ids: [49], secteurId: '26', departementIds: [] },
    'Large côte occidental de la Corse': { ids: [53], secteurId: '27', departementIds: [] },
    'Bouches de Bonifacio Ouest': { ids: [33], secteurId: '28', departementIds: [] },
    'Bouches de Bonifacio Est - Porto-Vecchio': { ids: [57], secteurId: '29', departementIds: [] },
    'Plaine orientale et large Est de la Corse': { ids: [34], secteurId: '30', departementIds: [] },
  },
} as const satisfies Record<FacadesMaritimes, { [key in SecteursMaritimes]?: unknown }>
export const FACADES = Object.keys(facades) as FacadesMaritimes[]
const SECTEURS = Object.values(facades).flatMap(f => Object.keys(f)) as SecteursMaritimes[]

type sect = { [Facade in FacadesMaritimes]: { [Secteur in keyof (typeof facades)[Facade]]: (typeof facades)[Facade][Secteur] }[keyof (typeof facades)[Facade]] }[FacadesMaritimes]
export type SecteursMaritimesIds = sect['ids'][number]

export const getDepartementsBySecteurs = (ids: SecteursMaritimes[]): DepartementId[] => {
  return Object.values(facades)
    .flatMap(f =>
      Object.entries(f)
        .filter(([key, _value]) => ids.includes(key))
        .flatMap(([_key, value]) => value.departementIds ?? [])
    )
    .filter(onlyUnique)
}

export const getSecteurMaritime = (id: SecteursMaritimesIds): SecteursMaritimes => {
  const result: [SecteursMaritimes, any] | undefined = Object.values<Record<string, { ids: readonly number[] }>>(facades)
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

export type FacadeComputed = {
  facade: FacadesMaritimes
  secteurs: SecteursMaritimes[]
}

export const getFacadesComputed = (secteursMaritime: SecteursMaritimes[]): FacadeComputed[] => {
  return secteursMaritime.reduce<FacadeComputed[]>((acc, secteur) => {
    const facade = getFacade(secteur)
    let computedFacade = acc.find(a => a.facade === facade)
    if (!computedFacade) {
      computedFacade = { facade, secteurs: [] }
      acc.push(computedFacade)
    }

    computedFacade.secteurs.push(secteur)

    return acc
  }, [])
}

export const getFacade = (secteurMaritime: SecteursMaritimes): FacadesMaritimes => {
  const facade = getKeys(facades, isFacade).find(facade => Object.keys(facades[facade]).includes(secteurMaritime))
  assertsFacade(facade)

  return facade
}

export const getSecteurs = (facadeMaritime: FacadesMaritimes): SecteursMaritimes[] => {
  // TODO 2023-03-01: use getKeys instead
  return Object.keys(facades[facadeMaritime]) as SecteursMaritimes[]
}

const isFacade = (facade: unknown): facade is FacadesMaritimes => FACADES.includes(facade)
const isSecteurMaritime = (secteurMaritime: unknown): secteurMaritime is SecteursMaritimes => SECTEURS.includes(secteurMaritime)

export function assertsFacade(facade: unknown): asserts facade is FacadesMaritimes {
  if (!FACADES.includes(facade)) {
    throw new Error(`La façade ${facade} n'existe pas`)
  }
}

export function assertsSecteur<T extends FacadesMaritimes>(facade: T, secteur: unknown): asserts secteur is keyof (typeof facades)[T] {
  if (!Object.keys(facades[facade]).includes(secteur)) {
    throw new Error(`Le secteur ${secteur} n’existe pas`)
  }
}

export const secteurAJour = (facade: FacadesMaritimes, secteur: SecteursMaritimes, id: unknown, secteurId: unknown): boolean => {
  assertsSecteur(facade, secteur)
  const result: never | { ids: number[]; secteurId: string } = facades[facade][secteur]

  return result.ids.includes(id) && result.secteurId === secteurId
}
