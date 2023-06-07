import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { getDomaineId, TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getEtapesTDE } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { ITitreEtape, ITitreDemarche } from '../../types.js'
import { demarcheDefinitionFind } from '../rules-demarches/definitions.js'
import { toMachineEtapes } from '../rules-demarches/machine-common.js'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort.js'
import { titreInSurvieProvisoire } from './titre-statut-id-find.js'
const titreDemarchePublicLectureFind = (
  publicLecture: boolean,
  demarcheTypeId: DemarcheTypeId,
  demarcheTypeEtapesTypes: readonly EtapeTypeId[],
  titreEtape: ITitreEtape,
  demarche: Pick<ITitreDemarche, 'demarcheDateFin' | 'demarcheDateDebut'>,
  titreTypeId?: TitreTypeId
) => {
  // si le type de démarche est retrait de la demande ou déchéance
  // et que le type d'étape est saisine du préfet
  // alors la démarche est publique
  if (['ret', 'dec'].includes(demarcheTypeId) && titreEtape.typeId === 'spp') {
    return true
  }

  // si le type d'étape est un classement sans suite
  // et le type de titre n'est ni ARM ni AXM
  // alors la démarche n'est pas publique
  if (titreEtape.typeId === 'css' && (!titreTypeId || !['arm', 'axm'].includes(titreTypeId))) {
    return false
  }

  // si le type d'étape est recevabilité de la demande
  // et que le type de titre n'est pas ARM
  // et que la démarche ne peut contenir de mise en concurrence au JORF ou JOUE
  // alors la démarche est publique
  if (titreEtape.typeId === 'mcr' && (!titreTypeId || titreTypeId !== 'arm') && !demarcheTypeEtapesTypes.find(et => ['anf', 'ane'].includes(et))) {
    return true
  }

  // si le type d'étape est mise en concurrence au JORF ou JOUE
  // alors la démarche est publique
  if (['anf', 'ane'].includes(titreEtape.typeId)) {
    return true
  }

  // si le type d'étape est participation du public
  // alors la démarche est publique
  if (titreEtape.typeId === 'ppu') {
    return true
  }

  // si le type d'étape est publication de l'avis de décision implicite
  // alors la démarche est publique
  if (titreEtape.typeId === 'apu') {
    return true
  }

  // si le type de titre est ARM
  // et que le type d'étape est saisine de la commission des ARM
  //    ou avis de la commission des ARM (si pas de saisine)
  //    ou décision de l'ONF (étape historique)
  // alors la démarche est publique
  if (titreTypeId === 'arm' && ['sca', 'aca', 'def'].includes(titreEtape.typeId)) {
    return true
  }

  // si le type de titre est ARM ou AXM
  // et que le type d'étape est désistement du demandeur
  // alors la démarche est publique
  if (titreTypeId && ['arm', 'axm'].includes(titreTypeId) && titreEtape.typeId === 'des') {
    return true
  }

  // si le type d'étape est décision implicite
  //    ou décision de l'administration
  // et que le statut est rejeté
  if (['dim', 'dex'].includes(titreEtape.typeId) && titreEtape.statutId === 'rej') {
    //   si le type de titre est AXM
    //   alors la démarche est publique
    //   sinon la démarche n'est pas (plus) publique
    return titreTypeId === 'axm'
  }

  // si le type d'étape est décision implicite
  //    ou décision de l'administration
  //    ou publication au JORF
  // et que le statut est accepté
  // alors la démarche est publique
  if (['dim', 'dex', 'dpu'].includes(titreEtape.typeId) && titreEtape.statutId === 'acc') {
    return true
  }

  // si le type d'étape est publication de décision unilatérale au JORF
  //    ou décision unilatérale de l'administration
  //    ou publication de décision au recueil des actes administratifs
  // alors la démarche est publique
  if (['dup', 'dux', 'rpu'].includes(titreEtape.typeId)) {
    return true
  }

  // si le type de titre est ARM
  // et que le type d'étape est signature de l'autorisation de recherche minière
  //    ou signature de l'avenant à l'autorisation de recherche minière
  // alors la démarche est publique
  if (titreTypeId === 'arm' && ['sco', 'aco'].includes(titreEtape.typeId)) {
    return true
  }

  //  - le type de l’étape est annulation de la décision (and)
  //  - et si le statut est favorable
  if (['and'].includes(titreEtape.typeId) && titreEtape.statutId === 'fav') {
    //  - alors, la démarche est publique
    return true
  }

  // Si le type de titre est ARM et que le type de démarche est renonciation
  // et que l’expertise de l’onf est cours (recevabilité de la demande faite), ou si la démarche a été désistée ou si classée sans suite
  if (titreTypeId === 'arm' && ['ren', 'pro'].includes(demarcheTypeId) && ['mcr', 'css', 'des'].includes(titreEtape.typeId)) {
    return true
  }

  // public pour tous des titres non énergétiques M, W, C avec une des étapes suivantes :
  // avis de concurrence au JOUE (ane)
  // avis de concurrence au JORF (anf)
  // décision de l'administration (dex)
  // publication de décision au JORF (dpu)
  // publication de décision administrative au JORF (dup)
  // publication de décision au recueil des actes administratifs (rpu)
  // ouverture de la participation du public (ppu)
  // clôture de la participation du public`(ppc)
  // ouverture de l’enquête publique (epu)
  // clôture de l’enquête publique (epc)

  const domaineId = titreTypeId ? getDomaineId(titreTypeId) : null
  if (domaineId && ['m', 'w', 'c'].includes(domaineId) && ['ane', 'anf', 'dex', 'dpu', 'dup', 'rpu', 'ppu', 'ppc', 'epu', 'epc'].includes(titreEtape.typeId)) {
    return true
  }

  // Pour les PRM d’un titre en survie provisoire, les demandes de prolongations sont public
  if (titreTypeId === 'prm' && titreEtape.typeId === 'mdp' && ['pr1', 'pr2'].includes(demarcheTypeId) && titreInSurvieProvisoire([demarche])) {
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

export const titreDemarchePublicFind = (titreDemarche: Pick<ITitreDemarche, 'titreId' | 'demarcheDateDebut' | 'demarcheDateFin' | 'id' | 'typeId' | 'etapes'>, titreTypeId: TitreTypeId) => {
  const titreDemarcheEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes ?? [])

  // calcule la visibilité publique ou non de la démarche
  // on parcourt successivement toutes les étapes
  // pour calculer la visibilité de la démarche
  // en fonction de l'historique
  let publicLecture = false
  if (titreDemarche.titreId === 'WQaZgPfDcQw9tFliMgBIDH3Z') {
    publicLecture = false
  } else {
    // si il existe un arbre d’instructions pour cette démarche,
    // on laisse l’arbre traiter l’unicité des étapes
    const demarcheDefinition = demarcheDefinitionFind(titreTypeId, titreDemarche.typeId, titreDemarcheEtapes, titreDemarche.id)

    if (demarcheDefinition) {
      publicLecture = demarcheDefinition.machine.demarcheStatut(toMachineEtapes(titreDemarcheEtapes)).publique
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
  const entreprisesLecture = publicLecture || titreDemarcheEtapes.some(te => ['mfr', 'dex', 'dux'].includes(te.typeId))

  return { publicLecture, entreprisesLecture }
}
