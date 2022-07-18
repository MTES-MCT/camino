import { CommonTitre } from 'camino-common/src/titres'
import { getTitreFromTypeId } from 'camino-common/src/permissions/titres'
import { apiGraphQLFetch } from '@/api/_client'
import { TitresTypes, TitreTypeId } from 'camino-common/src/titresTypes'
import gql from 'graphql-tag'
import { DemarcheTypeId } from 'camino-common/src/demarchesTypes'

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
export type TitreLinkDemarche = { phase?: DemarchePhase }
export type TitreLink = Pick<CommonTitre, 'id' | 'nom'> & {
  demarches: TitreLinkDemarche[]
}

export type LoadLinkedTitres = (titreId: string) => Promise<TitreLink[]>

export const loadLinkedTitres: LoadLinkedTitres = async (titreId: string) => {
  return (await fetch(`/apiUrl/titres/${titreId}/titresOrigine`)).json()
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

export type LinkTitres = (
  titreId: string,
  titreFromIds: string[]
) => Promise<void>

export const linkTitres: LinkTitres = async (
  titreId: string,
  titreFromIds: string[]
) => {
  await apiGraphQLFetch(
    gql`
      mutation TitreLiaisonsModifier($titreId: ID!, $titreFromIds: [ID]!) {
        titreLiaisonsModifier(titreId: $titreId, titreFromIds: $titreFromIds)
      }
    `
  )({
    titreId,
    titreFromIds
  })
}
