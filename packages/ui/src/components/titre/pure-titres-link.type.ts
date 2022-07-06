import { CommonTitre } from 'camino-common/src/titres'
import { getTitreFromTypeId } from 'camino-common/src/permissions/titres'
import { apiGraphQLFetch } from '@/api/_client'
import { TitresTypes, TitreTypeId } from 'camino-common/src/titresTypes'
import gql from 'graphql-tag'

export type TitreLink = Pick<CommonTitre, 'id' | 'nom'> & {
  demarches: { phase?: { dateDebut: string; dateFin: string } }[]
}
export type GetTitreFromChoices = (
  titreTypeId: TitreTypeId
) => Promise<TitreLink[]>

export const getTitreFromChoices: GetTitreFromChoices = async (
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
