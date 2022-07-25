import mj from 'node-mailjet'

export const mailjet = mj.connect(
  process.env.API_MAILJET_KEY || 'fakeKey',
  process.env.API_MAILJET_SECRET!
)
