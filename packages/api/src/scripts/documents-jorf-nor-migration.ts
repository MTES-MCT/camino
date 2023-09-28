/* eslint-disable */
import { DocumentId } from 'camino-common/src/entreprise.js'
import '../init.js'
import { knex } from '../knex.js'
import { DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'

const jorfRegex = /.*(JORFTEXT[0-9]*).*/
const norRegex = /.*([A-Z]{4}[0-9]{7}[A-Z]{1}).*/

export const processDocument = (document: Omit<MigrationDocument, 'id' | 'type_id' | 'titre_etape_id'>): { jorf: string | null; nor: string | null } => {
  let jorf: string | null = document.jorf === '' ? null : document.jorf?.match(jorfRegex)?.[1] ?? null
  if (isNullOrUndefined(jorf) && isNotNullNorUndefined(document.url)) {
    jorf = document.url.match(jorfRegex)?.[1] ?? null
  }
  if (isNullOrUndefined(jorf) && isNotNullNorUndefined(document.uri)) {
    jorf = document.uri.match(jorfRegex)?.[1] ?? null
  }

  let nor: string | null = document.nor === '' ? null : document.nor?.match(norRegex)?.[1] ?? null

  if (document.nor === 'INDE8800S81A') {
    nor = 'INDE8800581A'
  }

  if (isNullOrUndefined(nor) && isNotNullNorUndefined(document.url)) {
    nor = document.url.match(norRegex)?.[1] ?? null
  }
  if (isNullOrUndefined(nor) && isNotNullNorUndefined(document.uri)) {
    nor = document.uri.match(norRegex)?.[1] ?? null
  }

  if (document.url === 'https://www.legifrance.gouv.fr/download/pdf?id=XSYNlGAA_QGPvLqC3CYVXCDVJmSgP0WplWCcJ-lYuhQ=') {
    jorf = 'JORFTEXT000036570425'
    nor = 'TRER1736333A'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/download/pdf?id=iVuAD5uJii2qhcSZRN7xvfK88lNSC-q-NZWqUPb-UFY=') {
    jorf = 'JORFTEXT000047693947'
    nor = 'ENER2212175D'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/download/file/sku8ZXc265cNIlzuWm0C8WLCXpWGQoisGfxBVdPuq_E=/JOE_TEXTE') {
    nor = 'TRER2132452A'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/download/file/Q9NXyJ37SN-5lAHk7kcMkd0UTDBHho8T4OlgSxeHnmA=/JOE_TEXTE') {
    nor = 'INDL2111148A'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000001033595') {
    nor = 'ECOI9800246D'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/download/file/pD4v1zxDJJ2VHiJuLWMryVCLWrAB3Rns0tma9BmHwUo=/JOE_TEXTE') {
    nor = 'ENER2217857A'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/download/pdf?id=XOKQWtff7T9mOnngqmS8nhm68X2PepRiqhRHlZ3xpqA=') {
    nor = 'ENER2220563A'
  }
  if (document.url === 'https://www.legifrance.gouv.fr/download/file/fD7zi6G0J0uxiyT7i7cWDK0dZpSzNtfTRKc6ANBCXCc=/JOE_TEXTE') {
    jorf = 'JORFTEXT000047502317'
  }

  if (nor === 'INDE8700301A') {
    jorf = 'JORFTEXT000000843608'
  }

  if (nor === 'INDE8900343A') {
    jorf = 'JORFTEXT000000705265'
  }

  if (nor === 'INDE8800659D') {
    jorf = 'JORFTEXT000000681488'
  }

  if (nor === 'TRER2003625A') {
    jorf = ''
  }
  if (nor === 'INDD8800798A') {
    jorf = ''
  }
  if (nor === 'INDE8800855A') {
    jorf = ''
  }
  if (nor === 'INDE8800855A') {
    jorf = ''
  }
  if (nor === 'TRER2002467A') {
    jorf = ''
  }
  if (nor === 'ECOL1904514A') {
    jorf = ''
  }
  if (nor === 'TRER1833478A') {
    jorf = ''
  }
  if (nor === 'TRER1833478A') {
    jorf = ''
  }
  if (nor === 'INDD8800797A') {
    jorf = ''
  }
  if (nor === 'INDD8800799A') {
    jorf = ''
  }
  if (nor === 'INDE8700354A') {
    jorf = 'JORFTEXT000000296038'
  }
  return { jorf, nor }
}

type MigrationDocument = { id: DocumentId; type_id: DocumentTypeId; titre_etape_id: string; url: string | null; uri: string | null; jorf: string | null; nor: string | null }

export const launchMigration = async () => {
  const documents: { rowCount: number; rows: MigrationDocument[] } = await knex.raw(
    "SELECT * from documents where uri is not null or url is not null or (jorf is not null and jorf != '') or (nor is not null and nor != '')"
  )

  console.time('migration')
  console.log('documents à migrer : ', documents.rowCount)

  for (const document of documents.rows) {
    const { jorf, nor } = processDocument(document)

    if (!jorf && !nor) {
      //console.log(`https://camino.beta.gouv.fr/etapes/${document.titre_etape_id}`, document.url, document.uri, document.jorf, document.nor, jorf, nor)
    }

    const token = 'jJ7j6MoeCQIubca28YIyEnjPCg8dLtnpZg5qjRoPL56j2N5eIzcGXA' as Bearer
    if (nor && !jorf) {
      const result = await searchPublication(token, nor)
      if (result !== null) {
        //console.log('trouvé ', result.jorf, result.nor)
      } else {
        console.log('nor non trouvé', nor)
      }
    }
  }

  console.timeEnd('migration')
}
export type Bearer = string & { __caminoType: 'Bearer' }
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

const searchPublication = async (bearer: Bearer, nor: string): Promise<Publication | null> => {
  const search = {
    fond: 'JORF',
    recherche: {
      operateur: 'ET',
      pageSize: 10,
      sort: 'SIGNATURE_DATE_DESC',
      typePagination: 'DEFAUT',
      pageNumber: 1,
      champs: [
        {
          typeChamp: 'NOR',
          operateur: 'ET',
          criteres: [
            {
              typeRecherche: 'EXACTE',
              valeur: nor,
              operateur: 'ET',
            },
          ],
        },
      ],
      fromAdvancedRecherche: false,
    },
  }

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
    const body = (await response.json()) as Result

    if (body.results.length === 0) {
      return null
    }
    if (body.results.length > 1) {
      return null
    }
    if (body.results[0].titles.length !== 1) {
      return null
    }

    return { nor: body.results[0].nor, jorf: body.results[0].titles[0].cid }
  } else {
    console.error(response.status)
    console.error(await response.text())

    return null
  }
}

launchMigration()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
