import { CommonTitre } from 'camino-common/src/titres'
import { getTitreFromTypeId } from 'camino-common/src/permissions/titres'
import { apiGraphQLFetch } from '@/api/_client'
import { TitresTypes, TitreTypeId } from 'camino-common/src/titresTypes'
import gql from 'graphql-tag'

export type TitresLinkConfig =
  | {
      type: 'single'
      selectedTitreId: string | null
      titreTypeId: TitreTypeId
    }
  | {
      type: 'multiple'
      selectedTitreIds: string[]
      titreTypeId: TitreTypeId
      demarcheTypeId: string | null
    }

type DemarchePhase = { dateDebut: string; dateFin: string }
export type TitreLinkDemarche = { phase?: DemarchePhase }
export type TitreLink = Pick<CommonTitre, 'id' | 'nom'> & {
  demarches: TitreLinkDemarche[]
}
export type LoadLinkableTitres = (
  titreTypeId: TitreTypeId
) => Promise<TitreLink[]>

export const loadLinkableTitres: LoadLinkableTitres = async (
  titreTypeId: TitreTypeId
) => {
  const titreTypeFromId = getTitreFromTypeId(titreTypeId)

  if (titreTypeFromId) {
    const titreTypeFrom = TitresTypes[titreTypeFromId]
    const result = await apiGraphQLFetch(
      gql`
        query Titres($typesIds: [ID!], $domainesIds: [ID!]) {
          titres(
            typesIds: $typesIds
            domainesIds: $domainesIds
            statutsIds: ["ech", "mod", "val"]
          ) {
            elements {
              id
              nom
              statut {
                couleur
                nom
              }
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
      domainesIds: [titreTypeFrom.domaineId]
    })
    return result.elements
  } else {
    return []
  }
}
