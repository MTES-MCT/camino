/* eslint no-console: 0 */

const numberToDoubleCharString = (param: number): string => param.toString(10).padStart(2, '0')
// TODO 2022-07-13: move to common?
export const newDateFormated = (date = new Date()): string => {
  const year = date.getFullYear()
  const month = numberToDoubleCharString(date.getMonth() + 1)
  const day = numberToDoubleCharString(date.getDate())
  const hour = numberToDoubleCharString(date.getUTCHours())
  const minute = numberToDoubleCharString(date.getMinutes())
  const seconds = numberToDoubleCharString(date.getSeconds())

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + seconds
}

export const consoleOverride = (color = true) => {
  console.info = (...args) => console.log(newDateFormated(), color ? ' [\x1b[32minfo\x1b[0m]' : ' [info]', ...args)
  console.warn = (...args) => console.log(newDateFormated(), color ? ' [\x1b[33mwarn\x1b[0m]' : ' [warn]', ...args)
  console.error = (...args) => console.log(newDateFormated(), color ? '[\x1b[31merror\x1b[0m]' : '[error]', ...args)
  // TODO 2022-07-13 Not used in the application...
  console.debug = (...args) => console.log(newDateFormated(), color ? '[\x1b[36mdebug\x1b[0m]' : '[debug]', ...args)
}
