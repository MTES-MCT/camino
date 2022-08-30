import { mailjet } from './index'

interface IContactListAdd {
  ListID: number
  Action: string
}

const contactListId = Number(process.env.API_MAILJET_CONTACTS_LIST_ID!)

const isSubscribed = async (email: string): Promise<boolean> => {
  const recipientsResult = await mailjet
    .get('listrecipient', { version: 'v3' })
    .request({}, { ContactEmail: email, ContactsList: contactListId })

  // TODO 2022-08-30 en attente d'un meilleur typage https://github.com/mailjet/mailjet-apiv3-nodejs/issues/217
  return (recipientsResult.body as { Count: number }).Count > 0
}

const contactListSubscribe = async (
  email: string,
  Action: 'addforce' | 'unsub'
) => {
  const contactResult = (await mailjet
    .post('contact', { version: 'v3' })
    .id(encodeURIComponent(email))
    .action('managecontactslists')
    .request({
      ContactsLists: [{ Action, ListID: contactListId }]
    })) as { body: { Data: IContactListAdd[] } }

  const contactListAdded = contactResult.body.Data[0]

  return !!contactListAdded
}

const contactAdd = async (email: string): Promise<void> => {
  try {
    await mailjet.post('contact', { version: 'v3' }).request({ Email: email })
  } catch (e: any) {
    // MJ18 -> erreur mailjet contact déjà existant
    if (!e.statusText.includes('MJ18')) {
      throw e
    }
    console.info(`utilisateur ${email} déjà existant chez mailjet`)
  }
}

export const newsletterSubscriberUpdate = async (
  email: string,
  subscribed: boolean
) => {
  await isSubscribed(email)
  try {
    if (subscribed) {
      await contactAdd(email)
      await contactListSubscribe(email, 'addforce')

      return 'email inscrit à la newsletter'
    } else {
      await contactListSubscribe(email, 'unsub')

      return 'email désinscrit à la newsletter'
    }
  } catch (e: any) {
    console.error(
      'une erreur est apparue lors de la communication avec mailjet',
      e
    )
    throw new Error(e)
  }
}
