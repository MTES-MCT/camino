import { IContenu, IContenuValeur, ITitreActivite, IUtilisateur } from '../../../types.js'

import { emailsSend } from '../../../tools/api-mailjet/emails.js'
import { titreUrlGet } from '../../../business/utils/urls-get.js'
import { UserNotNull } from 'camino-common/src/roles.js'
import { getPeriode } from 'camino-common/src/static/frequence.js'
import { AdministrationId, Administrations } from 'camino-common/src/static/administrations.js'
import { dateFormat } from 'camino-common/src/date.js'
import { getElementValeurs, Section, SectionElement } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly, NonEmptyArray } from 'camino-common/src/typescript-tools.js'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes.js'
import { GetActiviteTypeEmailsByAdministrationIds, getActiviteTypeEmailsByAdministrationIds } from '../../rest/administrations.queries.js'
import { Pool } from 'pg'

const elementHtmlBuild = (sectionId: string, element: DeepReadonly<SectionElement>, contenu: IContenu) =>
  contenu[sectionId] && ((contenu[sectionId][element.id] as IContenuValeur) || (contenu[sectionId][element.id] as IContenuValeur) === 0 || (contenu[sectionId][element.id] as IContenuValeur) === false)
    ? `<li><strong>${element.nom ? element.nom + ' : ' : ''}</strong>${
        element.type === 'select'
          ? (contenu[sectionId][element.id] as string[])
              .reduce((valeurs: string[], id) => {
                const valeur = getElementValeurs(element).find(v => v.id === id)

                if (valeur?.nom) {
                  valeurs.push(valeur.nom)
                }

                return valeurs
              }, [])
              .join(', ')
          : contenu[sectionId][element.id]
      } <br><small>${element.description ?? ''}</small></li>`
    : `<li>–</li>`

const elementsHtmlBuild = (sectionId: string, elements: DeepReadonly<SectionElement[]>, contenu: IContenu) =>
  elements
    ? elements.reduce(
        (html, element) => `
${html}

${elementHtmlBuild(sectionId, element, contenu)}
`,
        ''
      )
    : ''

const sectionHtmlBuild = ({ id, nom, elements }: DeepReadonly<Section>, contenu: IContenu) => {
  const sectionNomHtml = nom ? `<h2>${nom}</h2>` : ''

  const listHtml = elements
    ? `<ul>
  ${elementsHtmlBuild(id, elements, contenu)}
</ul>`
    : ''

  return `
${sectionNomHtml}
${listHtml}
    `
}

const titreActiviteEmailFormat = ({ contenu, titreId, dateSaisie, sections }: ITitreActivite, emailTitle: string, user: UserNotNull) => {
  const titreUrl = titreUrlGet(titreId)

  const header = `
<h1>${emailTitle}</h1>

<hr>

<b>Lien</b> : ${titreUrl} <br>
<b>Rempli par</b> : ${user.prenom} ${user.nom} (${user.email}) <br>
<b>Date de dépôt</b> : ${dateSaisie ? dateFormat(dateSaisie) : ''} <br>

<hr>
`

  const body =
    sections && contenu
      ? sections.reduce(
          (res, section) => `
${res}

${sectionHtmlBuild(section, contenu)}
`,
          ''
        )
      : ''

  return `
${header}
${body}
`
}

const titreActiviteEmailTitleFormat = (activite: ITitreActivite, titreNom: string): string => {
  const activiteType = ActivitesTypes[activite.typeId]

  return `${titreNom} | ${activiteType.nom}, ${getPeriode(activiteType.frequenceId, activite.periodeId)} ${activite.annee}`
}

const titreActiviteUtilisateursEmailsGet = (utilisateurs: IUtilisateur[] | undefined | null): string[] => {
  return utilisateurs?.filter(u => !!u.email).map(u => u.email!) || []
}

export const productionCheck = (activiteTypeId: string, contenu: IContenu | null | undefined): boolean => {
  if (activiteTypeId === 'grx' || activiteTypeId === 'gra') {
    if (contenu?.substancesFiscales) {
      return Object.keys(contenu.substancesFiscales).some(key => !!contenu.substancesFiscales[key])
    }

    return false
  } else if (activiteTypeId === 'grp') {
    return !!contenu?.renseignements?.orExtrait
  } else if (activiteTypeId === 'wrp') {
    const production = contenu?.renseignementsProduction

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
  if (!administrationIds || !administrationIds.length) {
    return []
  }

  const activitesTypesEmailsByAdministrationId = (administrationsActivitesTypesEmails ?? []).reduce<Record<AdministrationId, GetActiviteTypeEmailsByAdministrationIds[]>>(
    (acc, a) => {
      if (!acc[a.administration_id]) {
        acc[a.administration_id] = []
      }

      acc[a.administration_id].push(a)

      return acc
    },
    {} as Record<AdministrationId, GetActiviteTypeEmailsByAdministrationIds[]>
  )

  // Si production > 0, envoyer à toutes les administrations liées au titre
  // sinon envoyer seulement aux minitères et aux DREAL
  const production = productionCheck(activiteTypeId, contenu)

  return (
    administrationIds
      .map(id => Administrations[id])
      .filter(administration => production || ['min', 'dre', 'dea'].includes(administration.typeId))
      .filter(administration => Object.keys(activitesTypesEmailsByAdministrationId).includes(administration.id))
      .flatMap(administration => activitesTypesEmailsByAdministrationId[administration.id])
      .filter(activiteTypeEmail => activiteTypeEmail.activite_type_id === activiteTypeId)
      .filter(activiteTypeEmail => activiteTypeEmail.email)
      .map(activiteTypeEmail => activiteTypeEmail.email) || []
  )
}

export const titreActiviteEmailsSend = async (
  activite: ITitreActivite,
  titreNom: string,
  user: UserNotNull,
  utilisateurs: IUtilisateur[] | undefined | null,
  administrationIds: NonEmptyArray<AdministrationId>,
  pool: Pool
) => {
  const emails = titreActiviteUtilisateursEmailsGet(utilisateurs)

  const administrationsActivitesTypesEmails = await getActiviteTypeEmailsByAdministrationIds(pool, administrationIds)
  emails.push(...titreActiviteAdministrationsEmailsGet(administrationIds, administrationsActivitesTypesEmails, activite.typeId, activite.contenu))
  if (!emails.length) {
    return
  }
  const subject = titreActiviteEmailTitleFormat(activite, titreNom)
  const content = titreActiviteEmailFormat(activite, subject, user)

  await emailsSend(emails, subject, content)
}
