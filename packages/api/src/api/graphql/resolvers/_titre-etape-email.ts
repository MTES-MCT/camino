import { ITitreEtape, formatUser } from '../../../types.js'

import { emailsSend } from '../../../tools/api-mailjet/emails.js'
import { titreEtapeGet } from '../../../database/queries/titres-etapes.js'
import { utilisateursTitresGet } from '../../../database/queries/utilisateurs.js'
import { titreUrlGet } from '../../../business/utils/urls-get.js'
import { EmailAdministration } from '../../../tools/api-mailjet/types.js'
import { UserNotNull } from 'camino-common/src/roles.js'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes.js'

const emailForAdministrationContentFormat = (titreTypeId: string, etapeNom: string, titreId: string, user: UserNotNull) => {
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
  etape: Pick<ITitreEtape, 'typeId' | 'statutId'> | undefined,
  demarcheTypeId: string,
  titreId: string,
  titreTypeId: string,
  user: UserNotNull,
  oldEtape?: Pick<ITitreEtape, 'statutId'>
): { subject: string; content: string; emails: string[] } | null => {
  if (!etape) {
    return null
  }
  const emails = [] as string[]
  let title = ''

  if (demarcheTypeId === 'oct' && titreTypeId === 'arm') {
    // lorsque la demande est déposée
    if (etapeStatusUpdated(etape, 'mdp', 'fai', oldEtape)) {
      emails.push(EmailAdministration.PTMG)
      emails.push(EmailAdministration.ONF)

      title = 'Nouvelle demande déposée'

      // lorsque le PTMG déclare le dossier complet
    } else if (etapeStatusUpdated(etape, 'mcp', 'com', oldEtape)) {
      emails.push(EmailAdministration.ONF)

      title = 'Nouveau dossier complet'

      // lorsque la demande est complète
    } else if (etapeStatusUpdated(etape, 'mcr', 'fav', oldEtape)) {
      emails.push(EmailAdministration.DGTM)

      title = 'Nouvelle demande complète'
    }
  } else if (demarcheTypeId === 'oct' && titreTypeId === 'axm') {
    if (etapeStatusUpdated(etape, 'mfr', 'fai', oldEtape)) {
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

export const titreEtapeAdministrationsEmailsSend = async (etape: ITitreEtape, demarcheTypeId: string, titreId: string, titreTypeId: string, user: UserNotNull, oldEtape?: ITitreEtape) => {
  const emailsForAdministrations = emailsForAdministrationsGet(etape, demarcheTypeId, titreId, titreTypeId, user, oldEtape)

  if (emailsForAdministrations) {
    await emailsSend(emailsForAdministrations.emails, emailsForAdministrations.subject, emailsForAdministrations.content)
  }
}

export const titreEtapeUtilisateursEmailsSend = async (etape: ITitreEtape, titreId: string) => {
  const utilisateursEmails = [] as string[]

  const utilisateursTitres = await utilisateursTitresGet(titreId, {
    fields: { utilisateur: { id: {}, entreprises: { id: {} } } },
  })

  const utilisateurs = utilisateursTitres?.map(utilisateurTitre => utilisateurTitre.utilisateur).filter(utilisateur => !!utilisateur && !!utilisateur.email)

  for (const utilisateur of utilisateurs) {
    if (utilisateur) {
      const user = formatUser(utilisateur)
      // On vérifie que l’utilisateur puisse voir l’étape
      const titreEtape = await titreEtapeGet(etape.id, { fields: { id: {} } }, user)
      if (titreEtape) {
        utilisateursEmails.push(user.email)
      }
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
