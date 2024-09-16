import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getDomaineId, TITRES_TYPES_IDS, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getEtapesTDE } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index'
import { ITitreEtape, ITitreDemarche } from '../../types'
import { machineFind } from '../rules-demarches/definitions'
import { titreEtapeForMachineValidator, toMachineEtapes } from '../rules-demarches/machine-common'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'
import { titreInModificationEnInstance } from './titre-statut-id-find'
import { ETAPES_STATUTS, isEtapeStatusRejete } from 'camino-common/src/static/etapesStatuts'
const titreDemarchePublicLectureFind = (
  publicLecture: boolean,
  demarcheTypeId: DemarcheTypeId,
  demarcheTypeEtapesTypes: readonly EtapeTypeId[],
  titreEtape: Pick<ITitreEtape, 'typeId' | 'statutId'>,
  demarche: Pick<ITitreDemarche, 'demarcheDateFin' | 'demarcheDateDebut'>,
  titreTypeId?: TitreTypeId
) => {
  // si le type de démarche est retrait de la demande ou déchéance
  // et que le type d'étape est saisine du préfet
  // alors la démarche est publique
  if ([DEMARCHES_TYPES_IDS.Retrait, DEMARCHES_TYPES_IDS.Decheance].includes(demarcheTypeId) && titreEtape.typeId === ETAPES_TYPES.saisineDuPrefet) {
    return true
  }

  // si le type d'étape est un classement sans suite
  // et le type de titre n'est ni ARM ni AXM
  // alors la démarche n'est pas publique
  if (
    titreEtape.typeId === ETAPES_TYPES.classementSansSuite &&
    (!titreTypeId || ![TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX].includes(titreTypeId))
  ) {
    return false
  }

  // si le type d'étape est recevabilité de la demande
  // et que le type de titre n'est pas ARM
  // et que la démarche ne peut contenir de mise en concurrence au JORF ou JOUE
  // alors la démarche est publique
  if (
    titreEtape.typeId === ETAPES_TYPES.recevabiliteDeLaDemande &&
    (!titreTypeId || titreTypeId !== TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX) &&
    !demarcheTypeEtapesTypes.find(et => [ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF, 'ane'].includes(et))
  ) {
    return true
  }

  // si le type d'étape est mise en concurrence au JORF ou JOUE
  // alors la démarche est publique
  if ([ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF, 'ane'].includes(titreEtape.typeId)) {
    return true
  }

  // si le type d'étape est participation du public
  // alors la démarche est publique
  if (titreEtape.typeId === ETAPES_TYPES.participationDuPublic) {
    return true
  }

  // si le type d'étape est publication de l'avis de décision implicite
  // alors la démarche est publique
  if (titreEtape.typeId === ETAPES_TYPES.publicationDeLavisDeDecisionImplicite) {
    return true
  }

  // si le type de titre est ARM
  // et que le type d'étape est saisine de la commission des ARM
  //    ou avis de la commission des ARM (si pas de saisine)
  //    ou décision de l'ONF (étape historique)
  // alors la démarche est publique
  if (
    titreTypeId === TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX &&
    [
      ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
      ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
      ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    ].includes(titreEtape.typeId)
  ) {
    return true
  }

  // si le type de titre est ARM ou AXM
  // et que le type d'étape est désistement du demandeur
  // alors la démarche est publique
  if (
    titreTypeId &&
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX].includes(titreTypeId) &&
    titreEtape.typeId === ETAPES_TYPES.desistementDuDemandeur
  ) {
    return true
  }

  // si le type d'étape est décision implicite
  //    ou décision de l'administration
  // et que le statut est rejeté
  if ([ETAPES_TYPES.decisionImplicite, ETAPES_TYPES.decisionDeLadministration].includes(titreEtape.typeId) && isEtapeStatusRejete(titreEtape.statutId)) {
    //   si le type de titre est AXM
    //   alors la démarche est publique
    //   sinon la démarche n'est pas (plus) publique
    return titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
  }

  // si le type d'étape est décision implicite
  //    ou décision de l'administration
  //    ou publication au JORF
  // et que le statut est accepté
  // alors la démarche est publique
  if (
    [ETAPES_TYPES.decisionImplicite, ETAPES_TYPES.decisionDeLadministration, ETAPES_TYPES.publicationDeDecisionAuJORF].includes(titreEtape.typeId) &&
    titreEtape.statutId === ETAPES_STATUTS.ACCEPTE
  ) {
    return true
  }

  // si le type d'étape est publication de décision unilatérale au JORF
  //    ou décision unilatérale de l'administration
  //    ou publication de décision au recueil des actes administratifs
  // alors la démarche est publique
  if (['dup', ETAPES_TYPES.decisionAdministrative, ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs].includes(titreEtape.typeId)) {
    return true
  }

  // si le type de titre est ARM
  // et que le type d'étape est signature de l'autorisation de recherche minière
  //    ou signature de l'avenant à l'autorisation de recherche minière
  // alors la démarche est publique
  if (
    titreTypeId === TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX &&
    [ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere, ETAPES_TYPES.avenantALautorisationDeRechercheMiniere].includes(titreEtape.typeId)
  ) {
    return true
  }

  //  - le type de l’étape est annulation de la décision (and)
  //  - et si le statut est favorable
  if (titreEtape.typeId === ETAPES_TYPES.decisionDuJugeAdministratif && titreEtape.statutId === ETAPES_STATUTS.FAVORABLE) {
    //  - alors, la démarche est publique
    return true
  }

  // Si le type de titre est ARM et que le type de démarche est renonciation
  // et que l’expertise de l’onf est cours (recevabilité de la demande faite), ou si la démarche a été désistée ou si classée sans suite
  if (
    titreTypeId === TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX &&
    [DEMARCHES_TYPES_IDS.Renonciation, DEMARCHES_TYPES_IDS.Prolongation].includes(demarcheTypeId) &&
    [ETAPES_TYPES.recevabiliteDeLaDemande, ETAPES_TYPES.classementSansSuite, ETAPES_TYPES.desistementDuDemandeur].includes(titreEtape.typeId)
  ) {
    return true
  }

  // public pour tous des titres non énergétiques M, W, C avec une des étapes suivantes :
  // avis de concurrence au JOUE (ane)
  // avis de concurrence au JORF (anf)
  // décision de l'administration (dex)
  // publication de décision au JORF (dpu)
  // publication de décision administrative au JORF (dup)
  // publication de décision au recueil des actes administratifs (rpu)
  // participation du public (ppu)
  // enquête publique (epu)

  const domaineId = titreTypeId ? getDomaineId(titreTypeId) : null
  if (
    domaineId &&
    ['m', 'w', 'c'].includes(domaineId) &&
    [
      'ane',
      ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
      ETAPES_TYPES.decisionDeLadministration,
      ETAPES_TYPES.publicationDeDecisionAuJORF,
      'dup',
      ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
      ETAPES_TYPES.participationDuPublic,
      ETAPES_TYPES.enquetePublique,
    ].includes(titreEtape.typeId)
  ) {
    return true
  }

  // Pour les PRM d’un titre en survie provisoire, les demandes de prolongations sont public
  if (
    titreTypeId === TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX &&
    titreEtape.typeId === ETAPES_TYPES.depotDeLaDemande &&
    [DEMARCHES_TYPES_IDS.Prolongation1, DEMARCHES_TYPES_IDS.Prolongation2].includes(demarcheTypeId) &&
    titreInModificationEnInstance([demarche])
  ) {
    return true
  }

  return publicLecture
}

