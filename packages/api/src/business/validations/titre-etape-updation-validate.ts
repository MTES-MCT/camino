import {
  ITitreEtape,
  ITitreDemarche,
  ITitre,
  ISection,
  IDocument,
  IContenu,
  ITitreEntreprise
} from '../../types.js'

import { titreEtapePointsValidate } from './titre-etape-points-validate.js'
import { titreDemarcheUpdatedEtatValidate } from './titre-demarche-etat-validate.js'
import { heritageContenuValidate } from './utils/heritage-contenu-validate.js'
import { propsNumbersCheck } from './utils/props-numbers-check.js'
import { contenuNumbersCheck } from './utils/contenu-numbers-check.js'
import { propsDatesCheck } from './utils/props-dates-check.js'
import { contenuDatesCheck } from './utils/contenu-dates-check.js'
import { documentsTypesValidate } from './documents-types-validate.js'
import { documentTypeIdsBySdomZonesGet } from '../../api/graphql/resolvers/_titre-etape.js'
import { objectClone } from '../../tools/index.js'
import {
  canEditAmodiataires,
  canEditDates,
  canEditDuree,
  canEditTitulaires,
  dureeOptionalCheck
} from 'camino-common/src/permissions/titres-etapes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import {
  DocumentType,
  DocumentsTypes
} from 'camino-common/src/static/documentsTypes.js'
import { User } from 'camino-common/src/roles.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
const numberProps = ['duree', 'surface'] as unknown as [keyof ITitreEtape]

const dateProps = ['date', 'dateDebut', 'dateFin'] as unknown as [
  keyof ITitreEtape
]

