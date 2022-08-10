import './init'
import daily from './business/daily'
import documentsCheck from './tools/documents/check'
import { matomoCacheInit } from './tools/api-matomo'
import demarchesDefinitionsCheck from './tools/demarches/definitions-check'
import { consoleOverride } from './config/logger'
import { mailjetSend } from './tools/api-mailjet/emails'
import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import { titreTypeDemarcheTypeEtapeTypeCheck } from './tools/demarches/tde-check'
import { etapeStatutCheck } from './tools/demarches/etape-statut-check'
import { documentsClean } from './tools/documents/clean'
import * as Console from 'console'

const logFile = '/tmp/cron.log'

const output = createWriteStream(logFile)
const logger = new Console.Console({ stdout: output, stderr: output })
// eslint-disable-next-line no-console
console.log = logger.log
consoleOverride(false)

const tasks = async () => {
  console.info('Tâches quotidiennes : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await daily()
    await documentsClean()
    await documentsCheck()
    await demarchesDefinitionsCheck()
    await titreTypeDemarcheTypeEtapeTypeCheck()
    await etapeStatutCheck()
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }

  try {
    await matomoCacheInit()
  } catch (e) {
    console.error('API Matomo inaccessible', e)
  }

  const emailBody = `Résultats de ${process.env.ENV} \n${readFileSync(
    logFile
  ).toString()}`
  await mailjetSend([process.env.ADMIN_EMAIL!], {
    Subject: `[Camino][${process.env.ENV}] Résultats du daily`,
    'Text-part': emailBody
  })
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
