import dateFormat from 'dateformat'

import { ITitreActivite } from '../../types'

import { titreActiviteTypeCheck } from '../utils/titre-activite-type-check'
import { anneesBuild } from '../../tools/annees-build'
import { titresActivitesUpsert } from '../../database/queries/titres-activites'
import { titreActivitesBuild } from '../rules/titre-activites-build'
import { titresGet } from '../../database/queries/titres'
import { activitesTypesGet } from '../../database/queries/metas-activites'
import { userSuper } from '../../database/user-super'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails'
import { activitesUrlGet } from '../utils/urls-get'
import { EmailTemplateId } from '../../tools/api-mailjet/types'

export const titresActivitesUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('activités des titres…')

  const titres = await titresGet(
    { ids: titresIds },
    {
      fields: {
        demarches: {
          type: { id: {} },
          phase: { id: {} },
          etapes: { id: {} }
        },
        communes: { id: {} },
        activites: { id: {} },
        titulaires: { utilisateurs: { id: {} } }
      }
    },
    userSuper
  )

  const activitesTypes = await activitesTypesGet({
    fields: {
      titresTypes: { id: {} },
      administrations: { id: {} },
      documentsTypes: { id: {} },
      activitesTypesPays: { id: {} }
    }
  })

  const aujourdhui = dateFormat(new Date(), 'yyyy-mm-dd')

  const titresActivitesCreated = activitesTypes.reduce(
    (acc: ITitreActivite[], activiteType) => {
      const annees = anneesBuild(activiteType.dateDebut, aujourdhui)
      if (!annees.length) return acc

      acc.push(
        ...titres.reduce((acc: ITitreActivite[], titre) => {
          if (!titreActiviteTypeCheck(activiteType, titre)) return acc

          acc.push(
            ...titreActivitesBuild(
              activiteType,
              annees,
              aujourdhui,
              titre.id,
              titre.typeId,
              titre.demarches,
              titre.activites
            )
          )

          return acc
        }, [])
      )

      return acc
    },
    []
  )

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
      await emailsWithTemplateSend(
        [...emails],
        EmailTemplateId.ACTIVITES_NOUVELLES,
        {
          activitesUrl: activitesUrlGet({ statutsIds: ['abs', 'enc'] })
        }
      )
    }

    console.info(
      'titre / activités (création) ->',
      titresActivitesCreated.map(ta => ta.titreId).join(', ')
    )
  }

  return titresActivitesCreated.map(ta => ta.titreId)
}
