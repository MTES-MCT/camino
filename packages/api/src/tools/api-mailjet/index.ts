import { config } from '../../config/index'
import { fetch } from 'undici'

const basicCreds = Buffer.from(`${config().API_MAILJET_KEY}:${config().API_MAILJET_SECRET}`).toString('base64')

export interface MailjetPostMessageRecipient {
  Email: string
  Name: string
}
interface MailjetPostMessageCommon {
  From: MailjetPostMessageRecipient
  ReplyTo: Omit<MailjetPostMessageRecipient, 'Name'>
  To: MailjetPostMessageRecipient[]
}

interface MailjetPostBodyMessage {
  Subject: string
  TextPart: string
  HTMLPart?: string
}
interface MailjetPostTemplateMessage {
  TemplateID: number
  TemplateLanguage: true
  Variables: Record<string, string>
}

export type CaminoMailMessage = { To: MailjetPostMessageRecipient[] } & (MailjetPostBodyMessage | MailjetPostTemplateMessage)

type MailjetPostMessage = MailjetPostMessageCommon & (MailjetPostBodyMessage | MailjetPostTemplateMessage)
interface MailjetPost {
  Messages: MailjetPostMessage[]
}

interface MailjetResponseMessageTo {
  Email: string
  MessageUUID: string
  MessageID: string
  MessageHref: string
}
interface MailjetResponseMessage {
  Status: 'success' | string
  To: MailjetResponseMessageTo[]
}
interface MailjetSendMailResponse {
  Messages: MailjetResponseMessage[]
}

const From: MailjetPostMessageRecipient = {
  Email: config().API_MAILJET_EMAIL,
  Name: 'Camino - le cadastre minier',
}

const ReplyTo: Omit<MailjetPostMessageRecipient, 'Name'> = {
  Email: config().API_MAILJET_REPLY_TO_EMAIL,
}

const exploitantsGuyaneContactListId = config().API_MAILJET_EXPLOITANTS_GUYANE_LIST_ID
interface MailjetListUser {
  Email: string
  Name: string
  IsExcludedFromCampaigns: false
  Properties: 'object'
}
interface MailjetManageManyContacts {
  Action: 'addnoforce' | 'addforce'
  Contacts: MailjetListUser[]
}

export const mailjetAddContactsToGuyaneList = async (mails: { email: string; nom: string }[]): Promise<void> => {
  console.info(`ajout de ${mails.length} utilisateurs à la liste ${exploitantsGuyaneContactListId}`)
  const body: MailjetManageManyContacts = {
    Action: 'addforce',
    Contacts: mails.map(user => ({
      Email: user.email,
      Name: user.nom,
      IsExcludedFromCampaigns: false,
      Properties: 'object',
    })),
  }
  const result = await fetch(`https://api.mailjet.com/v3/REST/contactslist/${exploitantsGuyaneContactListId}/managemanycontacts`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Basic ${basicCreds}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (result.ok) {
    console.info(`Liste mise à jour`)
  } else {
    console.error(`Une erreur est survenue lors de l'envoi des mails ${await result.text()}`)
  }
}

export const mailJetSendMail = async (post: CaminoMailMessage): Promise<void> => {
  const body: MailjetPost = {
    Messages: [{ ...post, From, ReplyTo }],
  }
  const result = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Basic ${basicCreds}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (result.ok) {
    const values: MailjetSendMailResponse = (await result.json()) as MailjetSendMailResponse

    if (values.Messages.find(message => message.Status !== 'success')) {
      console.warn(`Quelque chose s'est mal passé durant l'envoi des mails, réponse: ${JSON.stringify(values)}`)
    } else {
      console.info(`Messages envoyés: ${post.To.map(({ Email }) => Email).join(', ')}, MessageIDs: ${values.Messages.flatMap(m => m.To.flatMap(to => to.MessageID)).join(', ')}`)
    }
  } else {
    console.error(`Une erreur est survenue lors de l'envoi des mails ${await result.text()}`)
  }
}
