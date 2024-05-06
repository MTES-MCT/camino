// https://etablissements-publics.api.gouv.fr
import { DepartementId } from 'camino-common/src/static/departement.js'
import { Administration, AdministrationId, AdministrationTypeId } from 'camino-common/src/static/administrations.js'
import { config } from '../../config/index.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

const MAX_CALLS_MINUTE = 200

const API_ADMINISTRATION_URL = config().API_ADMINISTRATION_URL

interface IOrganisme {
  features: {
    properties: {
      id: string
      pivotLocal: string
      nom: string
      telephone: string
      email: string
      url: string
      adresses: {
        lignes: string[]
        codePostal: string
        commune: string
      }[]
    }
  }[]
}

const organismeFetch = async (departementId: string, nom: 'paris_ppp' | 'prefecture') => {
  console.info(`API administration: requête ${departementId}, ${nom}`)

  const response = await fetch(`${API_ADMINISTRATION_URL}/v3/departements/${departementId}/${nom}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  })

  if (response.status > 400) {
    throw response.statusText
  }

  const result = (await response.json()) as IOrganisme

  // attend quelques secondes après chaque appel
  // pour ne pas dépasser les quotas
  await new Promise(resolve => setTimeout(resolve, (60 / MAX_CALLS_MINUTE) * 1000))

  return result
}

const organismeDepartementCall = async (departementId: string, nom: 'paris_ppp' | 'prefecture') => {
  try {
    return await organismeFetch(departementId, nom)
  } catch (err: any) {
    const error = isNotNullNorUndefined(err.error) ? `${err.error}: ${err.error_description}` : err
    console.error(`API administrations ${departementId} ${nom}: ${error}`)

    return null
  }
}

const organismeFormat = (e: IOrganisme, departementId: DepartementId) => {
  if (!e.features.length) return null

  const { properties: p } = e.features[0]
  const { adresses } = p

  const [adresseA, adresseB] = adresses

  const adresse1 = adresseA.lignes
    .reduce((acc: string[], line) => {
      if (line.length <= 100) {
        acc.push(line)
      }

      return acc
    }, [])
    .join(', ')

  const organisme: Administration = {
    id: p.id.replace(/prefecture|paris_ppp/, 'pre') as AdministrationId,
    typeId: p.pivotLocal.replace(/prefecture|paris_ppp/, 'pre') as AdministrationTypeId,
    nom: p.nom,
    abreviation: p.nom,
    adresse1,
    codePostal: adresses[0].codePostal,
    commune: adresses[0].commune,
    telephone: p.telephone,
    departementId,
  }
  const adresse2 = isNotNullNorUndefined(adresseB) ? adresseB.lignes.join(', ') : null
  if (isNotNullNorUndefined(adresse2)) {
    organisme.adresse2 = adresse2
  }
  const email = p.email && p.email.match('@') ? p.email : null
  if (isNotNullNorUndefined(email)) {
    organisme.email = email
  }
  const url = p.url || null
  if (isNotNullNorUndefined(url)) {
    organisme.url = url
  }

  return organisme
}

const organismeDepartementGet = async (departementId: DepartementId, nom: 'paris_ppp' | 'prefecture') => {
  const organisme = await organismeDepartementCall(departementId, nom)

  return organisme ? organismeFormat(organisme, departementId) : null
}

export const organismesDepartementsGet = async (departementsIdsNoms: { departementId: DepartementId; nom: 'paris_ppp' | 'prefecture' }[]): Promise<Administration[]> => {
  const organismesDepartements = []
  for (const { departementId, nom } of departementsIdsNoms) {
    organismesDepartements.push(await organismeDepartementGet(departementId, nom))
  }

  return organismesDepartements.filter((o): o is Administration => !!o)
}
