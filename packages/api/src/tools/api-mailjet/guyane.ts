import { config } from '../../config/index'
import { mailjet } from './index'

const exploitantsGuyaneContactListId = config().API_MAILJET_EXPLOITANTS_GUYANE_LIST_ID

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
