import './init'
import { consoleOverride } from './config/logger.js'
import { mailjetSend } from './tools/api-mailjet/emails.js'
import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import * as Console from 'console'
import { monthly } from './business/monthly.js'

const logFile = '/tmp/monthly.log'

const output = createWriteStream(logFile)
const logger = new Console.Console({ stdout: output, stderr: output })
// eslint-disable-next-line no-console
console.log = logger.log
consoleOverride(false)

const tasks = async () => {
  console.info('Tâches mensuelles : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await monthly()
  } catch (e) {
    console.error('Erreur durant le monthly', e)
  }

  const emailBody = `Résultats de ${process.env.ENV} \n${readFileSync(
    logFile
  ).toString()}`
  await mailjetSend([process.env.ADMIN_EMAIL!], {
    Subject: `[Camino][${process.env.ENV}] Résultats du monthly`,
    'Text-part': emailBody
  })
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
