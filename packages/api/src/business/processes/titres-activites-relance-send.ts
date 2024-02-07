import { titresActivitesGet } from '../../database/queries/titres-activites.js'
import { userSuper } from '../../database/user-super.js'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails.js'
import { activitesUrlGet } from '../utils/urls-get.js'
import { EmailTemplateId } from '../../tools/api-mailjet/types.js'
import { anneePrecedente, dateAddDays, dateAddMonths, getAnnee, getCurrent } from 'camino-common/src/date.js'

const ACTIVITES_DELAI_RELANCE_JOURS = 14

export const titresActivitesRelanceSend = async (aujourdhui = getCurrent()) => {
  console.info()
  console.info('relance des activités des titres…')

  const statutsIds = ['abs', 'enc']
  const typesIds = ['gra', 'grx', 'pma', 'pmb', 'pmc', 'pmd', 'wrp']
  const activites = await titresActivitesGet(
    { statutsIds, typesIds },
    {
      fields: {
        titre: { titulaires: { utilisateurs: { id: {} } } },
      },
    },
    userSuper
  )

  const dateDelai = dateAddDays(aujourdhui, ACTIVITES_DELAI_RELANCE_JOURS)

  const titresActivitesRelanceToSend = activites.filter(({ date }) => dateDelai === dateAddMonths(date, 3))
  if (titresActivitesRelanceToSend.length) {
    // envoi d’email aux opérateurs pour les relancer ACTIVITES_DELAI_RELANCE_JOURS jours avant la fermeture automatique de l’activité
    const emails = new Set<string>()
    for (const activite of titresActivitesRelanceToSend) {
      const titre = activite.titre!
      titre.titulaires?.forEach(titulaire =>
        titulaire.utilisateurs?.forEach(({ email }) => {
          if (email) {
            emails.add(email)
          }
        })
      )
    }
    if (emails.size) {
      await emailsWithTemplateSend([...emails], EmailTemplateId.ACTIVITES_RELANCE, {
        activitesUrl: activitesUrlGet({
          typesIds,
          statutsIds,
          annees: [anneePrecedente(getAnnee(aujourdhui))],
        }),
      })
    }

    console.info('titre / activités (relance) ->', titresActivitesRelanceToSend.map(ta => ta.id).join(', '))
  }

  return titresActivitesRelanceToSend.map(ta => ta.id)
}
