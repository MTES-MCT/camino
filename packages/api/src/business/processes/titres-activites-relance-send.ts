import dateFormat from 'dateformat'

import { titresActivitesGet } from '../../database/queries/titres-activites'
import { userSuper } from '../../database/user-super'
import { dateAddDays, dateAddMonths } from '../../tools/date'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails'
import { activitesUrlGet } from '../utils/urls-get'
import { EmailTemplateId } from '../../tools/api-mailjet/types'

export const ACTIVITES_DELAI_RELANCE_JOURS = 14

const titresActivitesRelanceSend = async (aujourdhui = new Date()) => {
  console.info()
  console.info('relance des activités des titres…')

  const statutsIds = ['abs', 'enc']
  const typesIds = ['gra', 'grx', 'pma', 'pmb', 'pmc', 'pmd', 'wrp']
  const activites = await titresActivitesGet(
    { statutsIds, typesIds },
    {
      fields: {
        type: { id: {} },
        titre: { titulaires: { utilisateurs: { id: {} } } }
      }
    },
    userSuper
  )

  const aujourdhuiFormatted = dateFormat(aujourdhui, 'yyyy-mm-dd')

  const dateDelai = dateAddDays(
    aujourdhuiFormatted,
    ACTIVITES_DELAI_RELANCE_JOURS
  )

  const titresActivitesRelanceToSend = activites.filter(
    ({ date }) => dateDelai === dateAddMonths(date, 3)
  )

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
      await emailsWithTemplateSend(
        [...emails],
        EmailTemplateId.ACTIVITES_RELANCE,
        {
          activitesUrl: activitesUrlGet({
            typesIds,
            statutsIds,
            annees: [aujourdhui.getFullYear() - 1]
          })
        }
      )
    }

    const log = {
      type: 'titre / activités (relance) ->',
      value: titresActivitesRelanceToSend.map(ta => ta.id).join(', ')
    }

    console.info(log.type, log.value)
  }

  return titresActivitesRelanceToSend.map(ta => ta.id)
}

export { titresActivitesRelanceSend }
