import cryptoRandomString from 'crypto-random-string'

export const idGenerate = () =>
  cryptoRandomString({ length: 24, type: 'alphanumeric' })
