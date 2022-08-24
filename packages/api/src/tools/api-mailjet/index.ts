import Mailjet from 'node-mailjet'

export const mailjet = new Mailjet({
  apiKey: process.env.API_MAILJET_KEY || 'fakeKey',
  apiSecret: process.env.API_MAILJET_SECRET || 'fakeSecret'
})
