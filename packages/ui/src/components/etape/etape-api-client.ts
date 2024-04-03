import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { Etape, EtapeDocument, EtapeId, EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import gql from 'graphql-tag'

export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
  getEtapeDocumentsByEtapeId: (etapeId: EtapeId) => Promise<EtapeDocument[]>
  getEtapeHeritage: (titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) => Promise<Pick<Etape, 'heritageProps' | 'heritageContenu'>>
}

export const etapeApiClient: EtapeApiClient = {
  getEtapesTypesEtapesStatuts: async (demarcheId, etapeId, date) => getWithJson('/rest/etapesTypes/:demarcheId/:date', { demarcheId, date }, etapeId ? { etapeId } : {}),

  deleteEtape: async etapeId => {
    await deleteWithJson('/rest/etapes/:etapeId', { etapeId })
  },
  deposeEtape: async etapeId => {
    await putWithJson('/rest/etapes/:etapeId/depot', { etapeId }, undefined)
  },

  getEtapeDocumentsByEtapeId: async etapeId => getWithJson('/rest/etapes/:etapeId/etapeDocuments', { etapeId }),
  getEtapeHeritage: async (titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) => {
    const data = await apiGraphQLFetch(gql`
    query EtapeHeritage($titreDemarcheId: ID!, $date: String!, $typeId: ID!) {
      etapeHeritage(titreDemarcheId: $titreDemarcheId, date: $date, typeId: $typeId) {
        heritageProps {
          dateDebut {
            etape {
              date
              typeId
              dateDebut
            }
            actif
          }
          dateFin {
            etape {
              date
              typeId
              dateFin
            }
            actif
          }
          duree {
            etape {
              date
              typeId
              duree
            }
            actif
          }
          perimetre {
            etape {
              date
              typeId
              geojson4326Perimetre
              geojson4326Points
              geojsonOriginePoints
              geojsonOriginePerimetre
              geojsonOrigineGeoSystemeId
              geojson4326Forages
              geojsonOrigineForages
              surface
            }
            actif
          }
          substances {
            etape {
              date
              typeId
              substances
            }
            actif
          }
          titulaires {
            etape {
              date
              typeId
              titulaires {
                id
                operateur
              }
            }
            actif
          }
          amodiataires {
            etape {
              date
              typeId
              amodiataires {
                id
                operateur
              }
            }
            actif
          }
        }

        heritageContenu
      }
    }
  `)({
    titreDemarcheId, date, typeId,
  })
  return data
  }

}
