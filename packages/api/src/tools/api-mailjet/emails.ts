import { convert } from 'html-to-text'
import { mailjet } from './index.js'
import { EmailTemplateId } from './types.js'
import { emailCheck } from '../email-check.js'

const from = {
  email: process.env.API_MAILJET_EMAIL,
  name: 'Camino - le cadastre minier',
}

export const mailjetSend = async (emails: string[], options: Record<string, any>) => {
  try {
    if (!Array.isArray(emails)) {
      throw new Error(`un tableau d'emails est attendu ${emails}`)
    }

    emails.forEach(to => {
      if (!emailCheck(to)) {
        throw new Error(`adresse email invalide ${to}`)
      }
    })

    // si on est pas sur le serveur de prod
    // l'adresse email du destinataire est remplacée
    if (process.env.NODE_ENV !== 'production' || process.env.ENV !== 'prod') {
      emails = [process.env.ADMIN_EMAIL!]
    }

    const res = (await mailjet.post('send', { version: 'v3' }).request({
      SandboxMode: 'true',
      Messages: [
        {
          FromEmail: from.email,
          FromName: from.name,
          Recipients: emails.map(Email => ({ Email })),
          ...options,
        },
      ],
    })) as {
      body: {
        Sent: { Email: string; MessageID: string; MessageUUID: string }[]
      }
    }

    console.info(`Messages envoyés: ${emails.join(', ')}, MessageIDs: ${res.body.Sent.map(m => m.MessageID).join(', ')}`)
  } catch (e: any) {
    console.error('erreur: emailsSend', e)
    throw new Error(e)
  }
}

export const emailsSend = async (emails: string[], subject: string, html: string) => {
  if (process.env.NODE_ENV !== 'production' || process.env.ENV !== 'prod') {
    html = `<p style="color: red">destinataire(s): ${emails.join(', ')} | env: ${process.env.ENV} | node: ${process.env.NODE_ENV}</p> ${html}`
  }

  mailjetSend(emails, {
    Subject: `[Camino] ${subject}`,
    'Html-part': html,
    'Text-part': convert(html, {
      wordwrap: 130,
    }),
  })
}

export const emailsWithTemplateSend = async (emails: string[], templateId: EmailTemplateId, params: Record<string, string>) => {
  mailjetSend(emails, {
    'Mj-TemplateID': templateId,
    'Mj-TemplateLanguage': true,
    Vars: params,
  })
}
