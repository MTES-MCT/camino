import { getEntrepriseDocuments } from '../api/rest/entreprises.queries.js'
import { userSuper } from '../database/user-super.js'
import '../init.js'
import pg from 'pg'
import { entrepriseDocumentFilePathFind } from '../tools/documents/document-path-find.js'
import { knex } from '../knex.js'


export const launchMigration = async () => {

  const pool = new pg.Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  })

  const entreprisesDocuments = await getEntrepriseDocuments([], [], pool, userSuper)

  console.log('documents à migrer : ', entreprisesDocuments.length)
  for(const document of entreprisesDocuments){
    const {fullPath} = entrepriseDocumentFilePathFind(document.id, document.entreprise_id)

    console.log('fichier : ', fullPath)

    try{
    await knex.raw(`update entreprises_documents set file=lo_import('${fullPath.substring(7,fullPath.length)}') where id='${document.id}';`)
    }catch(e: any){
      console.error('pas la ', fullPath)
    }
  }


}

launchMigration()
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