export const titreEtapeUpdationValidate = (
  titreEtape: ITitreEtape,
  titreDemarche: ITitreDemarche,
  titre: ITitre,
  sections: ISection[],
  documentsTypes: DocumentType[],
  documents: IDocument[] | null | undefined,
  justificatifsTypes: DocumentType[],
  justificatifs: IDocument[] | null | undefined,
  sdomZones: SDOMZoneId[] | null | undefined,
  user: User,
  titreEtapeOld?: ITitreEtape
) => {
  const errors = []

  // le champ heritageContenu est cohérent avec les sections
  const errorsHeritageContenu = heritageContenuValidate(
    sections,
    titreEtape.heritageContenu
  )

  errors.push(...errorsHeritageContenu)

  if (
    !(titreEtape.heritageProps?.duree?.actif ?? false) &&
    !canEditDuree(titre.typeId, titreDemarche.typeId) &&
    (titreEtape.duree ?? 0) !== (titreEtapeOld?.duree ?? 0)
  ) {
    errors.push('impossible d’éditer la durée')
  }

  if (
    !canEditDates(titre.typeId, titreDemarche.typeId, titreEtape.typeId, user)
  ) {
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
  if (
    !canEditTitulaires(titre.typeId, user) &&
    entreprisesHaveChanged(titreEtape.titulaires, titreEtapeOld?.titulaires)
  ) {
    errors.push(
      `une autorisation ${
        titre.typeId === 'arm' ? 'de recherche' : "d'exploitation"
      } ne peut pas inclure de titulaires`
    )
  }

  if (titreEtapeOld && !titreEtapeOld.amodiataires) {
    throw new Error('les amodiataires ne sont pas chargés')
  }

  if (
    !canEditAmodiataires(titre.typeId, user) &&
    entreprisesHaveChanged(titreEtape.amodiataires, titreEtapeOld?.amodiataires)
  ) {
    errors.push(
      `une autorisation ${
        titre.typeId === 'arm' ? 'de recherche' : "d'exploitation"
      } ne peut pas inclure d'amodiataires`
    )
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
    errors.push(
      ...titreEtapeCompleteValidate(
        titreEtape,
        titre.typeId,
        titreDemarche.typeId,
        sections,
        documentsTypes,
        documents,
        justificatifsTypes,
        justificatifs,
        sdomZones
      )
    )
  }

  if (errors.length) {
    return errors
  }

  return titreEtapeUpdationBusinessValidate(titreEtape, titreDemarche, titre)
}

export const titreEtapeCompleteValidate = (
  titreEtape: ITitreEtape,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  sections: ISection[],
  documentsTypes: DocumentType[],
  documents: IDocument[] | null | undefined,
  justificatifsTypes: DocumentType[],
  justificatifs: IDocument[] | null | undefined,
  sdomZones: SDOMZoneId[] | null | undefined
) => {
  const errors = [] as string[]
  // les éléments non optionnel des sections sont renseignés
  if (sections.length) {
    errors.push(...contenuCompleteValidate(sections, titreEtape.contenu))
  }

  // les décisions annexes sont complètes
  if (titreEtape.decisionsAnnexesSections) {
    errors.push(
      ...contenuCompleteValidate(
        titreEtape.decisionsAnnexesSections,
        titreEtape.decisionsAnnexesContenu
      )
    )
  }

  const dts = (objectClone(documentsTypes) || []) as DocumentType[]
  if (sdomZones?.length) {
    // Ajoute les documents obligatoires en fonction des zones du SDOM
    const documentTypeIds = documentTypeIdsBySdomZonesGet(
      sdomZones,
      titreTypeId,
      demarcheTypeId,
      titreEtape.typeId
    )

    documentTypeIds?.forEach(dtId =>
      dts.push({ id: dtId, nom: DocumentsTypes[dtId].nom, optionnel: false })
    )
  }

  // les fichiers obligatoires sont tous renseignés et complets
  if (dts!.length) {
    // ajoute des documents obligatoires pour les arm mécanisées
    if (titreTypeId === 'arm' && titreEtape.contenu && titreEtape.contenu.arm) {
      dts
        .filter(dt => ['doe', 'dep'].includes(dt.id))
        .forEach(dt => (dt.optionnel = !titreEtape.contenu?.arm.mecanise))
    }
    const documentsErrors = documentsTypesValidate(documents, dts)
    if (documentsErrors.length) {
      errors.push(...documentsErrors)
    }
  }

  // les justificatifs obligatoires sont tous présents
  const justificatifsTypesIds = [] as string[]
  if (justificatifs?.length) {
    for (const justificatif of justificatifs) {
      if (
        !justificatifsTypes.map(({ id }) => id).includes(justificatif!.typeId)
      ) {
        errors.push(
          `impossible de lier un justificatif de type ${justificatif!.typeId}`
        )
      }
      justificatifsTypesIds.push(justificatif!.typeId)
    }
  }
  justificatifsTypes
    .filter(({ optionnel }) => !optionnel)
    .forEach(jt => {
      if (!justificatifsTypesIds.includes(jt.id)) {
        errors.push(`un justificatif obligatoire est manquant`)
      }
    })

  // Si c’est une demande d’AEX ou d’ARM, certaines informations sont obligatoires
  if (titreEtape.typeId === 'mfr' && ['arm', 'axm'].includes(titreTypeId)) {
    // le périmètre doit être défini
    if (!titreEtape.points) {
      errors.push('le périmètre doit être renseigné')
    } else if (titreEtape.points.length < 4) {
      errors.push('le périmètre doit comporter au moins 4 points')
    }

    // il doit exister au moins une substance
    if (
      !titreEtape.substances ||
      !titreEtape.substances.length ||
      !titreEtape.substances.some(substanceId => !!substanceId)
    ) {
      errors.push('au moins une substance doit être renseignée')
    }
  }

  if (
    !titreEtape.duree &&
    !dureeOptionalCheck(titreEtape.typeId, demarcheTypeId, titreTypeId)
  ) {
    errors.push('la durée doit être renseignée')
  }

  return errors
}

const titreEtapeUpdationBusinessValidate = (
  titreEtape: ITitreEtape,
  titreDemarche: ITitreDemarche,
  titre: ITitre
) => {
  const errors = []
  // 1. la date de l'étape est possible
  // en fonction de l'ordre des types d'étapes de la démarche
  const demarcheUpdatedErrors = titreDemarcheUpdatedEtatValidate(
    titreDemarche.type!,
    titre,
    titreEtape,
    titreDemarche.id,
    titreDemarche.etapes!
  )
  if (demarcheUpdatedErrors.length) {
    errors.push(...demarcheUpdatedErrors)
  }

  // 2. les références de points sont bien renseignées
  if (titreEtape.points) {
    const error = titreEtapePointsValidate(titreEtape.points)
    if (error) {
      errors.push(error)
    }
  }

  return errors
}

const contenuCompleteValidate = (
  sections: ISection[],
  contenu: IContenu | null | undefined
): string[] => {
  const errors: string[] = []
  sections.forEach(s =>
    s.elements?.forEach(e => {
      if (!e.optionnel && !['radio', 'checkbox'].includes(e.type)) {
        if (
          !contenu ||
          !contenu[s.id] ||
          contenu[s.id][e.id] === undefined ||
          contenu[s.id][e.id] === null ||
          contenu[s.id][e.id] === ''
        ) {
          errors.push(
            `l’élément "${e.nom}" de la section "${s.nom}" est obligatoire`
          )
        } else if (e.type === 'multiple') {
          const values = contenu[s.id][e.id] as []
          if (!values?.length) {
            errors.push(
              `l’élément "${e.nom}" de la section "${s.nom}" est obligatoire`
            )
          } else {
            e.elements?.forEach(prop => {
              if (!prop.optionnel) {
                values.forEach(v => {
                  if (
                    !v[prop.id] ||
                    v[prop.id] === undefined ||
                    v[prop.id] === null
                  ) {
                    errors.push(
                      `le champ "${prop.id}" de l’élément "${e.nom}" de la section "${s.nom}" est obligatoire`
                    )
                  }
                })
              }
            })
          }
        }
      }
    })
  )

  return errors
}

const entreprisesHaveChanged = (
  newValue: ITitreEntreprise[] | undefined | null,
  oldValue: ITitreEntreprise[] | undefined | null
): boolean => {
  if (!newValue && !oldValue) {
    return false
  }

  if ((newValue?.length ?? 0) !== (oldValue?.length ?? 0)) {
    return true
  }

  if (!newValue || newValue.length === 0) {
    return false
  }

  return newValue.some(
    (v, i) =>
      oldValue?.[i].id !== v.id || oldValue?.[i].operateur !== v.operateur
  )
}
