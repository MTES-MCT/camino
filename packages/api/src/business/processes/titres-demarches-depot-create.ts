import type { ITitreDemarche, ITitreEntreprise, ITitreEtape } from '../../types.js'

import { titreEtapeUpsert } from '../../database/queries/titres-etapes.js'
import { titreDemarcheGet } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import titreEtapeUpdateTask from '../titre-etape-update.js'
import { titreEtapeAdministrationsEmailsSend } from '../../api/graphql/resolvers/_titre-etape-email.js'
import { demarcheDefinitionFind } from '../rules-demarches/definitions.js'
import { titreUrlGet } from '../utils/urls-get.js'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails.js'
import { EmailTemplateId, EmailAdministration } from '../../tools/api-mailjet/types.js'
import { getCurrent } from 'camino-common/src/date.js'
import type { Pool } from 'pg'
const emailConfirmationDepotSend = async (
  emails: string[],
  params: {
    titreTypeNom: string
    titulaireNom: string
    titreUrl: string
    titreNom: string
  }
) => {
  await emailsWithTemplateSend(emails, EmailTemplateId.DEMARCHE_CONFIRMATION_DEPOT, {
    ...params,
    emailONF: EmailAdministration.ONF,
    emailDGTM: EmailAdministration.DGTM,
  })
}

// envoie un email de confirmation à l’opérateur
const titreEtapeDepotConfirmationEmailsSend = async (titreDemarche: ITitreDemarche, etape: ITitreEtape, titulaires: ITitreEntreprise[]) => {
  const titreUrl = titreUrlGet(titreDemarche.titreId)
  const titreNom = titreDemarche.titre!.nom
  const titreTypeNom = titreDemarche.titre!.type!.type!.nom

  for (const titulaire of titulaires) {
    const emails = titulaire.utilisateurs?.map(u => u.email).filter(email => !!email) as string[]

    if (emails?.length) {
      await emailConfirmationDepotSend(emails, {
        titreTypeNom,
        titulaireNom: titulaire.nom ?? '',
        titreUrl,
        titreNom,
      })
    }
  }
}

// visibleForTesting
export const titreDemarcheDepotCheck = (titreDemarche: ITitreDemarche): boolean => {
  const demarcheDefinition = demarcheDefinitionFind(titreDemarche.titre!.typeId, titreDemarche.typeId, titreDemarche.etapes, titreDemarche.id)
  // On peut déposer automatiquement seulement les démarches qui possèdent une machine
  if (!demarcheDefinition) return false
  if (titreDemarche.titre!.typeId === 'arm' && titreDemarche.typeId === 'oct') {
    // Si on a pas de demande faite
    if (!titreDemarche.etapes?.find(e => e.typeId === 'mfr' && e.statutId === 'fai')) {
      return false
    }

    // Si on a déjà un dépot de la demande
    return !titreDemarche.etapes?.find(e => e.typeId === 'mdp')
  }

  return false
}

export const titreEtapeDepotCreate = async (pool: Pool, titreDemarche: ITitreDemarche) => {
  let titreEtapeDepot = {
    titreDemarcheId: titreDemarche.id,
    typeId: 'mdp',
    statutId: 'fai',
    date: getCurrent(),
  } as ITitreEtape

  titreEtapeDepot = await titreEtapeUpsert(titreEtapeDepot, userSuper, titreDemarche.titreId)
  await titreEtapeUpdateTask(pool, titreEtapeDepot.id, titreEtapeDepot.titreDemarcheId, userSuper)
  await titreEtapeAdministrationsEmailsSend(titreEtapeDepot, titreEtapeDepot.type!, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre!.typeId, userSuper)

  const titulaires = titreDemarche.titre?.titulaires

  if (titulaires?.length) {
    await titreEtapeDepotConfirmationEmailsSend(titreDemarche, titreEtapeDepot, titulaires)
  }
}
export const titresEtapesDepotCreate = async (pool: Pool, demarcheId: string) => {
  console.info()
  console.info('dépôt d’une démarche…')

  const titreDemarche = await titreDemarcheGet(
    demarcheId,
    {
      fields: {
        etapes: { id: {} },
        titre: {
          type: { type: { id: {} } },
          titulaires: { utilisateurs: { id: {} } },
        },
      },
    },
    userSuper
  )

  if (!titreDemarche) {
    return false
  }

  const depotCheck = titreDemarcheDepotCheck(titreDemarche)
  if (depotCheck) {
    await titreEtapeDepotCreate(pool, titreDemarche)
  }

  return depotCheck
}
