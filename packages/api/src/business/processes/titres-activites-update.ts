import { ITitreActivite } from '../../types.js'

import { titreActiviteTypeCheck } from '../utils/titre-activite-type-check.js'
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

  const activitesTypes = sortedActivitesTypes

  const titresActivitesCreated = activitesTypes.reduce((acc: ITitreActivite[], activiteType) => {
    const annees = anneesBuild(activiteType.dateDebut, aujourdhui)
    if (!annees.length) return acc

    acc.push(
      ...titres.reduce((acc: ITitreActivite[], titre) => {
        if (!titreActiviteTypeCheck(activiteType.id, titre)) return acc

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
          if (email) {
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
