import {
  utilisateursGet,
  utilisateurUpdate
} from '../../database/queries/utilisateurs'
import { userSuper } from '../../database/user-super'
import { newsletterSubscribersFind } from '../../tools/api-mailjet/newsletter'

export const utilisateursNewsletterUpdate = async (
  utilisateursIds?: string[]
) => {
  console.info()
  console.info('utilisateurs inscrits à la newsletter…')

  const utilisateurs = await utilisateursGet(
    { ids: utilisateursIds },
    { fields: {} },
    userSuper
  )

  const emails = await newsletterSubscribersFind()

  const utilisateursUpdated = [] as string[]

  for (const utilisateur of utilisateurs) {
    if (
      utilisateur.email &&
      ((emails.includes(utilisateur.email) && !utilisateur.newsletter) ||
        (!emails.includes(utilisateur.email) && utilisateur.newsletter))
    ) {
      const newsletter = !utilisateur.newsletter
      await utilisateurUpdate(utilisateur.id, { newsletter })

      console.info(
        'utilisateur : inscrit à la newsletter (mise à jour) ->',
        `${utilisateur.id} : ${newsletter}`
      )

      utilisateursUpdated.push(utilisateur.id)
    }
  }

  return utilisateursUpdated
}
