import fetch from 'node-fetch'

/*
 eslint-disable camelcase
*/

type plopEntry = 'quantite_aurifere_kg' | 'surface_communale' | 'surface_totale'
type plopRequest =
  | 'redevance_communale_des_mines_aurifere_kg'
  | 'redevance_departementale_des_mines_aurifere_kg'
  | 'taxe_guyane'

type Entries = Partial<Record<plopEntry, { [annee: string]: number | null }>>
type Request = Partial<Record<plopRequest, { [annee: string]: null }>>

type Article = Entries & Request

export interface OpenfiscaRequest {
  articles: {
    [titreId_substance_commune: string]: Article
  }
  titres: {
    [titreId: string]: {
      commune_principale_exploitation?: {
        [annee: string]: string | null
      }
      operateur?: {
        [annee: string]: string | null
      }
      categorie: {
        [annee: string]: string | null
      }
      investissement?: {
        [annee: string]: string | null
      }
      articles: string[]
    }
  }
  communes: {
    [communeId: string]: {
      articles: string[]
    }
  }
}

export interface OpenfiscaResponse {
  articles: {
    [titreId_substance_commune: string]: Partial<
      Record<plopRequest, { [annee: string]: number }>
    >
  }
}

export const apiOpenfiscaFetch = async (
  body: OpenfiscaRequest
): Promise<OpenfiscaResponse> => {
  const apiOpenfiscaUrl = process.env.API_OPENFISCA_URL
  if (!apiOpenfiscaUrl) {
    throw new Error(
      "impossible de se connecter à l'API Openfisca car la variable d'environnement est absente"
    )
  }

  const response = await fetch(`${apiOpenfiscaUrl}/calculate`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const result = (await response.json()) as OpenfiscaResponse

  if (!response.ok) {
    throw new Error(`Le serveur Openfisca a retourné une erreur: ${result}`)
  }

  return result
}

/**
 * Calcule la redevance communale des mines aurifères
 * @param entreprises - liste des entreprises avec leur production d’or net en gramme par année
 * @param annees - liste des années sur lesquelles on souhaite calculer la redevance
 * @return la redevance à payer par entreprise et par année
 */
const redevanceCommunaleMinesAurifiereGet = async (
  entreprises: {
    id: string
    orNet: { [annee: string]: number }
  }[],
  annees: number[]
): Promise<{
  [entrepriseId: string]: { [annee: string]: number | null }
} | null> => {
  // construction de l’objet qui permet de dire à Openfisca ce que l’on souhaite récupérer
  const redevanceCommunaleDesMinesAurifereKg = annees.reduce((acc, annee) => {
    acc[annee] = null

    return acc
  }, {} as { [annee: string]: null })

  const societes: OpenfiscaRequest = entreprises.reduce(
    (acc, entreprise) => {
      // conversion des grammes en kilogrammes
      const orNetKg = Object.keys(entreprise.orNet).reduce(
        (orNetKg, annee) => ({
          ...orNetKg,
          [annee]: entreprise.orNet[annee] / 1000
        }),
        {}
      )

      acc.articles[entreprise.id] = {
        quantite_aurifere_kg: orNetKg,
        redevance_communale_des_mines_aurifere_kg:
          redevanceCommunaleDesMinesAurifereKg
      }

      return acc
    },
    { articles: {} } as OpenfiscaRequest
  )

  const result = (await apiOpenfiscaFetch(societes))?.articles

  if (result) {
    return Object.keys(result).reduce((acc, societe) => {
      acc[societe] = result[societe].redevance_communale_des_mines_aurifere_kg!

      return acc
    }, {} as { [entrepriseId: string]: { [annee: string]: number | null } })
  }

  return null
}

export { redevanceCommunaleMinesAurifiereGet }
