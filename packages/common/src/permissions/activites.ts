import { Activite, ActiviteDocument } from '../activite.js'
import { EntrepriseId } from '../entreprise.js'
import { isAdministration, isAdministrationAdmin, isAdministrationEditeur, isEntreprise, isSuper, User } from '../roles.js'
import { ACTIVITES_STATUTS_IDS, ActivitesStatutId } from '../static/activitesStatuts.js'
import { ActivitesTypesId } from '../static/activitesTypes.js'
import { activitesTypesDocumentsTypes } from '../static/activitesTypesDocumentsTypes.js'
import { Administrations, ADMINISTRATION_TYPE_IDS, ADMINISTRATION_IDS, AdministrationId } from '../static/administrations.js'
import { isAssociee, isGestionnaire } from '../static/administrationsTitresTypes.js'
import { ActiviteDocumentTypeId } from '../static/documentsTypes.js'
import { TitreTypeId } from '../static/titresTypes.js'
import { ElementWithValue } from '../sections.js'
import { isNonEmptyArray, isNullOrUndefined, memoize, NonEmptyArray, SimplePromiseFn } from '../typescript-tools.js'
import { sectionsWithValueCompleteValidate } from './sections.js'

export const canReadActivites = (user: User) =>
  isSuper(user) ||
  isEntreprise(user) ||
  (isAdministration(user) &&
    ([ADMINISTRATION_TYPE_IDS.MINISTERE, ADMINISTRATION_TYPE_IDS.DEAL, ADMINISTRATION_TYPE_IDS.DREAL].includes(Administrations[user.administrationId].typeId) ||
      user.administrationId === ADMINISTRATION_IDS['PRÉFECTURE - GUYANE']))

export const canDeleteActiviteDocument = (activiteDocumentTypeId: ActiviteDocumentTypeId, activiteTypeId: ActivitesTypesId, activiteStatutId: ActivitesStatutId) => {
  const documentType = [...activitesTypesDocumentsTypes[activiteTypeId]].find(({ documentTypeId }) => documentTypeId === activiteDocumentTypeId)
  if (isNullOrUndefined(documentType) || documentType.optionnel) {
    return true
  }

  if ([ACTIVITES_STATUTS_IDS.ABSENT, ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION].includes(activiteStatutId)) {
    return true
  }

  return false
}

export const canReadTitreActivites = async (
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
): Promise<boolean> => {
  if (!canReadActivites(user)) {
    return false
  }
  if (isSuper(user)) {
    return true
  }

  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return (
      isGestionnaire(user.administrationId, await titreTypeId()) || isAssociee(user.administrationId, await titreTypeId()) || (await titresAdministrationsLocales()).includes(user.administrationId)
    )
  }

  if (isEntreprise(user)) {
    const entreprises = await entreprisesTitulairesOuAmodiataires()

    return user.entreprises.map(({ id }) => id).some(entrepriseId => entreprises.includes(entrepriseId))
  }

  return false
}

export const canEditActivite = async (
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  activiteStatutId: ActivitesStatutId
): Promise<boolean> => {
  const typeId = memoize(titreTypeId)
  const administrations = memoize(titresAdministrationsLocales)
  const entreprises = memoize(entreprisesTitulairesOuAmodiataires)

  if (!(await canReadTitreActivites(user, typeId, administrations, entreprises))) {
    return false
  }
  if (isSuper(user)) {
    return true
  }

  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return isGestionnaire(user.administrationId, await typeId()) || (await administrations()).includes(user.administrationId)
  }

  if (isEntreprise(user)) {
    const entrepriseFetched = await entreprises()

    return (
      user.entreprises.map(({ id }) => id).some(entrepriseId => entrepriseFetched.includes(entrepriseId)) &&
      [ACTIVITES_STATUTS_IDS.ABSENT, ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION].includes(activiteStatutId)
    )
  }

  return false
}

/**
 * attention les tests unitaires s'appuient sur les tests de canEditActivite
 * et de isActiviteComplete pour éviter une explosion combinatoire
 */
export const isActiviteDeposable = async (
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  activite: Pick<Activite, 'sections_with_value' | 'activite_statut_id' | 'type_id'>,
  documents: Pick<ActiviteDocument, 'activite_document_type_id'>[]
): Promise<boolean> => {
  if (activite.activite_statut_id !== ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION) {
    return false
  }

  return (
    (await canEditActivite(user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, activite.activite_statut_id)) &&
    isActiviteComplete(activite.sections_with_value, activite.type_id, documents).valid
  )
}

/**
 * attention les tests unitaires s'appuient sur les tests de sectionsWithValueCompleteValidate
 * et de isActiviteDocumentsComplete pour éviter une explosion combinatoire
 */
export const isActiviteComplete = (
  sections_with_value: { nom?: string; elements: Pick<ElementWithValue, 'nom' | 'optionnel' | 'value' | 'type'>[] }[],
  activiteTypeId: ActivitesTypesId,
  documents: Pick<ActiviteDocument, 'activite_document_type_id'>[]
): { valid: true } | { valid: false; errors: NonEmptyArray<string> } => {
  const errors: string[] = []
  // les éléments non optionnel des sections sont renseignés
  if (sections_with_value.length) {
    errors.push(...sectionsWithValueCompleteValidate(sections_with_value))
  }

  const documentsErrors = isActiviteDocumentsComplete(documents ?? [], activiteTypeId)
  if (!documentsErrors.valid) {
    errors.push(...documentsErrors.errors)
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const isActiviteDocumentsComplete = (
  activiteDocuments: Pick<ActiviteDocument, 'activite_document_type_id'>[],
  activiteTypeId: ActivitesTypesId
): { valid: true } | { valid: false; errors: string[] } => {
  const errors = [] as string[]
  const documentsTypes = [...activitesTypesDocumentsTypes[activiteTypeId]]

  if (activiteDocuments.length > 0 && documentsTypes.length === 0) {
    errors.push(`impossible de lier un document`)
  } else {
    documentsTypes
      .filter(dt => !dt.optionnel)
      .forEach(dt => {
        if (!activiteDocuments?.find(d => d.activite_document_type_id === dt.documentTypeId)) {
          errors.push(`le document "${dt.documentTypeId}" est obligatoire`)
        }
      })
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}
