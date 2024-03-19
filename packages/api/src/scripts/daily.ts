import '../init.js'
import { daily } from '../business/daily.js'
import { documentsCheck } from '../tools/documents/check.js'
import { consoleOverride } from '../config/logger.js'
import { mailjetSend } from '../tools/api-mailjet/emails.js'
import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import { documentsClean } from '../tools/documents/clean.js'
import * as Console from 'console'
import pg from 'pg'
import { config } from '../config/index.js'

const logFile = '/tmp/cron.log'
const output = createWriteStream(logFile)

if (config().CAMINO_STAGE) {
  const logger = new Console.Console({ stdout: output, stderr: output })
  // eslint-disable-next-line no-console
  console.log = logger.log
  consoleOverride(false)
}

// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

const tasks = async () => {
  console.info('Tâches quotidiennes : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await daily(pool)
    if (config().CAMINO_STAGE) {
      await documentsClean(pool)
      await documentsCheck(pool)
    }
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }

  if (config().CAMINO_STAGE) {
    const emailBody = `Résultats de ${config().ENV} \n${readFileSync(logFile).toString()}`
    await mailjetSend([config().ADMIN_EMAIL], {
      Subject: `[Camino][${config().ENV}] Résultats du daily`,
      'Text-part': emailBody,
    })
  }
  console.info('Tâches quotidiennes : terminé')
}

tasks()
  .then(() => {
    output.end()
    process.exit()
  })
  .catch(e => {
    console.error('Erreur', e)
    output.end()
    process.exit(1)
  })
