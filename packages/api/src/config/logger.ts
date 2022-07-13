/* istanbul ignore file */
import util from 'util'
import winston from 'winston'

const { createLogger, format, transports } = winston

const { combine, timestamp, printf, colorize } = format

const printFormat = printf(({ level, message, timestamp }) => {
  if (!message || !message.length) {
    return ''
  }

  return `${timestamp} [${level}]: ${message}`
})

const timestampFormat = timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })

const utilFormat = {
  transform(info: any) {
    const args = info[Symbol.for('splat')]
    if (args) {
      info.message = util.format(info.message, ...args)
    }

    return info
  }
}

// TODO 2022-07-13 : supprime winston et utilise console.log classique (avec des couleurs si on veut être fancy, mais pas besoin de cette dépendance (et encore moins des sous dépendances))
const consoleOverride = (logger: winston.Logger) => {
  console.info = (...args) => logger.info('', ...args)
  console.warn = (...args) => logger.warn('', ...args)
  console.error = (...args) => logger.error('', ...args)
  console.debug = (...args) => logger.debug('', ...args)
}

const consoleTransport = new transports.Console({
  format: combine(colorize(), timestampFormat, utilFormat, printFormat)
})

const appLogger = createLogger({
  transports: [consoleTransport]
})

const cronLogger = createLogger({
  transports: [consoleTransport]
})

export { consoleOverride, appLogger, cronLogger }
