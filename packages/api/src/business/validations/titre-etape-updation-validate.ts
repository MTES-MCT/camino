import { ITitreEtape, ITitreDemarche, ITitre } from '../../types'

import { titreDemarcheUpdatedEtatValidate } from './titre-demarche-etat-validate'
import { contenuNumbersCheck } from './utils/contenu-numbers-check'
import { contenuDatesCheck } from './utils/contenu-dates-check'
import { canEditAmodiataires, canEditDates, canEditDuree, canEditTitulaires, isEtapeComplete } from 'camino-common/src/permissions/titres-etapes'
import { User } from 'camino-common/src/roles'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { EntrepriseDocument, EntrepriseId } from 'camino-common/src/entreprise'
import { ETAPE_IS_NOT_BROUILLON, EtapeAvis, EtapeDocument, GetEtapeDocumentsByEtapeIdAslDocument, GetEtapeDocumentsByEtapeIdDaeDocument } from 'camino-common/src/etape'
import { CommuneId } from 'camino-common/src/static/communes'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { FlattenEtape } from 'camino-common/src/etape-form'
import { flattenContenuToSimpleContenu } from 'camino-common/src/sections'

export const titreEtapeUpdationValidate = (
  etape: Pick<Partial<FlattenEtape>, 'id'> & Omit<FlattenEtape, 'id'>,
  titreDemarche: ITitreDemarche,
  titre: Pick<ITitre, 'typeId' | 'demarches'>,
  documents: Pick<EtapeDocument, 'etape_document_type_id'>[],
  etapeAvis: Pick<EtapeAvis, 'avis_type_id'>[],
  entrepriseDocuments: Pick<EntrepriseDocument, 'entreprise_document_type_id' | 'entreprise_id'>[],
  sdomZones: DeepReadonly<SDOMZoneId[]> | null | undefined,
  communes: CommuneId[] | null | undefined,
  user: User,
  daeDocument: Omit<GetEtapeDocumentsByEtapeIdDaeDocument, 'id'> | null,
  aslDocument: Omit<GetEtapeDocumentsByEtapeIdAslDocument, 'id'> | null,
  titreEtapeOld?: ITitreEtape
) => {
  const errors: string[] = []
  const sections = getSections(titre.typeId, titreDemarche.typeId, etape.typeId)

  if (!etape.duree.heritee && !canEditDuree(titre.typeId, titreDemarche.typeId) && (etape.duree.value ?? 0) !== (titreEtapeOld?.duree ?? 0)) {
    errors.push('impossible d’éditer la durée')
  }

  if (!canEditDates(titre.typeId, titreDemarche.typeId, etape.typeId, user)) {
    if (!etape.dateDebut.heritee && (etape.dateDebut.value ?? '') !== (titreEtapeOld?.dateDebut ?? '')) {
      errors.push('impossible d’éditer la date de début')
    }
    if (!etape.dateFin.heritee && (etape.dateFin.value ?? '') !== (titreEtapeOld?.dateFin ?? '')) {
      errors.push('impossible d’éditer la date d’échéance')
    }
  }

  if (!etape.titulaires.heritee && !canEditTitulaires(titre.typeId, user) && entreprisesHaveChanged(etape.titulaires.value ?? [], titreEtapeOld?.titulaireIds ?? [])) {
    errors.push("impossible d'éditer les titulaires")
  }

  if (!etape.amodiataires.heritee && !canEditAmodiataires(titre.typeId, user) && entreprisesHaveChanged(etape.amodiataires.value ?? [], titreEtapeOld?.amodiataireIds ?? [])) {
    errors.push(`une autorisation ${titre.typeId === 'arm' ? 'de recherche' : "d'exploitation"} ne peut pas inclure d'amodiataires`)
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

  // 4. si l’étape n’est pas en cours de construction
  if (etape.isBrouillon === ETAPE_IS_NOT_BROUILLON) {
    const etapeComplete = isEtapeComplete(etape, titre.typeId, titreDemarche.typeId, documents, entrepriseDocuments, sdomZones, communes ?? [], daeDocument, aslDocument, etapeAvis, user)
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
  titreEtape: Pick<Partial<FlattenEtape>, 'id'> & Pick<FlattenEtape, 'statutId' | 'typeId' | 'date' | 'contenu' | 'perimetre' | 'isBrouillon'>,
  titreDemarche: ITitreDemarche,
  titre: Pick<ITitre, 'typeId' | 'demarches'>,
  communes: ITitreEtape['communes']
) => {
  const errors = []
  // 1. la date de l'étape est possible
  // en fonction de l'ordre des types d'étapes de la démarche
  const demarcheUpdatedErrors = titreDemarcheUpdatedEtatValidate(
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
  if (demarcheUpdatedErrors.length) {
    errors.push(...demarcheUpdatedErrors)
  }

  return errors
}

const entreprisesHaveChanged = (newValue: EntrepriseId[], oldValue: EntrepriseId[]): boolean => {
  if (newValue.length !== oldValue.length) {
    return true
  }

  return newValue.some((v, i) => oldValue?.[i] !== v)
}
