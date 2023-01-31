import '../init.js'
import { daily } from '../business/daily.js'
import documentsCheck from '../tools/documents/check.js'
import { matomoCacheInit } from '../tools/api-matomo/index.js'
import demarchesDefinitionsCheck from '../tools/demarches/definitions-check.js'
import { consoleOverride } from '../config/logger.js'
import { mailjetSend } from '../tools/api-mailjet/emails.js'
import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import { titreTypeDemarcheTypeEtapeTypeCheck } from '../tools/demarches/tde-check.js'
import { etapeStatutCheck } from '../tools/demarches/etape-statut-check.js'
import { documentsClean } from '../tools/documents/clean.js'
import * as Console from 'console'

const logFile = '/tmp/cron.log'
const output = createWriteStream(logFile)

if (process.env.CAMINO_STAGE) {
  const logger = new Console.Console({ stdout: output, stderr: output })
  // eslint-disable-next-line no-console
  console.log = logger.log
  consoleOverride(false)
}

const tasks = async () => {
  console.info('Tâches quotidiennes : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await daily()
    if (process.env.CAMINO_STAGE) {
      await documentsClean()
      await documentsCheck()
      await demarchesDefinitionsCheck()
      await titreTypeDemarcheTypeEtapeTypeCheck()
      await etapeStatutCheck()
      await matomoCacheInit()
    }
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }

  if (process.env.CAMINO_STAGE) {
    const emailBody = `Résultats de ${process.env.ENV} \n${readFileSync(
      logFile
    ).toString()}`
    await mailjetSend([process.env.ADMIN_EMAIL!], {
      Subject: `[Camino][${process.env.ENV}] Résultats du daily`,
      'Text-part': emailBody
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
