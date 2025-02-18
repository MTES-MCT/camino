import { convert } from 'html-to-text'
import { CaminoMailMessage, MailjetPostMessageRecipient, mailJetSendMail } from './index'
import { EmailTemplateId } from './types'
import { emailCheck } from '../email-check'
import { config } from '../../config/index'
import { isNotNullNorUndefined, OmitDistributive, onlyUnique } from 'camino-common/src/typescript-tools'

export const mailjetSend = async (emails: readonly string[], message: OmitDistributive<CaminoMailMessage, 'To'>): Promise<void> => {
  try {
    if (!Array.isArray(emails)) {
      throw new Error(`un tableau d'emails est attendu ${emails}`)
    }

    emails.forEach(to => {
      if (!emailCheck(to)) {
        throw new Error(`adresse email invalide ${to}`)
      }
    })

    emails = emails.filter(isNotNullNorUndefined).filter(onlyUnique)
    // si on est pas sur le serveur de prod
    // l'adresse email du destinataire est remplacée
    if (config().NODE_ENV !== 'production' || config().ENV !== 'prod') {
      emails = [config().ADMIN_EMAIL]
    }

    const sendTo: MailjetPostMessageRecipient[] = emails.map(Email => ({ Email, Name: Email }))
    const fullMessage: CaminoMailMessage = {
      ...message,
      To: sendTo,
    }
    await mailJetSendMail(fullMessage)
  } catch (e: any) {
    console.error('erreur: emailsSend', e)
    throw new Error(e)
  }
}

export const emailsSend = async (emails: string[], subject: string, html: string): Promise<void> => {
  if (config().NODE_ENV !== 'production' || config().ENV !== 'prod') {
    html = `<p style="color: red">destinataire(s): ${emails.join(', ')} | env: ${config().ENV} | node: ${config().NODE_ENV}</p> ${html}`
  }

  return mailjetSend(emails, {
    Subject: `[Camino] ${subject}`,
    HTMLPart: html,
    TextPart: convert(html, {
      wordwrap: 130,
    }),
  })
}

export const emailsWithTemplateSend = async (emails: string[], templateId: EmailTemplateId, params: Record<string, string>): Promise<void> => {
  return mailjetSend(emails, {
    TemplateID: templateId,
    TemplateLanguage: true,
    Variables: params,
  })
}
