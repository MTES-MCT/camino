import { TitreLink, TitreLinks } from 'camino-common/src/titres'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
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

export type LoadTitreLinks = (titreId: string) => Promise<TitreLinks>

export const loadTitreLinks: LoadTitreLinks = async (titreId: string) => {
  return (await fetch(`/apiUrl/titres/${titreId}/titreLiaisons`)).json()
}

type DemarchePhase = { dateDebut: string; dateFin: string }
type TitreLinkDemarche = { phase?: DemarchePhase }
export type LinkableTitre = TitreLink & {
  demarches: TitreLinkDemarche[]
  statut: { couleur: string; nom: string }
}

export type LoadLinkableTitres = () => Promise<LinkableTitre[]>

export const loadLinkableTitres: (
  titreTypeId: TitreTypeId,
  demarches: { typeId: DemarcheTypeId }[]
) => LoadLinkableTitres =
  (titreTypeId: TitreTypeId, demarches: { typeId: DemarcheTypeId }[]) =>
  async () => {
    const linkConfig = getLinkConfig(titreTypeId, demarches)

    if (linkConfig) {
      const titreTypeFrom = TitresTypes[linkConfig.typeId]
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
) => Promise<TitreLinks>

export const linkTitres: LinkTitres = async (
  titreId: string,
  titreFromIds: string[]
) => {
  return (
    await fetch(`/apiUrl/titres/${titreId}/titreLiaisons`, {
      method: 'post',
      body: JSON.stringify(titreFromIds),
      headers: { 'Content-Type': 'application/json' }
    })
  ).json()
}
