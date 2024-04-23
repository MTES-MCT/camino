const dateFormat = dateString => {
  if (typeof dateString !== 'string' || !dateString) {
    return ''
  }

  const [y, m, d] = dateString.split('-')

  return `${d}-${m}-${y}`
}

const textNumberFormat = (text, options) => {
  let value = text
    .replace(/[^\d-,.]+/, '')
    .replace(/\s/, '')
    .replace(/\./, ',')

  value = options.negative ? value.replace(/^([\d-][\d,]*)(-)+/, '$1') : value.replace(/-/g, '')

  value = options.integer ? value.replace(/\..*$/, '').replace(/,.*$/, '') : value.replace(/(\d+,\d*)([,.]+)/, '$1')

  return value
}

const textToNumberFormat = text => {
  const value = text.replace(/\s/g, '').replace(/,/g, '.')

  const number = parseFloat(value)

  return Number.isNaN(number) ? null : number
}

const typenameOmit = (key, value) => (key === '__typename' ? undefined : value)

const cloneAndClean = json => JSON.parse(JSON.stringify(json), typenameOmit)

export { dateFormat, textNumberFormat, textToNumberFormat, cloneAndClean }
