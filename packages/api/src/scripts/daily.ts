import '../init'
import { daily } from '../business/daily'
import { consoleOverride } from '../config/logger'
import { mailjetSend } from '../tools/api-mailjet/emails'
import { readFileSync, writeFileSync, createWriteStream, createReadStream } from 'node:fs'
import * as Console from 'console'
import pg from 'pg'
import { config } from '../config/index'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { setGlobalDispatcher, EnvHttpProxyAgent } from 'undici'
import { createInterface } from 'node:readline'
import { dailySummaryMarker } from '../business/_logs-update'
import { fetch } from 'undici'

const envHttpProxyAgent = new EnvHttpProxyAgent()
setGlobalDispatcher(envHttpProxyAgent)

const logFile = '/tmp/cron.log'
const output = createWriteStream(logFile, { flush: true, autoClose: true })
// eslint-disable-next-line
const oldConsole = console.log
if (isNotNullNorUndefined(config().CAMINO_STAGE)) {
  const logger = new Console.Console({ stdout: output, stderr: output })
  // eslint-disable-next-line no-console
  console.log = logger.log
  consoleOverride(config().LOG_LEVEL, false)
}

// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

const transformIntoMarkDown = async (): Promise<string> => {
  const fileStream = createReadStream(logFile)

  const readLine = createInterface(fileStream)
  let detail = ''
  let summary = ''

  let summaryBegin = false
  for await (const line of readLine) {
    if (line.includes(dailySummaryMarker)) {
      summaryBegin = true
    } else {
      if (summaryBegin) {
        summary += `\n* ${line}`
      } else {
        detail += `\n${line}`
      }
    }
  }
  return `### Résultat du daily de ${config().ENV}
${
  summary !== ''
    ? `<details>
    <summary>Résumé du daily</summary>
${summary}
</details>`
    : '**Pas de changement**'
}
<details>
    <summary>Détail du daily</summary>

\`\`\`bash
${detail}
\`\`\`

</details>`
}

const tchapSend = async (markdown: string, url: string): Promise<void> => {
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ message: markdown, message_format: 'markdown' }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
}

const tasks = async () => {
  console.info('Tâches quotidiennes : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await daily(pool)
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }

  if (isNotNullNorUndefined(config().CAMINO_STAGE)) {
    await new Promise<void>(resolve => {
      output.end(() => resolve())
    })
    // eslint-disable-next-line
    console.log = oldConsole
    const emailBody = `Résultats de ${config().ENV} \n${readFileSync(logFile).toString()}`
    try {
      const tchapHook = config().TCHAP_HOOK
      if (isNotNullNorUndefined(tchapHook)) {
        const markdown = await transformIntoMarkDown()
        await tchapSend(markdown, tchapHook)
      }
    } catch (e: unknown) {
      let errorMessage = "Une erreur s'est produite pendant l'envoi du daily sur tchap"
      if (e instanceof Error) {
        errorMessage += `-> ${e.message}`
      }
      console.error(errorMessage)
    }

    // TODO 2024-12-05 enlever le daily par email si il s'est bien envoyé via tchap
    await mailjetSend([config().ADMIN_EMAIL], {
      Subject: `[Camino][${config().ENV}] Résultats du daily`,
      TextPart: emailBody,
    })
  }
  console.info('Tâches quotidiennes : terminé')
}

// eslint-disable-next-line
;(async () => {
  try {
    await tasks()
    await new Promise<void>(resolve => {
      output.end(() => resolve())
    })
    process.exit()
  } catch (e) {
    console.error('Erreur', e)
    output.end()
    process.exit(1)
  }
})()
