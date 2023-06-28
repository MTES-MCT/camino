import '../init.js'
import { daily } from '../business/daily.js'
import { documentsCheck } from '../tools/documents/check.js'
import { matomoCacheInit } from '../tools/api-matomo/index.js'
import { consoleOverride } from '../config/logger.js'
import { mailjetSend } from '../tools/api-mailjet/emails.js'
import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import { documentsClean } from '../tools/documents/clean.js'
import * as Console from 'console'
import pg from 'pg'

const logFile = '/tmp/cron.log'
const output = createWriteStream(logFile)

if (process.env.CAMINO_STAGE) {
  const logger = new Console.Console({ stdout: output, stderr: output })
  // eslint-disable-next-line no-console
  console.log = logger.log
  consoleOverride(false)
}

// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

const tasks = async () => {
  console.info('Tâches quotidiennes : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await daily(pool)
    if (process.env.CAMINO_STAGE) {
      await documentsClean(pool)
      await documentsCheck(pool)
      await matomoCacheInit()
    }
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }

  if (process.env.CAMINO_STAGE) {
    const emailBody = `Résultats de ${process.env.ENV} \n${readFileSync(logFile).toString()}`
    await mailjetSend([process.env.ADMIN_EMAIL!], {
      Subject: `[Camino][${process.env.ENV}] Résultats du daily`,
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
