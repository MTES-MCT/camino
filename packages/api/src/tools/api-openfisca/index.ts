import { SubstanceFiscale, SubstanceFiscaleId, SubstancesFiscales } from 'camino-common/src/static/substancesFiscales.js'
import { Unite, Unites } from 'camino-common/src/static/unites.js'
import Decimal from 'decimal.js'
type Attribute = 'surface_communale' | 'surface_communale_proportionnee' | 'taxe_guyane_brute' | 'taxe_guyane_deduction' | 'taxe_guyane' | string

const openfiscaSubstanceFiscaleNom = (substanceFiscale: SubstanceFiscale): string => substanceFiscale.openFisca?.nom ?? substanceFiscale.nom
export const openfiscaSubstanceFiscaleUnite = (substanceFiscale: SubstanceFiscale): Unite => {
  const unite = substanceFiscale.openFisca?.unite ? Unites[substanceFiscale.openFisca.unite] : Unites[substanceFiscale.uniteId]
  if (!unite.openfiscaId) {
    throw new Error(`l'unité ${unite.id} pour la substance ${substanceFiscale.id} n'est pas connue par openFisca`)
  }

  return unite
}

export const substanceFiscaleToInput = (substanceFiscale: SubstanceFiscale): string => {
  const nom = openfiscaSubstanceFiscaleNom(substanceFiscale)
  const unite = openfiscaSubstanceFiscaleUnite(substanceFiscale)

  return `quantite_${nom}_${unite.openfiscaId}`
}

export const redevanceCommunale = (substanceFiscale: SubstanceFiscale): string => {
  const nom = openfiscaSubstanceFiscaleNom(substanceFiscale)

  return `redevance_communale_des_mines_${nom}`
}
export const redevanceDepartementale = (substanceFiscale: SubstanceFiscale): string => {
  const nom = openfiscaSubstanceFiscaleNom(substanceFiscale)

  return `redevance_departementale_des_mines_${nom}`
}

type Article = Record<Attribute, { [annee: string]: number | Decimal | null }>

export interface OpenfiscaRequest extends OpenfiscaCommon {
  articles: {
    [titreId_substance_commune: string]: Article
  }
}

export interface OpenfiscaResponse extends OpenfiscaCommon {
  articles: {
    [titreId_substance_commune: string]: Partial<Record<Attribute, { [annee: string]: number }>>
  }
}

interface OpenfiscaCommon {
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

export type OpenfiscaTarifs = Record<SubstanceFiscaleId, { tarifDepartemental: number; tarifCommunal: number }>
export interface OpenfiscaConstants {
  substances: OpenfiscaTarifs
  tarifTaxeMinierePME: number
  tarifTaxeMiniereAutre: number
}

const apiOpenfiscaFetch = async <T>(call: (apiOpenfiscaUrl: string) => Promise<Response>): Promise<T> => {
  const apiOpenfiscaUrl = process.env.API_OPENFISCA_URL
  if (!apiOpenfiscaUrl) {
    throw new Error("impossible de se connecter à l'API Openfisca car la variable d'environnement est absente")
  }

  const response = await call(apiOpenfiscaUrl)

  const result = (await response.json()) as T

  if (!response.ok) {
    throw new Error(`Le serveur Openfisca a retourné une erreur: ${JSON.stringify(result)}`)
  }

  return result
}

export const apiOpenfiscaCalculate = async (body: OpenfiscaRequest): Promise<OpenfiscaResponse> => {
  const call = (url: string) =>
    fetch(`${url}/calculate`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  return apiOpenfiscaFetch<OpenfiscaResponse>(call)
}

type InitSubstance = {
  [key in SubstanceFiscaleId]?: {
    tarifDepartemental: number
    tarifCommunal: number
  }
}
export const apiOpenfiscaConstantsFetch = async (annee: number): Promise<OpenfiscaConstants> => {
  const getParameter = async (parameter: string): Promise<number> => {
    const call = (url: string) =>
      fetch(`${url}/parameter/${parameter}`, {
        headers: { 'Content-Type': 'application/json' },
      })

    const response = await apiOpenfiscaFetch<{
      values: { [date: string]: number }
    }>(call)

    if (!Object.keys(response.values).includes(`${annee}-01-01`)) {
      throw new Error(`le paramètre ${parameter} n’est pas renseigné pour l’année ${annee}`)
    }

    return response.values[`${annee}-01-01`]
  }

  const tarifTaxeMinierePME = await getParameter('taxes/guyane/categories/pme')
  const tarifTaxeMiniereAutre = await getParameter('taxes/guyane/categories/autre')

  const substances: InitSubstance = {}
  // TODO 2022-08-09 : faire passer la substance en parametre le jour où on fait des matrices autre que Guyane
  for (const substance of SubstancesFiscales) {
    const nom = substance.openFisca?.nom ?? substance.nom
    const tarifCommunal = await getParameter(`redevances/communales/${nom}`)
    const tarifDepartemental = await getParameter(`redevances/departementales/${nom}`)
    substances[substance.id] = {
      tarifCommunal,
      tarifDepartemental,
    }
  }

  return {
    substances: substances as Required<InitSubstance>,
    tarifTaxeMinierePME,
    tarifTaxeMiniereAutre,
  }
}
