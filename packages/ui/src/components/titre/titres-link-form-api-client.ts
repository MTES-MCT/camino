import { TitreTypeId, TitresTypes } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'

import { TitreLink, TitreLinks } from 'camino-common/src/titres'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { fetchWithJson, postWithJson } from '@/api/client-rest'
import { CaminoRestRoutes } from 'camino-common/src/rest'

export type TitresLinkConfig =
  | {
      type: 'single'
      selectedTitreId: string | null
    }
  | {
      type: 'multiple'
      selectedTitreIds: string[]
    }

type DemarchePhase = { dateDebut: string; dateFin: string }
type TitreLinkDemarche = { phase?: DemarchePhase }
export type LinkableTitre = TitreLink & {
  demarches: TitreLinkDemarche[]
  titreStatutId: TitreStatutId
}

export interface TitresLinkFormApiClient {
  linkTitres: (titreId: string, titreFromIds: string[]) => Promise<TitreLinks>
  loadTitreLinks: (titreId: string) => Promise<TitreLinks>
  loadLinkableTitres: (titreTypeId: TitreTypeId, demarches: { typeId: DemarcheTypeId }[]) => () => Promise<LinkableTitre[]>
}

export const titresLinkFormApiClient: TitresLinkFormApiClient = {
  linkTitres: async (titreId: string, titreFromIds: string[]): Promise<TitreLinks> => {
    return await postWithJson(CaminoRestRoutes.titresLiaisons, { id: titreId }, titreFromIds)
  },

  loadTitreLinks: async (titreId: string) => {
    return await fetchWithJson(CaminoRestRoutes.titresLiaisons, { id: titreId })
  },

  loadLinkableTitres: (titreTypeId: TitreTypeId, demarches: { typeId: DemarcheTypeId }[]) => async () => {
    const linkConfig = getLinkConfig(titreTypeId, demarches)

    if (linkConfig) {
      const titreTypeFrom = TitresTypes[linkConfig.typeId]
      const result = await apiGraphQLFetch(
        gql`
          query Titres($typesIds: [ID!], $domainesIds: [ID!]) {
            titres(typesIds: $typesIds, domainesIds: $domainesIds, statutsIds: ["ech", "mod", "val"]) {
              elements {
                id
                nom
                titreStatutId
                demarches {
                  phase {
                    dateDebut
                    dateFin
                  }
                }
              }
            }
          }
        `
      )({
        typesIds: [titreTypeFrom.typeId],
        domainesIds: [titreTypeFrom.domaineId],
      })
      return result.elements
    } else {
      return []
    }
  },
}
