import { CaminoDate, dateAddMonths, toCaminoDate } from 'camino-common/src/date.js'
import '../init.js'
import pg from 'pg'
import { getAllJorfDocuments } from './jorf-scan.queries.js'

// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

const getLegiFranceToken = async (): Promise<Bearer> => {
  const client_id = process.env.LEGIFRANCE_CLIENT_ID
  const client_secret = process.env.LEGIFRANCE_CLIENT_SECRET

  if (!client_id || !client_secret) {
    throw new Error('variables LEGIFRANCE_CLIENT_ID and LEGIFRANCE_CLIENT_SECRET must be set')
  }


  const response = await fetch('https://oauth.piste.gouv.fr/api/oauth/token', {
    method: 'POST',
    body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}&scope=openid`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (response.ok) {

  
  const responseBody = await response.json() as {access_token: string, token_type: 'Bearer', expires_in: 3600, scope: 'openid resource.READ'}


  return responseBody.access_token as Bearer
  } else {
    console.log('error', await response.text())
    throw new Error('Pas de token')
  }
}

export type Bearer = string & {__caminoType: 'Bearer'}
export const getAllJorfFromDatabase = async (): Promise<void> => {
  // const token = await getLegiFranceToken()
  // console.log('token', token)
  const token = 'IxHucnguRPMSTsWtcl9LrWzOn682k0OKI230hkQHnxkEuT8GaBhANu' as Bearer

  const documentsFromDatabase = await getAllJorfDocuments(pool)
  console.log('documents JORF: ' + documentsFromDatabase.length)

  let ok = 0
  let strange = 0
  let error = 0
  let not_found = 0
  let multiple = 0
  let differente = 0
  for (let index = 0; index < documentsFromDatabase.length; index++) {
    const document = documentsFromDatabase[index]
    const result = await searchPublication(token, document.titre_nom, document.date)
    switch (result) {
      case 'strange': 
      strange++
      break
      case 'error':
        error++
        break
      case 'not_found':
        not_found++
        break
      case 'multiple_found':
        multiple++
        break
      default:
        if (result.jorf !== document.jorf || result.nor !== document.nor) {
          console.warn(`Publication différente trouvée pour le titre ${document.titre_nom} autour de la date ${document.date}`)
          differente++
        } else {

          ok++
        }

    }
  }
  console.log(`trouvé ${ok}/${documentsFromDatabase.length}`)
  console.log(`error ${error}/${documentsFromDatabase.length}`)
  console.log(`not_found ${not_found}/${documentsFromDatabase.length}`)
  console.log(`multiple ${multiple}/${documentsFromDatabase.length}`)
  console.log(`strange ${strange}/${documentsFromDatabase.length}`)
  console.log(`differente ${differente}/${documentsFromDatabase.length}`)
  // await searchPublication(token, "Juan-de-Nova Est", toCaminoDate('2008-12-30'))
}

interface EntryResultTitre {
  cid: string
  title: string
}
interface EntryResult {
  nor: string
  titles: EntryResultTitre[]
}
interface Result {
  results: EntryResult[]
}

interface Publication {
  nor: string
  jorf: string
}

const searchPublication = async (bearer: Bearer, titre: string, date: CaminoDate): Promise<Publication | 'not_found' | 'multiple_found' | 'strange' | 'error'> => {
  const oneMonthBefore = dateAddMonths(date, -1)
  const oneMonthAfter = dateAddMonths(date, 1)

  const criteres = titre.split(' ').map(mot => ({
    "typeRecherche": "UN_DES_MOTS",
    "proximite": 2,
    "valeur": mot,
    "operateur": "ET"
  }))
  const search = {
    "fond": "JORF",
    "recherche": {
      "secondSort": "ID",
      "operateur": "ET",
      "filtres": [
        {
          "valeurs": [
            "ARRETE"
          ],
          "facette": "NATURE"
        },
        {
          "dates": {
            "start": oneMonthBefore,
            "end": oneMonthAfter
          },
          "facette": "DATE_PUBLICATION"
        }
      ],
      "typePagination": "DEFAUT",
      "pageSize": 10,
      "pageNumber": 1,
      "champs": [
        {
          "typeChamp": "TITLE",
          "operateur": "ET",
          "criteres": criteres
        }
      ],
      "sort": "SIGNATURE_DATE_DESC",
      "fromAdvancedRecherche": false
    }
  }


  // console.log(JSON.stringify(search))
  const response = await fetch('https://api.piste.gouv.fr/dila/legifrance/lf-engine-app/search', {
    method: 'POST',
    body: JSON.stringify(search),
    headers: {
      Authorization: `Bearer ${bearer}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {

    const body = await response.json() as Result

    // console.log(body)
    if (body.results.length === 0) {
      console.warn(`pas de publication trouvée pour titre ${titre} autour de la date ${date}`)
      return 'not_found'
    }
    if (body.results.length > 1) {
      console.warn(`plusieurs publications trouvées pour le titre ${titre} autour de la date ${date}`)
      return 'multiple_found'
    }
    if (body.results[0].titles.length !== 1) {
      console.warn(`plusieurs titres trouvées pour la publication du titre ${titre} autour de la date ${date}`)
      return 'strange'
    }
    
    return { nor: body.results[0].nor,
        jorf: body.results[0].titles[0].cid
    }
  } else {
    console.error(response.status)
    console.error(await response.text())
    return 'error'
  }
}

// Retourne tous les utilisateurs 'entreprise' et 'bureau d'études' associés à des entreprises de Guyane
getAllJorfFromDatabase()
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
