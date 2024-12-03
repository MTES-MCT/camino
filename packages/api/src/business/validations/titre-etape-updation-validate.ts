import { ITitreEtape, ITitreDemarche, ITitre } from '../../types'

import { titreDemarcheUpdatedEtatValidate } from './titre-demarche-etat-validate'
import { contenuNumbersCheck } from './utils/contenu-numbers-check'
import { contenuDatesCheck } from './utils/contenu-dates-check'
import { canEditAmodiataires, canEditDates, canEditDuree, canEditPerimetre, canEditTitulaires, isEtapeComplete, isEtapeValid } from 'camino-common/src/permissions/titres-etapes'
import { User } from 'camino-common/src/roles'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { EntrepriseDocument, EntrepriseId } from 'camino-common/src/entreprise'
import { ETAPE_IS_NOT_BROUILLON, EtapeAvis, EtapeDocument } from 'camino-common/src/etape'
import { CommuneId } from 'camino-common/src/static/communes'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { flattenContenuToSimpleContenu } from 'camino-common/src/sections'
import { equalGeojson } from 'camino-common/src/perimetre'
import { ApiFlattenEtape } from '../../api/_format/titres-etapes'
import { FirstEtapeDate } from 'camino-common/src/date'

export const titreEtapeUpdationValidate = (
  etape: Pick<Partial<ApiFlattenEtape>, 'id'> & Omit<ApiFlattenEtape, 'id'>,
  titreDemarche: ITitreDemarche,
  titre: Pick<ITitre, 'typeId' | 'demarches'>,
  documents: Pick<EtapeDocument, 'etape_document_type_id'>[],
  etapeAvis: Pick<EtapeAvis, 'avis_type_id'>[],
  entrepriseDocuments: Pick<EntrepriseDocument, 'entreprise_document_type_id' | 'entreprise_id'>[],
  sdomZones: SDOMZoneId[] | null | undefined,
  communes: CommuneId[] | null | undefined,
  user: User,
  firstEtapeDate: FirstEtapeDate,
  titreEtapeOld?: ITitreEtape
): string[] => {
  const errors: string[] = []
  const sections = getSections(titre.typeId, titreDemarche.typeId, etape.typeId)

  if (!etape.duree.heritee) {
    const editDuree = canEditDuree(titre.typeId, titreDemarche.typeId, user)
    if (editDuree.visibility === 'absent' && (etape.duree.value ?? 0) !== (titreEtapeOld?.duree ?? 0)) {
      errors.push(editDuree.message)
    }
  }

  const editDates = canEditDates(titre.typeId, titreDemarche.typeId, etape.typeId, user)
  if (editDates.visibility === 'absent') {
    if (!etape.dateDebut.heritee && (etape.dateDebut.value ?? '') !== (titreEtapeOld?.dateDebut ?? '')) {
      errors.push(editDates.message)
    } else if (!etape.dateFin.heritee && (etape.dateFin.value ?? '') !== (titreEtapeOld?.dateFin ?? '')) {
      errors.push(editDates.message)
    }
  }

  if (!etape.titulaires.heritee) {
    const editTitulaires = canEditTitulaires(titre.typeId, titreDemarche.typeId, user)
    if (editTitulaires.visibility === 'absent' && entreprisesHaveChanged(etape.titulaires.value, titreEtapeOld?.titulaireIds ?? [])) {
      errors.push(editTitulaires.message)
    }
  }

  if (!etape.amodiataires.heritee) {
    const editAmodiataires = canEditAmodiataires(titre.typeId, titreDemarche.typeId, user)
    if (editAmodiataires.visibility === 'absent' && entreprisesHaveChanged(etape.amodiataires.value, titreEtapeOld?.amodiataireIds ?? [])) {
      errors.push(editAmodiataires.message)
    }
  }

  if (!etape.perimetre.heritee) {
    const editPerimetre = canEditPerimetre(titreDemarche.typeId, etape.typeId)
    if (editPerimetre.visibility === 'absent' && !equalGeojson(etape.perimetre.value?.geojson4326Perimetre?.geometry ?? null, titreEtapeOld?.geojson4326Perimetre?.geometry)) {
      errors.push(editPerimetre.message)
    }
  }

  if (sections.length) {
    if (isNotNullNorUndefined(etape.contenu)) {
      const errorsContenu = contenuNumbersCheck(sections, etape.contenu)
      if (isNotNullNorUndefined(errorsContenu)) {
        errors.push(errorsContenu)
      }
    }

    if (isNotNullNorUndefined(etape.contenu)) {
      const errorsContenu = contenuDatesCheck(sections, etape.contenu)
      if (isNotNullNorUndefined(errorsContenu)) {
        errors.push(errorsContenu)
      }
    }

    if (
      etape.typeId !== 'mfr' &&
      isNotNullNorUndefined(etape.contenu.arm?.mecanise) &&
      etape.contenu.arm.mecanise.value === true &&
      !etape.contenu.arm.mecanise.heritee &&
      (isNullOrUndefined(etape.contenu.arm.mecanise.etapeHeritee?.value) || etape.contenu.arm.mecanise.etapeHeritee.value === false)
    ) {
      errors.push('une demande non mécanisée ne peut pas devenir mécanisée')
    }
  }

  const etapeValid = isEtapeValid(etape, titre.typeId, titreDemarche.typeId, titreDemarche.id, firstEtapeDate)
  if (!etapeValid.valid) {
    errors.push(...etapeValid.errors)
  }

  // si l’étape n’est pas en cours de construction
  if (etape.isBrouillon === ETAPE_IS_NOT_BROUILLON) {
    const etapeComplete = isEtapeComplete(etape, titre.typeId, titreDemarche.id, titreDemarche.typeId, documents, entrepriseDocuments, sdomZones, communes ?? [], etapeAvis, user, firstEtapeDate)
    if (!etapeComplete.valid) {
      errors.push(...etapeComplete.errors)
    }
  }

  if (errors.length) {
    return errors
  }

  return titreEtapeUpdationBusinessValidate(etape, titreDemarche, titre, isNotNullNorUndefined(communes) ? communes.map(communeId => ({ id: communeId })) : communes)
}

const titreEtapeUpdationBusinessValidate = (
  titreEtape: Pick<Partial<ApiFlattenEtape>, 'id'> &
    Pick<ApiFlattenEtape, 'statutId' | 'typeId' | 'date' | 'contenu' | 'perimetre' | 'isBrouillon' | 'concurrence' | 'demarcheIdsConsentement' | 'hasTitreFrom'>,
  titreDemarche: ITitreDemarche,
  titre: Pick<ITitre, 'typeId' | 'demarches'>,
  communes: ITitreEtape['communes']
) => {
  const errors = []
  // 1. la date de l'étape est possible
  // en fonction de l'ordre des types d'étapes de la démarche
  const { valid, errors: demarcheUpdatedErrors } = titreDemarcheUpdatedEtatValidate(
    titreDemarche.typeId,
    titre,
    {
      ...titreEtape,
      contenu: flattenContenuToSimpleContenu(titreEtape.contenu),
      surface: titreEtape.perimetre.value?.surface ?? null,
      communes,
    },
    titreDemarche.id,
    titreDemarche.etapes!
  )
  if (!valid) {
    errors.push(...demarcheUpdatedErrors)
  }

  return errors
}

const entreprisesHaveChanged = (newValue: EntrepriseId[], oldValue: EntrepriseId[]): boolean => {
  if (newValue.length !== oldValue.length) {
    return true
  }

  return newValue.some((v, i) => oldValue[i] !== v)
}