/**
 *
 * @param demarcheTypeId - id du type de démarche
 * @param demarcheTypeEtapesTypes - types d'étapes de ce type de démarche
 * @param titreEtapes - étapes de la démarche dans l’ordre chronologique
 * @param titreId - id du titre
 * @param titreTypeId - id du type de titre
 */

export const titreDemarchePublicFind = (
  titreDemarche: Pick<ITitreDemarche, 'titreId' | 'demarcheDateDebut' | 'demarcheDateFin' | 'id' | 'typeId' | 'etapes'>,
  titreTypeId: TitreTypeId
): { publicLecture: boolean; entreprisesLecture: boolean } => {
  const titreDemarcheEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes ?? [])

  // calcule la visibilité publique ou non de la démarche
  // on parcourt successivement toutes les étapes
  // pour calculer la visibilité de la démarche
  // en fonction de l'historique
  let publicLecture = false
  if (titreDemarche.titreId === 'WQaZgPfDcQw9tFliMgBIDH3Z') {
    publicLecture = false
  } else {
    const machine = machineFind(titreTypeId, titreDemarche.typeId, titreDemarcheEtapes, titreDemarche.id)

    if (machine) {
      publicLecture = machine.demarcheStatut(toMachineEtapes(titreDemarcheEtapes.map(etape => titreEtapeForMachineValidator.parse(etape)))).publique
    } else {
      const demarcheTypeEtapesTypes = getEtapesTDE(titreTypeId, titreDemarche.typeId)
      publicLecture = titreDemarcheEtapes.reduce(
        (publicLecture, titreEtape) => titreDemarchePublicLectureFind(publicLecture, titreDemarche.typeId, demarcheTypeEtapesTypes, titreEtape, titreDemarche, titreTypeId),
        false
      )
    }
  }

  // les entreprises titulaires ou amodiataires peuvent voir la démarche
  // si la démarche est visible au public
  // ou si la démarche contient une demande ou une décision de l'administration unilatérale
  const entreprisesLecture = publicLecture || titreDemarcheEtapes.some(te => [ETAPES_TYPES.demande, ETAPES_TYPES.decisionDeLadministration, ETAPES_TYPES.decisionAdministrative].includes(te.typeId))

  return { publicLecture, entreprisesLecture }
}
