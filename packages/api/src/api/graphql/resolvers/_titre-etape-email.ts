import { ITitreEtape } from '../../../types'

import { emailsSend } from '../../../tools/api-mailjet/emails'
import { titreEtapeGet } from '../../../database/queries/titres-etapes'
import { titreUrlGet } from '../../../business/utils/urls-get'
import { EmailAdministration } from '../../../tools/api-mailjet/types'
import { UserNotNull } from 'camino-common/src/roles'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { TitreId } from 'camino-common/src/validators/titres'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getUtilisateursByTitreId } from '../../../database/queries/utilisateurs.queries'
import { Pool } from 'pg'

const emailForAdministrationContentFormat = (titreTypeId: TitreTypeId, etapeNom: string, titreId: TitreId, user: UserNotNull) => {
  const titreUrl = titreUrlGet(titreId)

  return `
  <h3>L’étape « ${etapeNom} » d’une demande d’${titreTypeId === 'arm' ? 'ARM' : 'AEX'} vient d’être réalisée.</h3>

  <hr>

  <b>Lien</b> : <a href="${titreUrl}">${titreUrl}</a> <br>
  <b>Effectué par</b> : ${user.prenom} ${user.nom} (${user.email})<br>

  `
}

const etapeStatusUpdated = (etape: Pick<ITitreEtape, 'typeId' | 'statutId'>, typeId: string, statusId: string, oldEtape?: Pick<ITitreEtape, 'statutId'>) =>
  etape.typeId === typeId && (!oldEtape || oldEtape.statutId !== statusId) && etape.statutId === statusId

// VisibleForTesting
export const emailsForAdministrationsGet = (
  etape: Pick<ITitreEtape, 'typeId' | 'statutId' | 'isBrouillon'> | undefined,
  demarcheTypeId: string,
  titreId: TitreId,
  titreTypeId: TitreTypeId,
  user: UserNotNull,
  oldEtape?: Pick<ITitreEtape, 'statutId' | 'isBrouillon'>
): { subject: string; content: string; emails: string[] } | null => {
  if (!etape) {
    return null
  }
  const emails = [] as string[]
  let title = ''

  if (demarcheTypeId === 'oct' && titreTypeId === 'arm') {
    // lorsque la demande est déposée
    if (etape.isBrouillon === ETAPE_IS_NOT_BROUILLON && (oldEtape?.isBrouillon ?? ETAPE_IS_BROUILLON) === ETAPE_IS_BROUILLON) {
      emails.push(EmailAdministration.DGTM)

      title = 'Nouvelle demande déposée'

      // lorsque le PTMG déclare le dossier complet
    } else if (etapeStatusUpdated(etape, 'mcp', 'com', oldEtape)) {
      emails.push(EmailAdministration.DGTM)

      title = 'Nouveau dossier complet'

      // lorsque la demande est complète
    } else if (etapeStatusUpdated(etape, 'mcr', 'fav', oldEtape)) {
      emails.push(EmailAdministration.DGTM)

      title = 'Nouvelle demande complète'
    }
  } else if (demarcheTypeId === 'oct' && titreTypeId === 'axm') {
    if (etape.isBrouillon === ETAPE_IS_NOT_BROUILLON && (oldEtape?.isBrouillon ?? ETAPE_IS_BROUILLON) === ETAPE_IS_BROUILLON) {
      emails.push(EmailAdministration.DGTM)

      title = 'Nouvelle demande déposée'
    } else if (etapeStatusUpdated(etape, 'cps', 'fav', oldEtape)) {
      emails.push(EmailAdministration.DGTM)

      title = 'Confirmation de l’accord du propriétaire du sol'
    }
  }

  if (!emails.length) {
    return null
  }

  const etapeType = EtapesTypes[etape.typeId]

  const subject = `${etapeType.nom} | ${title}`
  const content = emailForAdministrationContentFormat(titreTypeId, etapeType.nom, titreId, user)

  return { subject, content, emails }
}

export const titreEtapeAdministrationsEmailsSend = async (
  etape: Pick<ITitreEtape, 'typeId' | 'statutId' | 'isBrouillon'>,
  demarcheTypeId: DemarcheTypeId,
  titreId: TitreId,
  titreTypeId: TitreTypeId,
  user: UserNotNull,
  oldEtape?: ITitreEtape
): Promise<void> => {
  const emailsForAdministrations = emailsForAdministrationsGet(etape, demarcheTypeId, titreId, titreTypeId, user, oldEtape)

  if (emailsForAdministrations) {
    await emailsSend(emailsForAdministrations.emails, emailsForAdministrations.subject, emailsForAdministrations.content)
  }
}

export const titreEtapeUtilisateursEmailsSend = async (etape: ITitreEtape, titreId: TitreId, pool: Pool): Promise<void> => {
  const utilisateursEmails = [] as string[]

  const utilisateursTitres = await getUtilisateursByTitreId(pool, titreId)

  const utilisateurs = utilisateursTitres?.filter(utilisateur => isNotNullNorUndefinedNorEmpty(utilisateur?.email))

  for (const utilisateur of utilisateurs) {
    // On vérifie que l’utilisateur puisse voir l’étape
    const titreEtape = await titreEtapeGet(etape.id, { fields: { id: {} } }, utilisateur)
    if (isNotNullNorUndefined(titreEtape)) {
      utilisateursEmails.push(utilisateur.email)
    }
  }

  if (utilisateursEmails.length) {
    const titreUrl = titreUrlGet(titreId)

    const etapeType = EtapesTypes[etape.typeId]

    await emailsSend(
      utilisateursEmails,
      'Nouvel évenement sur un titre minier.',
      `
  <h3>L’étape « ${etapeType.nom} » vient d’ếtre réalisée sur un titre minier.</h3>
  <hr>
  <b>Lien</b> : <a href="${titreUrl}">${titreUrl}</a> <br>
  `
    )
  }
}
