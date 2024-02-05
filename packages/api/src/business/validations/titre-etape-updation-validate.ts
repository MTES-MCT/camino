import { ITitreEtape, ITitreDemarche, ITitre, IDocument, ITitreEntreprise } from '../../types.js'

import { titreDemarcheUpdatedEtatValidate } from './titre-demarche-etat-validate.js'
import { heritageContenuValidate } from './utils/heritage-contenu-validate.js'
import { propsNumbersCheck } from './utils/props-numbers-check.js'
import { contenuNumbersCheck } from './utils/contenu-numbers-check.js'
import { propsDatesCheck } from './utils/props-dates-check.js'
import { contenuDatesCheck } from './utils/contenu-dates-check.js'
import { canEditAmodiataires, canEditDates, canEditDuree, canEditTitulaires, isEtapeComplete } from 'camino-common/src/permissions/titres-etapes.js'
import { User } from 'camino-common/src/roles.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { EntrepriseDocument } from 'camino-common/src/entreprise.js'
const numberProps = ['duree', 'surface'] as unknown as [keyof ITitreEtape]

const dateProps = ['date', 'dateDebut', 'dateFin'] as unknown as [keyof ITitreEtape]

export const titreEtapeUpdationValidate = (
  titreEtape: ITitreEtape,
  titreDemarche: ITitreDemarche,
  titre: ITitre,
  documents: IDocument[] | null | undefined,
  entrepriseDocuments: Pick<EntrepriseDocument, 'entreprise_document_type_id'>[],
  sdomZones: SDOMZoneId[] | null | undefined,
  user: User,
  titreEtapeOld?: ITitreEtape
) => {
  const errors = []

  const sections = getSections(titre.typeId, titreDemarche.typeId, titreEtape.typeId)

  // le champ heritageContenu est cohérent avec les sections
  const errorsHeritageContenu = heritageContenuValidate(sections, titreEtape.heritageContenu)

  errors.push(...errorsHeritageContenu)

  if (!(titreEtape.heritageProps?.duree?.actif ?? false) && !canEditDuree(titre.typeId, titreDemarche.typeId) && (titreEtape.duree ?? 0) !== (titreEtapeOld?.duree ?? 0)) {
    errors.push('impossible d’éditer la durée')
  }

  if (!canEditDates(titre.typeId, titreDemarche.typeId, titreEtape.typeId, user)) {
    if ((titreEtape.dateDebut ?? '') !== (titreEtapeOld?.dateDebut ?? '')) {
      errors.push('impossible d’éditer la date de début')
    }
    if ((titreEtape.dateFin ?? '') !== (titreEtapeOld?.dateFin ?? '')) {
      errors.push('impossible d’éditer la date d’échéance')
    }
  }

  if (titreEtapeOld && !titreEtapeOld.titulaires) {
    throw new Error('les titulaires ne sont pas chargés')
  }
  if (!canEditTitulaires(titre.typeId, user) && entreprisesHaveChanged(titreEtape.titulaires, titreEtapeOld?.titulaires)) {
    errors.push(`une autorisation ${titre.typeId === 'arm' ? 'de recherche' : "d'exploitation"} ne peut pas inclure de titulaires`)
  }

  if (titreEtapeOld && !titreEtapeOld.amodiataires) {
    throw new Error('les amodiataires ne sont pas chargés')
  }

  if (!canEditAmodiataires(titre.typeId, user) && entreprisesHaveChanged(titreEtape.amodiataires, titreEtapeOld?.amodiataires)) {
    errors.push(`une autorisation ${titre.typeId === 'arm' ? 'de recherche' : "d'exploitation"} ne peut pas inclure d'amodiataires`)
  }

  if (sections.length) {
    // 1. les champs number ne peuvent avoir une durée négative
    const errorsNumbers = propsNumbersCheck(numberProps, titreEtape)
    if (errorsNumbers) {
      errors.push(errorsNumbers)
    }

    if (titreEtape.contenu) {
      const errorsContenu = contenuNumbersCheck(sections, titreEtape.contenu)
      if (errorsContenu) {
        errors.push(errorsContenu)
      }
    }

    // 2. les champs date ne peuvent avoir une date invalide
    const errorsDates = propsDatesCheck<ITitreEtape>(dateProps, titreEtape)
    if (errorsDates) {
      errors.push(errorsDates)
    }

    // 3. les champs date des sections ne peuvent avoir une date invalide
    if (titreEtape.contenu) {
      const errorsContenu = contenuDatesCheck(sections, titreEtape.contenu)
      if (errorsContenu) {
        errors.push(errorsContenu)
      }
    }

    if (
      titreEtape.typeId !== 'mfr' &&
      titreEtape.heritageContenu &&
      titreEtape.heritageContenu.arm &&
      titreEtape.heritageContenu.arm.mecanise &&
      !titreEtape.heritageContenu.arm.mecanise.actif &&
      titreEtape.contenu &&
      titreEtape.contenu.arm &&
      titreEtape.contenu.arm.mecanise
    ) {
      errors.push('une demande non mécanisée ne peut pas devenir mécanisée')
    }
  }

  // 4. si l’étape n’est pas en cours de construction
  if (titreEtape.statutId !== 'aco') {
    const etapeComplete = isEtapeComplete(titreEtape, titre.typeId, titreDemarche.typeId, documents, entrepriseDocuments, sdomZones)
    if (!etapeComplete.valid) {
      errors.push(...etapeComplete.errors)
    }
  }

  if (errors.length) {
    return errors
  }

  return titreEtapeUpdationBusinessValidate(titreEtape, titreDemarche, titre)
}

const titreEtapeUpdationBusinessValidate = (titreEtape: ITitreEtape, titreDemarche: ITitreDemarche, titre: ITitre) => {
  const errors = []
  // 1. la date de l'étape est possible
  // en fonction de l'ordre des types d'étapes de la démarche
  const demarcheUpdatedErrors = titreDemarcheUpdatedEtatValidate(titreDemarche.type!, titre, titreEtape, titreDemarche.id, titreDemarche.etapes!)
  if (demarcheUpdatedErrors.length) {
    errors.push(...demarcheUpdatedErrors)
  }

  return errors
}

const entreprisesHaveChanged = (newValue: ITitreEntreprise[] | undefined | null, oldValue: ITitreEntreprise[] | undefined | null): boolean => {
  if (!newValue && !oldValue) {
    return false
  }

  if ((newValue?.length ?? 0) !== (oldValue?.length ?? 0)) {
    return true
  }

  if (!newValue || newValue.length === 0) {
    return false
  }

  return newValue.some((v, i) => oldValue?.[i].id !== v.id || oldValue?.[i].operateur !== v.operateur)
}
