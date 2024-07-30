import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../../config/index'
import { mailjet } from './index'

interface IContactListAdd {
  ListID: number
  Action: string
}

const newsLetterContactListId = config().API_MAILJET_CONTACTS_LIST_ID
const exploitantsGuyaneContactListId = config().API_MAILJET_EXPLOITANTS_GUYANE_LIST_ID

export const isSubscribedToNewsLetter = async (email: string | null | undefined): Promise<boolean> => {
  return isSubscribed(newsLetterContactListId, email)
}

const isSubscribed = async (contactListId: number, email: string | null | undefined): Promise<boolean> => {
  if (isNotNullNorUndefined(email) && email !== '') {
    const recipientsResult = await mailjet.get('listrecipient', { version: 'v3' }).request(
      {},
      {
        ContactEmail: email,
        ContactsList: contactListId,
        Unsub: false,
        countOnly: true,
      }
    )

    // TODO 2022-08-30 en attente d'un meilleur typage https://github.com/mailjet/mailjet-apiv3-nodejs/issues/217
    return (recipientsResult.body as { Count: number }).Count > 0
  }

  return false
}

const contactListSubscribe = async (email: string, contactListId: number, Action: 'addforce' | 'unsub'): Promise<boolean> => {
  const contactResult = (await mailjet
    .post('contact', { version: 'v3' })
    .id(encodeURIComponent(email))
    .action('managecontactslists')
    .request({
      ContactsLists: [{ Action, ListID: contactListId }],
    })) as { body: { Data: IContactListAdd[] } }

  const contactListAdded = contactResult.body.Data[0]

  return isNotNullNorUndefined(contactListAdded)
}

const contactAdd = async (email: string): Promise<void> => {
  try {
    await mailjet.post('contact', { version: 'v3' }).request({ Email: email })
  } catch (e: any) {
    // MJ18 -> erreur mailjet contact déjà existant
    const statusText: string = e?.statusText ?? ''
    if (statusText.includes('MJ18')) {
      console.info(`utilisateur ${email} déjà existant chez mailjet`)
    } else {
      throw e
    }
  }
}

// TODO 2022-09-27 nettoyer la liste des mails déjà sur la liste mailjet.
export const exploitantsGuyaneSubscriberUpdate = async (users: { email: string; nom: string }[]): Promise<void> => {
  console.info(`ajout de ${users.length} utilisateurs à la liste ${exploitantsGuyaneContactListId}`)
  const contacts = users.map(user => ({
    Email: user.email,
    Name: user.nom,
    IsExcludedFromCampaigns: false,
    Properties: 'object',
  }))
  await mailjet
    .post('contact', { version: 'v3' })
    .action('managemanycontacts')
    .request({
      Contacts: contacts,
      ContactsLists: [{ Action: 'addforce', ListID: exploitantsGuyaneContactListId }],
    })
}

export const newsletterSubscriberUpdate = async (email: string | undefined | null, subscribed: boolean): Promise<'email inscrit à la newsletter' | 'email désinscrit à la newsletter' | ''> => {
  if (isNullOrUndefined(email) || email === '') {
    return ''
  }

  await isSubscribed(newsLetterContactListId, email)
  try {
    if (subscribed) {
      await contactAdd(email)
      await contactListSubscribe(email, newsLetterContactListId, 'addforce')

      return 'email inscrit à la newsletter'
    } else {
      await contactListSubscribe(email, newsLetterContactListId, 'unsub')

      return 'email désinscrit à la newsletter'
    }
  } catch (e: any) {
    console.error('une erreur est apparue lors de la communication avec mailjet', e)
    throw new Error(e)
  }
}
