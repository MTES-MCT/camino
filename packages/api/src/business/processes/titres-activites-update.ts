import { ITitreActivite } from '../../types'

import { anneesBuild } from '../../tools/annees-build'
import { titresActivitesUpsert } from '../../database/queries/titres-activites'
import { titreActivitesBuild } from '../rules/titre-activites-build'
import { titresGet } from '../../database/queries/titres'
import { userSuper } from '../../database/user-super'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails'
import { activitesUrlGet } from '../utils/urls-get'
import { EmailTemplateId } from '../../tools/api-mailjet/types'
import { CaminoDate, getCurrent } from 'camino-common/src/date'
import { sortedActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { canHaveActiviteTypeId } from 'camino-common/src/permissions/titres'
import { Pool } from 'pg'
import { getEntrepriseUtilisateurs } from '../../api/rest/entreprises.queries'
import { isEntrepriseRole } from 'camino-common/src/roles'

export const titresActivitesUpdate = async (pool: Pool, titresIds?: string[], aujourdhui: CaminoDate = getCurrent()) => {
  console.info()
  console.info('activités des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          etapes: { id: {} },
        },
        pointsEtape: { id: {} },
        activites: { id: {} },
        titulairesEtape: { id: {} },
      },
    },
    userSuper
  )

  const titresActivitesCreated = sortedActivitesTypes.reduce((acc: ITitreActivite[], activiteType) => {
    const annees = anneesBuild(activiteType.dateDebut, aujourdhui)
    if (!annees.length) return acc

    acc.push(
      ...titres.reduce((acc: ITitreActivite[], titre) => {
        if (isNullOrUndefined(titre.demarches)) {
          throw new Error('les démarches du titre ne sont pas chargées')
        }

        if (isNullOrUndefined(titre.communes)) {
          throw new Error('les communes du titre ne sont pas chargées')
        }

        if (isNullOrUndefined(titre.secteursMaritime)) {
          throw new Error('les secteursMaritime du titre ne sont pas chargés')
        }

        // si le type d'activité est relié au type de titre
        if (!canHaveActiviteTypeId(activiteType.id, { titreTypeId: titre.typeId, communes: titre.communes, secteursMaritime: titre.secteursMaritime, demarches: titre.demarches })) return acc

        acc.push(...titreActivitesBuild(activiteType.id, annees, aujourdhui, titre.id, titre.typeId, titre.demarches, titre.activites))

        return acc
      }, [])
    )

    return acc
  }, [])

  if (titresActivitesCreated.length) {
    await titresActivitesUpsert(titresActivitesCreated)

    const emails = new Set<string>()
    for (const activite of titresActivitesCreated) {
      const titre = titres.find(({ id }) => id === activite.titreId)

      if (isNullOrUndefined(titre)) {
        console.error(`titre inconnu : ${activite.titreId}`)
        continue
      }

      if (isNotNullNorUndefinedNorEmpty(titre.titulaireIds)) {
        const utilisateursByEntreprise = await Promise.all(titre.titulaireIds.map(titulaireId => getEntrepriseUtilisateurs(pool, titulaireId)))

        utilisateursByEntreprise.flat().forEach(({ email, role }) => {
          if (isNotNullNorUndefinedNorEmpty(email) && isEntrepriseRole(role)) {
            emails.add(email)
          }
        })
      }
    }

    // envoi d’email aux opérateurs pour les prévenir de l’ouverture des déclarations
    if (emails.size) {
      await emailsWithTemplateSend([...emails], EmailTemplateId.ACTIVITES_NOUVELLES, {
        activitesUrl: activitesUrlGet({ activiteStatutsIds: ['abs', 'enc'] }),
      })
    }

    console.info('titre / activités (création) ->', titresActivitesCreated.map(ta => ta.titreId).join(', '))
  }

  return titresActivitesCreated.map(ta => ta.titreId)
}
