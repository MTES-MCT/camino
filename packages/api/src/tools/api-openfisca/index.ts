import fetch from 'node-fetch'

type InputAttribute = 'quantite_aurifere_kg' | 'surface_communale'
type OutputAttribute =
  | 'redevance_communale_des_mines_aurifere_kg'
  | 'redevance_departementale_des_mines_aurifere_kg'
  | 'taxe_guyane_brute'
  | 'taxe_guyane_deduction'
  | 'taxe_guyane'

type Entries = Partial<
  Record<InputAttribute, { [annee: string]: number | null }>
>
type Request = Partial<Record<OutputAttribute, { [annee: string]: null }>>

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
      surface_totale?: {
        [annee: string]: number | null
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
      Record<OutputAttribute, { [annee: string]: number }>
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
    throw new Error(
      `Le serveur Openfisca a retourné une erreur: ${JSON.stringify(result)}`
    )
  }

  return result
}
