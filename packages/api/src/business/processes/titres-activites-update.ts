import { ITitreActivite } from '../../types.js'

import { anneesBuild } from '../../tools/annees-build.js'
import { titresActivitesUpsert } from '../../database/queries/titres-activites.js'
import { titreActivitesBuild } from '../rules/titre-activites-build.js'
import { titresGet } from '../../database/queries/titres.js'
import { userSuper } from '../../database/user-super.js'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails.js'
import { activitesUrlGet } from '../utils/urls-get.js'
import { EmailTemplateId } from '../../tools/api-mailjet/types.js'
import { CaminoDate, getCurrent } from 'camino-common/src/date.js'
import { sortedActivitesTypes } from 'camino-common/src/static/activitesTypes.js'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { canHaveActiviteTypeId } from 'camino-common/src/permissions/titres.js'

export const titresActivitesUpdate = async (titresIds?: string[], aujourdhui: CaminoDate = getCurrent()) => {
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
        titulaires: { utilisateurs: { id: {} } },
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

      if (!titre) {
        console.error(`titre inconnu : ${activite.titreId}`)
        continue
      }
      titre.titulaires?.forEach(titulaire =>
        titulaire.utilisateurs?.forEach(({ email }) => {
          if (isNotNullNorUndefined(email)) {
            emails.add(email)
          }
        })
      )
    }

    // envoi d’email aux opérateurs pour les prévenir de l’ouverture des déclarations
    if (emails.size) {
      await emailsWithTemplateSend([...emails], EmailTemplateId.ACTIVITES_NOUVELLES, {
        activitesUrl: activitesUrlGet({ statutsIds: ['abs', 'enc'] }),
      })
    }

    console.info('titre / activités (création) ->', titresActivitesCreated.map(ta => ta.titreId).join(', '))
  }

  return titresActivitesCreated.map(ta => ta.titreId)
}
