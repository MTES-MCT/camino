import { TitreTypeId, TitresTypes } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'

import { TitreId, TitreLink, TitreLinks } from 'camino-common/src/titres'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { getWithJson, postWithJson } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'

export type TitresLinkConfig =
  | {
      type: 'single'
      selectedTitreId: TitreId | null
    }
  | {
      type: 'multiple'
      selectedTitreIds: TitreId[]
    }

type TitreLinkDemarche = { demarcheDateDebut: CaminoDate | null; demarcheDateFin: CaminoDate | null }
export type LinkableTitre = TitreLink & {
  demarches: TitreLinkDemarche[]
  titreStatutId: TitreStatutId
}

export interface TitresLinkFormApiClient {
  linkTitres: (titreId: TitreId, titreFromIds: TitreId[]) => Promise<TitreLinks>
  loadTitreLinks: (titreId: TitreId) => Promise<TitreLinks>
  loadLinkableTitres: (titreTypeId: TitreTypeId, demarches: { typeId: DemarcheTypeId }[]) => () => Promise<LinkableTitre[]>
}

export const titresLinkFormApiClient: TitresLinkFormApiClient = {
  linkTitres: async (titreId: TitreId, titreFromIds: TitreId[]): Promise<TitreLinks> => {
    return await postWithJson('/rest/titres/:id/titreLiaisons', { id: titreId }, titreFromIds)
  },

  loadTitreLinks: async (titreId: TitreId) => {
    return await getWithJson('/rest/titres/:id/titreLiaisons', { id: titreId })
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
                  demarcheDateDebut
                  demarcheDateFin
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
