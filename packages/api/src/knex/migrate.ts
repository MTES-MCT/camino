import '../init.js'
import { knex } from '../knex.js'

const run = async () => {
  try {
    console.info('migrate…')

    const [latestBatchNo, latestLog] = await knex.migrate.latest()
    if (latestLog.length === 0) {
      console.info(`already up to date\n`)
    } else {
      console.info(`batch ${latestBatchNo} run: ${latestLog.length} migrations \n` + latestLog.join('\n') + '\n')
    }

    console.info('migrations terminées')
    process.exit()
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.stack)
    } else {
      console.error(e)
    }

    process.exit(1)
  }
}

run()
