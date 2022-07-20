import './init'
import { job } from 'cron'
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
const logger = new Console.Console({ stdout: output })
// eslint-disable-next-line no-console
console.log = logger.log
consoleOverride(false)

const tasks = async () => {
  console.info('Cron quotidien : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')

  await daily()
  await documentsClean()
  await documentsCheck()
  await demarchesDefinitionsCheck()
  await titreTypeDemarcheTypeEtapeTypeCheck()
  await etapeStatutCheck()

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
  console.info('Cron quotidien : terminé')
}

job(
  // cronTime
  '00 00 04 * * *',
  // onTick
  tasks,
  //  onComplete
  null,
  // start
  true,
  // timezone
  'Europe/Paris',
  // context
  null,
  // runOnInit
  false
  // utcOffset
  // unrefTimeout
)
