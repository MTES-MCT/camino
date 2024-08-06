import { IContenu, ITitreActivite } from '../../../types'

import { emailsWithTemplateSend } from '../../../tools/api-mailjet/emails'
import { activiteUrlGet } from '../../../business/utils/urls-get'
import { UserNotNull } from 'camino-common/src/roles'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ADMINISTRATION_TYPE_IDS, AdministrationId, Administrations } from 'camino-common/src/static/administrations'
import { dateFormat } from 'camino-common/src/date'
import { NonEmptyArray, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { GetActiviteTypeEmailsByAdministrationIds, getActiviteTypeEmailsByAdministrationIds } from '../../rest/administrations.queries'
import { Pool } from 'pg'
import { EmailTemplateId } from '../../../tools/api-mailjet/types'

const titreActiviteEmailTitleFormat = (activite: ITitreActivite, titreNom: string): string => {
  const activiteType = ActivitesTypes[activite.typeId]

  return `${titreNom} | ${activiteType.nom}, ${getPeriode(activiteType.frequenceId, activite.periodeId)} ${activite.annee}`
}

export const productionCheck = (activiteTypeId: string, contenu: IContenu | null | undefined): boolean => {
  if (activiteTypeId === 'grx' || activiteTypeId === 'gra') {
    if (contenu?.substancesFiscales) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      return Object.keys(contenu.substancesFiscales).some(key => !!contenu.substancesFiscales[key])
    }

    return false
  } else if (activiteTypeId === 'grp') {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return !!contenu?.renseignements?.orExtrait
  } else if (activiteTypeId === 'wrp') {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const production = contenu?.renseignementsProduction

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return !!production?.volumeGranulatsExtrait
  }

  return true
}

export const titreActiviteAdministrationsEmailsGet = (
  administrationIds: AdministrationId[],
  administrationsActivitesTypesEmails: GetActiviteTypeEmailsByAdministrationIds[] | null | undefined,
  activiteTypeId: string,
  contenu: IContenu | null | undefined
): string[] => {
  if (isNullOrUndefinedOrEmpty(administrationIds)) {
    return []
  }

  const activitesTypesEmailsByAdministrationId = (administrationsActivitesTypesEmails ?? []).reduce<{ [key in AdministrationId]?: GetActiviteTypeEmailsByAdministrationIds[] }>((acc, a) => {
    const value = acc[a.administration_id]
    if (isNullOrUndefined(value)) {
      acc[a.administration_id] = [a]
    } else {
      value.push(a)
    }

    return acc
  }, {})

  // Si production > 0, envoyer à toutes les administrations liées au titre
  // sinon envoyer seulement aux minitères et aux DREAL
  const production = productionCheck(activiteTypeId, contenu)

  return (
    administrationIds
      .map(id => Administrations[id])
      .filter(administration => production || [ADMINISTRATION_TYPE_IDS.MINISTERE, ADMINISTRATION_TYPE_IDS.DREAL].includes(administration.typeId))
      .filter(administration => Object.keys(activitesTypesEmailsByAdministrationId).includes(administration.id))
      .flatMap(administration => activitesTypesEmailsByAdministrationId[administration.id])
      .filter(activiteTypeEmail => activiteTypeEmail?.activite_type_id === activiteTypeId)
      .map(activiteTypeEmail => activiteTypeEmail?.email)
      .filter(isNotNullNorUndefinedNorEmpty) ?? []
  )
}

export const titreActiviteEmailsSend = async (
  activite: ITitreActivite,
  titreNom: string,
  user: UserNotNull,
  utilisateurEmails: string[],
  administrationIds: NonEmptyArray<AdministrationId>,
  pool: Pool
): Promise<void> => {
  const emails = [...utilisateurEmails]
  const administrationsActivitesTypesEmails = await getActiviteTypeEmailsByAdministrationIds(pool, administrationIds)
  emails.push(...titreActiviteAdministrationsEmailsGet(administrationIds, administrationsActivitesTypesEmails, activite.typeId, activite.contenu))
  if (!emails.length) {
    return
  }
  const subject = titreActiviteEmailTitleFormat(activite, titreNom)

  await emailsWithTemplateSend([...emails], EmailTemplateId.ACTIVITES_DECLARATION, {
    emailObject: subject,
    activiteUser: `${user.nom} ${user.prenom}`,
    activiteDateUpdated: dateFormat(activite.dateSaisie),
    activiteUrl: activiteUrlGet(activite.id),
  })
}
