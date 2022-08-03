import fetch from 'node-fetch'
import { SubstanceFiscale } from 'camino-common/src/static/substance'
import { Unite, Unites } from 'camino-common/src/static/unites'
type Attribute =
  | 'surface_communale'
  | 'surface_communale_proportionnee'
  | 'taxe_guyane_brute'
  | 'taxe_guyane_deduction'
  | 'taxe_guyane'
  | string

export const substanceFiscaleToPair = (
  substanceFiscale: SubstanceFiscale
): { nom: string; unite: Unite } => {
  const nom = substanceFiscale.openFisca?.nom ?? substanceFiscale.nom
  const unite = substanceFiscale.openFisca?.unite
    ? Unites[substanceFiscale.openFisca.unite]
    : Unites[substanceFiscale.uniteId]
  if (!unite.openfiscaId) {
    throw new Error(
      `l'unité ${unite.id} pour la substance ${substanceFiscale.id} n'est pas connue par openFisca`
    )
  }

  return { nom, unite }
}

export const substanceFiscaleToInput = (
  substanceFiscale: SubstanceFiscale
): string => {
  const { nom, unite } = substanceFiscaleToPair(substanceFiscale)

  return `quantite_${nom}_${unite.openfiscaId}`
}

export const redevanceCommunale = (
  substanceFiscale: SubstanceFiscale
): string => {
  const { nom, unite } = substanceFiscaleToPair(substanceFiscale)
  // FIXME 2022-07-26: en attente de https://github.com/openfisca/openfisca-france-fiscalite-miniere/pull/29
  if (['auru', 'nacc'].includes(substanceFiscale.id)) {
    return `redevance_communale_des_mines_${nom}_${unite.openfiscaId}`
  }

  return `redevance_communale_des_mines_${nom}`
}
export const redevanceDepartementale = (
  substanceFiscale: SubstanceFiscale
): string => {
  const { nom, unite } = substanceFiscaleToPair(substanceFiscale)
  // FIXME 2022-07-26: en attente de https://github.com/openfisca/openfisca-france-fiscalite-miniere/pull/29
  if (['auru', 'nacc'].includes(substanceFiscale.id)) {
    return `redevance_departementale_des_mines_${nom}_${unite.openfiscaId}`
  }

  return `redevance_departementale_des_mines_${nom}`
}

type Article = Record<Attribute, { [annee: string]: number | null }>

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
      Record<Attribute, { [annee: string]: number }>
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
