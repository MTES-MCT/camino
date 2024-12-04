/* eslint no-console: 0 */

import { exhaustiveCheck } from 'camino-common/src/typescript-tools'
import { LogLevel } from '.'

const numberToDoubleCharString = (param: number): string => param.toString(10).padStart(2, '0')
const newDateFormated = (date = new Date()): string => {
  const year = date.getFullYear()
  const month = numberToDoubleCharString(date.getMonth() + 1)
  const day = numberToDoubleCharString(date.getDate())
  const hour = numberToDoubleCharString(date.getUTCHours())
  const minute = numberToDoubleCharString(date.getMinutes())
  const seconds = numberToDoubleCharString(date.getSeconds())

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + seconds
}

export const consoleOverride = (logLevel: LogLevel, color = true): void => {
  console.info = () => {}
  console.warn = () => {}
  console.error = () => {}
  console.debug = () => {}

  switch (logLevel) {
    // @ts-ignore fallthrough
    case 'DEBUG':
      console.debug = (...args) => console.log(newDateFormated(), color ? '[\x1b[36mdebug\x1b[0m]' : '[debug]', ...args)
    // @ts-ignore fallthrough
    case 'INFO':
      console.info = (...args) => console.log(newDateFormated(), color ? ' [\x1b[32minfo\x1b[0m]' : ' [info]', ...args)
    // @ts-ignore fallthrough
    case 'WARNING':
      console.warn = (...args) => console.log(newDateFormated(), color ? ' [\x1b[33mwarn\x1b[0m]' : ' [warn]', ...args)
    // @ts-ignore fallthrough
    case 'ERROR':
      console.error = (...args) => console.log(newDateFormated(), color ? '[\x1b[31merror\x1b[0m]' : '[error]', ...args)
      break
    default:
      exhaustiveCheck(logLevel)
  }
}
