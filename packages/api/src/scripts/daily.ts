import '../init'
import { daily } from '../business/daily'
import { consoleOverride } from '../config/logger'
import { writeFileSync, createWriteStream } from 'node:fs'
import * as Console from 'console'
import pg from 'pg'
import { config } from '../config/index'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { setGlobalDispatcher, EnvHttpProxyAgent } from 'undici'

const envHttpProxyAgent = new EnvHttpProxyAgent()
setGlobalDispatcher(envHttpProxyAgent)

const logFile = '/tmp/cron.log' as const
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

const tasks = async () => {
  console.info('Tâches quotidiennes : démarrage')
  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  try {
    await daily(pool, logFile)
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }
  // eslint-disable-next-line no-console
  console.log = oldConsole
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
