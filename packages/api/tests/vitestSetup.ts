import { vi } from 'vitest'

const origEmails = vi.importActual('../src/tools/api-mailjet/emails')
vi.mock('../src/tools/api-mailjet/emails', () => ({
  __esModule: true,
  ...origEmails,
  emailsSend: vi.fn().mockImplementation(a => a),
  emailsWithTemplateSend: vi.fn().mockImplementation(a => a)
}))

vi.mock('../src/tools/api-mailjet/newsletter', () => ({
  __esModule: true,
  newsletterSubscriberUpdate: vi.fn().mockImplementation(() => 'succès')
}))
