import { titresActivitesGet } from '../../database/queries/titres-activites'
import { userSuper } from '../../database/user-super'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails'
import { activitesUrlGet } from '../utils/urls-get'
import { EmailTemplateId } from '../../tools/api-mailjet/types'
import { CaminoDate, anneePrecedente, dateAddDays, dateAddMonths, getAnnee, getCurrent } from 'camino-common/src/date'
import { ITitreActivite } from '../../types'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts'
import { GetEntrepriseUtilisateurs, getEntrepriseUtilisateurs } from '../../api/rest/entreprises.queries'
import { Pool } from 'pg'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { isEntrepriseRole } from 'camino-common/src/roles'

const ACTIVITES_DELAI_RELANCE_JOURS = 14

const activiteStatutsIds: ActivitesStatutId[] = ['abs', 'enc']
const activiteTypesIds: ActivitesTypesId[] = ['gra', 'grx', 'pma', 'pmb', 'pmc', 'pmd', 'wrp']

export const titresActivitesRelanceSend = async (pool: Pool, aujourdhui = getCurrent()) => {
  console.info()
  console.info('relance des activités des titres…')

  const activites = await titresActivitesGet(
    { statutsIds: activiteStatutsIds, typesIds: activiteTypesIds },
    {
      fields: {
        titre: { titulairesEtape: { id: {} } },
      },
    },
    userSuper
  )

  return checkDateAndSendEmail((titulaireId: EntrepriseId) => getEntrepriseUtilisateurs(pool, titulaireId), aujourdhui, activites)
}

// Visible only for tests
export const checkDateAndSendEmail = async (
  getEmailsByEntrepriseId: (entrepriseId: EntrepriseId) => Promise<GetEntrepriseUtilisateurs[]>,
  aujourdhui: CaminoDate,
  activites: (Pick<ITitreActivite, 'date' | 'id'> & { titre?: { titulaireIds?: EntrepriseId[] | undefined | null } | undefined | null })[]
) => {
  const dateDelai = dateAddDays(aujourdhui, ACTIVITES_DELAI_RELANCE_JOURS)

  const titresActivitesRelanceToSend = activites.filter(({ date }) => dateDelai === dateAddMonths(date, 3))
  if (titresActivitesRelanceToSend.length) {
    // envoi d’email aux opérateurs pour les relancer ACTIVITES_DELAI_RELANCE_JOURS jours avant la fermeture automatique de l’activité
    const emails = new Set<string>()
    for (const activite of titresActivitesRelanceToSend) {
      const titre = activite.titre

      if (isNotNullNorUndefined(titre) && isNotNullNorUndefinedNorEmpty(titre.titulaireIds)) {
        const utilisateursByEntreprise = await Promise.all(titre.titulaireIds.map(getEmailsByEntrepriseId))

        utilisateursByEntreprise.flat().forEach(({ email, role }) => {
          if (isNotNullNorUndefinedNorEmpty(email) && isEntrepriseRole(role)) {
            emails.add(email)
          }
        })
      }

      if (emails.size) {
        await emailsWithTemplateSend([...emails], EmailTemplateId.ACTIVITES_RELANCE, {
          activitesUrl: activitesUrlGet({
            activiteTypesIds,
            activiteStatutsIds,
            annees: [anneePrecedente(getAnnee(aujourdhui))],
          }),
        })
      }
    }

    console.info('titre / activités (relance) ->', titresActivitesRelanceToSend.map(ta => ta.id).join(', '))
  }

  return titresActivitesRelanceToSend.map(ta => ta.id)
}
