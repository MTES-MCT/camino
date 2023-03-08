// https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee

import fetch from 'node-fetch'

import { IApiSirenQueryTypes, IApiSirenQueryToken, IApiSirenEtablissement, IApiSirenUniteLegale } from './types.js'

import errorLog from '../error-log.js'
import { CaminoDate, dateAddDays, daysBetween, getCurrent } from 'camino-common/src/date.js'

const MAX_CALLS_MINUTE = 30
const MAX_RESULTS = 20
const TOKEN_VALIDITY_IN_DAYS = 1
// token local au fichier
// utilise `tokenInitialize` pour l'initialiser
let apiToken: { validUntil: CaminoDate; token: string } | null = null

const { API_INSEE_URL, API_INSEE_KEY, API_INSEE_SECRET } = process.env

// VisibleForTesting
export const tokenInitialize = async (tokenFetchCall = tokenFetch, today = getCurrent()): Promise<string> => {
  if (apiToken && daysBetween(apiToken.validUntil, today) < 0) return apiToken.token

  try {
    const result = await tokenFetchCall()
    if (result) {
      apiToken = {
        validUntil: dateAddDays(today, TOKEN_VALIDITY_IN_DAYS),
        token: result.access_token,
      }
    } else {
      throw new Error('pas de token après requête')
    }

    return apiToken.token
  } catch (e: any) {
    errorLog(
      "API Insee: impossible de générer le token de l'API INSEE ",
      (e.header && e.header.message) || (e.fault && `${e.fault.message}: ${e.fault.description}`) || (e.error && `${e.error}: ${e.error_description}`) || e.message || e
    )

    throw e
  }
}

const tokenFetch = async (): Promise<IApiSirenQueryToken | null> => {
  try {
    if (!API_INSEE_URL) {
      throw new Error("impossible de se connecter car la variable d'environnement est absente")
    }

    console.info(`API Insee: récupération du token ${API_INSEE_KEY?.substring(0, 5)}...:${API_INSEE_SECRET?.substring(0, 5)}...`)

    const auth = Buffer.from(`${API_INSEE_KEY}:${API_INSEE_SECRET}`).toString('base64')

    const response = await fetch(`${API_INSEE_URL}/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
    })

    const result = (await response.json()) as IApiSirenQueryToken

    if (response.status >= 400 || result.error) {
      throw result
    }

    if (!result) {
      throw new Error('contenu de la réponse vide')
    }

    return result
  } catch (e: any) {
    errorLog(
      `API Insee: tokenFetch `,
      (e.header && e.header.message) || (e.fault && `${e.fault.message}: ${e.fault.description}`) || (e.error && `${e.error}: ${e.error_description}`) || e.message || e
    )

    return null
  }
}

const typeFetch = async (type: 'siren' | 'siret', q: string) => {
  const token = await tokenInitialize()
  try {
    if (!API_INSEE_URL) {
      throw new Error("API Insee: impossible de se connecter car la variable d'environnement est absente")
    }

    console.info(`API Insee: requête ${type}, ids: ${q}`)

    const response = await fetch(`${API_INSEE_URL}/entreprises/sirene/V3/${type}/?q=${q}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const result = (await response.json()) as IApiSirenQueryTypes

    if (response.status >= 400 || (result.fault && result.fault.code === 900804)) {
      throw result
    }

    if (!result) {
      throw new Error('API Insee: contenu de la réponse vide')
    }

    // attend quelques secondes après chaque appel
    // pour ne pas dépasser les quotas
    await new Promise(resolve => setTimeout(resolve, (60 / MAX_CALLS_MINUTE) * 1000))

    return result
  } catch (e: any) {
    errorLog(
      `API Insee: typeFetch `,
      (e.header && e.header.message) || (e.fault && `${e.fault.message}: ${e.fault.description}`) || (e.error && `${e.error}: ${e.error_description}`) || e.message || e
    )

    return null
  }
}

const typeMultiFetch = async (type: 'siren' | 'siret', field: 'etablissements' | 'unitesLegales', ids: string[], q: string) => {
  try {
    const result = await typeFetch(type, q)

    return (result && result[field]) || []
  } catch (e: any) {
    errorLog(
      `API Insee: ${type} get ${ids.join(', ')}`,
      JSON.stringify((e.header && e.header.message) || (e.fault && `${e.fault.message}: ${e.fault.description}`) || (e.error && `${e.error}: ${e.error_description}`) || e.message || e)
    )

    return null
  }
}

const batchesBuild = (ids: string[]) => {
  if (ids.length <= MAX_RESULTS) return [ids]

  const count = Math.ceil(ids.length / MAX_RESULTS)

  return [...new Array(count)].map((e, i) => ids.slice(i * MAX_RESULTS, (i + 1) * MAX_RESULTS))
}

export const entreprisesEtablissementsFetch = async (ids: string[]) => {
  const batches = batchesBuild(ids)

  const queryFormat = (idsBatch: string[]) => idsBatch.map(batch => `siren:${batch}`).join(' OR ')

  const results = []
  for (const batch of batches) {
    const result = (await typeMultiFetch('siren', 'unitesLegales', batch, queryFormat(batch))) as IApiSirenUniteLegale[]
    if (result) {
      results.push(...result)
    }
  }

  return results
}

export const entreprisesFetch = async (ids: string[]) => {
  const batches = batchesBuild(ids)

  const queryFormat = (idsBatch: string[]) => {
    const ids = idsBatch.map(batch => `siren:${batch}`).join(' OR ')

    return `(${ids}) AND etablissementSiege:true`
  }

  const results = []
  for (const batch of batches) {
    const result = (await typeMultiFetch('siret', 'etablissements', batch, queryFormat(batch))) as IApiSirenEtablissement[]
    if (result) {
      results.push(...result)
    }
  }

  return results
}
