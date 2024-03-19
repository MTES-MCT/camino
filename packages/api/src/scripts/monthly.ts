import '../init.js'
import { consoleOverride } from '../config/logger.js'
import { mailjetSend } from '../tools/api-mailjet/emails.js'
import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import * as Console from 'console'
import { monthly } from '../business/monthly.js'
import pg from 'pg'
import { config } from '../config/index.js'

const logFile = '/tmp/monthly.log'

// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

const output = createWriteStream(logFile)
if (config().CAMINO_STAGE) {
  const logger = new Console.Console({ stdout: output, stderr: output })
  // eslint-disable-next-line no-console
  console.log = logger.log
  consoleOverride(false)
}

const tasks = async () => {
  console.info('Tâches mensuelles : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await monthly(pool)
  } catch (e) {
    console.error('Erreur durant le monthly', e)
  }

  if (config().CAMINO_STAGE) {
    const emailBody = `Résultats de ${config().ENV} \n${readFileSync(logFile).toString()}`
    await mailjetSend([config().ADMIN_EMAIL], {
      Subject: `[Camino][${config().ENV}] Résultats du monthly`,
      'Text-part': emailBody,
    })
  }
  console.info('Tâches mensuelles : terminé')
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
