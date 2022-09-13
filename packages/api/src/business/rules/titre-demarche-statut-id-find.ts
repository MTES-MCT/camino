import {
  DemarcheId,
  ITitreEtape,
  TitreEtapesTravauxTypes as Travaux
} from '../../types'

import { titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { titreEtapePublicationCheck } from './titre-etape-publication-check'
import {
  demarcheDefinitionFind,
  isDemarcheDefinitionMachine
} from '../rules-demarches/definitions'
import {
  demarcheStatut,
  toMachineEtapes
} from '../rules-demarches/machine-helper'
import {
  DemarcheStatutId,
  DemarchesStatutsIds
} from 'camino-common/src/static/demarchesStatuts'

const titreEtapesDecisivesCommunesTypes = ['css', 'rtd', 'abd', 'and']

const titreEtapesDecisivesDemandesTypes = [
  'mfr',
  'mdp',
  'men',
  'meo',
  'ide',
  'des',
  'mcp',
  'mcr',
  'dim',
  'dex',
  'aca',
  'def',
  'sco',
  'aco',
  'apu',
  'rpu',
  'dpu',
  'ihi',
  ...titreEtapesDecisivesCommunesTypes
]

const titreDemarchesDemandesTypes = [
  'oct',
  'pro',
  'pr1',
  'pr2',
  'pre',
  'ren',
  'fus',
  'exp',
  'exs',
  'mut',
  'vut',
  'amo',
  'res',
  'ces',
  'dep',
  'vus',
  'vct'
]

const titreDemarchesTravauxTypes = ['aom', 'dam', 'dot']

const titreEtapesDecisivesUnilateralesTypes = [
  'ide',
  'spp',
  'dup',
  'dux',
  'aof',
  'aco',
  ...titreEtapesDecisivesCommunesTypes
]

const titreDemarchesUnilateralesTypes = ['ret', 'prr', 'dec']

const titresDemarcheCommunesStatutIdFind = (
  titreEtapeRecent: ITitreEtape
): DemarcheStatutId | null => {
  //  - le type de l’étape est classement sans suite (css)
  //  - le titre est une ARM
  //    - et le type de l’étape est avis de la commission ARM (aca)
  //    - ou le type de l’étape est recevabilité de la demande (mcr) (historique)
  //    - et le statut de l’étape est défavorable (def)
  if (titreEtapeRecent.typeId === 'css') {
    //  - le statut de la démarche est classé sans suite (cls)
    return DemarchesStatutsIds.ClasseSansSuite
  }

  //  - le type de l’étape est retrait de la décision (rtd)
  //  - le type de l’étape est abrogation de la décision (abd)
  if (['rtd', 'abd'].includes(titreEtapeRecent.typeId)) {
    //  - le statut de la démarche repasse en “instruction”
    return DemarchesStatutsIds.EnInstruction
  }

  //  - le type de l’étape est annulation de la décision (and)
  if (titreEtapeRecent.typeId === 'and') {
    //  - si le statut est fait
    //  - alors, le statut de la démarche repasse en “instruction”
    //  - sinon, le statut de la démarche a celui l'étape (accepté ou rejeté)
    switch (titreEtapeRecent.statutId) {
      case 'fai':
        return DemarchesStatutsIds.EnInstruction
      case 'acc':
        return DemarchesStatutsIds.Accepte
      case 'rej':
        return DemarchesStatutsIds.Rejete
    }
  }

  return null
}

const titreDemarcheUnilateralStatutIdFind = (
  titreDemarcheEtapes: ITitreEtape[]
): DemarcheStatutId => {
  // filtre les types d'étapes qui ont un impact
  // sur le statut de la démarche de demande
  const titreEtapesDecisivesUnilaterale = titreDemarcheEtapes.filter(
    titreEtape =>
      titreEtapesDecisivesUnilateralesTypes.includes(titreEtape.typeId)
  )

  // si aucune étape décisive n'est présente dans la démarche
  // le statut est indétrminé
  if (!titreEtapesDecisivesUnilaterale.length)
    return DemarchesStatutsIds.Indetermine

  // l'étape la plus récente
  const titreEtapeRecent = titreEtapesSortDescByOrdre(
    titreEtapesDecisivesUnilaterale
  )[0]

  // calcule le statut de démarche pour les étapes communes
  const statutId = titresDemarcheCommunesStatutIdFind(titreEtapeRecent)
  if (statutId) return statutId

  // - le type de l’étape est publication au JO unilatérale
  // - le type de l’étape est décision unilatérale
  if (['dup', 'dux'].includes(titreEtapeRecent.typeId)) {
    // - le statut de la démarche est terminé
    return DemarchesStatutsIds.Termine
  }

  // - le type de l’étape est saisine du préfet
  if (titreEtapeRecent.typeId === 'spp') {
    //  - le statut de la démarche est “en instruction”
    return DemarchesStatutsIds.EnInstruction
  }

  // - le type de l’étape est avenant à l’autorisation de recherche minière
  if (titreEtapeRecent.typeId === 'aco') {
    // - le statut de la démarche est "terminé"
    return DemarchesStatutsIds.Termine
  }

  // - le type de l’étape est l’avis de l’ONF défavorable
  if (
    titreEtapeRecent.typeId === 'aof' &&
    titreEtapeRecent.statutId === 'def'
  ) {
    // - le statut de la démarche est "classement sans suite"
    return DemarchesStatutsIds.ClasseSansSuite
  }

  // - si il y a plusieurs étapes
  if (titreDemarcheEtapes.length > 1) {
    // - le statut de la démarche est "en instruction"
    return DemarchesStatutsIds.EnInstruction
  }

  // - sinon, le type de l’étape est initiation de la démarche
  // alors, le statut de la démarche est “initié”
  return DemarchesStatutsIds.Initie
}

const titreDemarcheDemandeStatutIdFind = (
  titreDemarcheEtapes: ITitreEtape[],
  titreTypeId: string
): DemarcheStatutId => {
  // filtre les types d'étapes qui ont un impact
  // sur le statut de la démarche de demande
  const titreEtapesDecisivesDemande = titreDemarcheEtapes.filter(titreEtape =>
    titreEtapesDecisivesDemandesTypes.includes(titreEtape.typeId)
  )

  // si aucune étape décisive n'est présente dans la démarche
  // le statut est indéterminé
  if (!titreEtapesDecisivesDemande.length)
    return DemarchesStatutsIds.Indetermine

  // l'étape la plus récente
  const titreEtapeRecent = titreEtapesSortDescByOrdre(
    titreEtapesDecisivesDemande
  )[0]

  // calcule le statut de démarche pour les étapes communes
  const statutId = titresDemarcheCommunesStatutIdFind(titreEtapeRecent)

  if (statutId) return statutId

  //  - le type de l’étape est une publication
  //  - ou une décision implicite (dim)
  //  - ou des informations historiques incomplètes
  const titreEtapesPublication = titreDemarcheEtapes.filter(
    titreEtape =>
      titreEtapePublicationCheck(titreEtape.typeId, titreTypeId) ||
      ['dim', 'ihi'].includes(titreEtape.typeId)
  )

  if (titreEtapesPublication.length) {
    // si l'étape de publication la plus récente est
    const titreEtapePublicationRecent = titreEtapesSortDescByOrdre(
      titreEtapesPublication
    )[0]

    // si l'étape de publication est de type unilatérale
    // alors la démarche a le statut accepté
    // sinon la démarche a le statut de l'étape (accepté ou rejeté)
    switch (titreEtapePublicationRecent.statutId) {
      case 'fai':
      case 'acc':
        return DemarchesStatutsIds.Accepte
      case 'rej':
        return DemarchesStatutsIds.Rejete
      default:
        return DemarchesStatutsIds.Indetermine
    }
  }

  //  - le type de l’étape est décision expresse (dex)
  //  - et le statut de l’étape est rejeté (rej)
  if (
    ['dex', 'dux'].includes(titreEtapeRecent.typeId) &&
    titreEtapeRecent.statutId === 'rej'
  ) {
    //  - le statut de la démarche est rejeté (rej)
    return DemarchesStatutsIds.Rejete
  }

  //  - le type de l’étape est désistement du demandeur (des)
  if (titreEtapeRecent.typeId === DemarchesStatutsIds.Desiste) {
    //  - le statut de la démarche est “désisté”
    return DemarchesStatutsIds.Desiste
  }

  //  - le type de l’étape est rejeté (rej)
  //  - le titre est une ARM
  //    - et le type de l’étape est avis de la commission ARM (aca)
  //    - et le statut de l’étape est défavorable (def)
  if (
    titreTypeId === 'arm' &&
    titreEtapeRecent.typeId === 'aca' &&
    titreEtapeRecent.statutId === 'def'
  ) {
    return DemarchesStatutsIds.Rejete
  }

  //  - le type de l’étape est recevabilité de la demande (mcr)
  //  - le type de l’étape est enregistrement de la demande (men)
  //  - le type de l’étape est décision explicite (dex)
  //  - la date de l'étape est inférieure à la date du jour
  //  OU
  //  - le type de l’étape est avis de la commission ARM (aca) (non défavorable)
  //  - le type de l’étape est décision de l'ONF (def) (non défavorable)
  if (
    ['mcr', 'dex', 'dux'].includes(titreEtapeRecent.typeId) ||
    (titreTypeId === 'arm' &&
      ['mdp', 'men', 'meo', 'mcp', 'def', 'aca'].includes(
        titreEtapeRecent.typeId
      ))
  ) {
    //  - le statut de la démarche est “en instruction”
    return DemarchesStatutsIds.EnInstruction
  }

  //  - le type de l’étape est dépôt de la demande (mdp)
  //  - il n’y a pas d’étape après
  if (titreEtapeRecent.typeId === 'mdp') {
    //  - le statut de la démarche est “déposé”
    return DemarchesStatutsIds.Depose
  }

  //  - le type de l’étape est formalisation de la demande (mfr)
  if (titreEtapeRecent.typeId === 'mfr') {
    //  - le statut de la démarche est “en construction”
    return DemarchesStatutsIds.EnConstruction
  }

  // sinon le statut de la démarche est indéterminé
  return DemarchesStatutsIds.Indetermine
}

const titreDemarcheTravauxStatutIdFind = (
  titreDemarcheEtapes: ITitreEtape[],
  demarcheTypeId: string
): DemarcheStatutId => {
  if (titreDemarcheEtapes.length === 0) {
    return DemarchesStatutsIds.Indetermine
  }
  const titreEtapesRecent = titreEtapesSortDescByOrdre(titreDemarcheEtapes)[0]

  const statuts: {
    [travauxEtapeType: string]: DemarcheStatutId
  } = {
    [Travaux.DemandeAutorisationOuverture]: DemarchesStatutsIds.Depose,
    [Travaux.DeclarationOuverture]: DemarchesStatutsIds.Depose,
    [Travaux.DeclarationArret]: DemarchesStatutsIds.Depose,
    [Travaux.DepotDemande]: DemarchesStatutsIds.Depose,
    [Travaux.DemandeComplements]: DemarchesStatutsIds.EnInstruction,
    [Travaux.ReceptionComplements]: DemarchesStatutsIds.EnInstruction,
    [Travaux.Recevabilite]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisReception]: DemarchesStatutsIds.EnInstruction,
    [Travaux.SaisineAutoriteEnvironmentale]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisAutoriteEnvironmentale]: DemarchesStatutsIds.EnInstruction,
    [Travaux.ArretePrefectoralSursis]: DemarchesStatutsIds.EnInstruction,
    [Travaux.SaisineServiceEtat]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisServiceAdminLocal]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisDDTM]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisAutoriteMilitaire]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisARS]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisDRAC]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisPrefetMaritime]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisAutresInstances]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisRapportDirecteurREAL]: DemarchesStatutsIds.EnInstruction,
    [Travaux.TransPrescriptionsDemandeur]: DemarchesStatutsIds.EnInstruction,
    [Travaux.OuvertureEnquetePublique]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisServiceAdminLocal]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisDDTM]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisAutoriteMilitaire]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisARS]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisDRAC]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisPrefetMaritime]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisAutresInstances]: DemarchesStatutsIds.EnInstruction,
    [Travaux.MemoireReponseExploitant]: DemarchesStatutsIds.EnInstruction,
    [Travaux.ClotureEnquetePublique]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisRapportDirecteurREAL]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisCODERST]: DemarchesStatutsIds.EnInstruction,
    [Travaux.AvisPrescriptionsDemandeur]: DemarchesStatutsIds.EnInstruction,
    [Travaux.RapportDREAL]: DemarchesStatutsIds.EnInstruction,
    [Travaux.ArretePrescriptionComplementaire]:
      DemarchesStatutsIds.EnInstruction,
    [Travaux.ArretePrefectDonneActe1]: DemarchesStatutsIds.EnInstruction,
    [Travaux.MemoireFinTravaux]: DemarchesStatutsIds.EnInstruction,
    [Travaux.Recolement]: DemarchesStatutsIds.EnInstruction,
    [Travaux.ArreteOuvertureTravauxMiniers]: DemarchesStatutsIds.Accepte,
    [Travaux.DonneActeDeclaration]: DemarchesStatutsIds.Accepte,
    [Travaux.Abandon]: DemarchesStatutsIds.Desiste,
    [Travaux.ArretePrefectDonneActe2]: DemarchesStatutsIds.FinPoliceMines,
    [Travaux.PorterAConnaissance]: DemarchesStatutsIds.FinPoliceMines
  }

  if (titreEtapesRecent.typeId === Travaux.PubliDecisionRecueilActesAdmin) {
    switch (demarcheTypeId) {
      case 'aom':
        return DemarchesStatutsIds.Accepte
      case 'dam':
        return DemarchesStatutsIds.FinPoliceMines
    }
  }

  return statuts[titreEtapesRecent.typeId] || DemarchesStatutsIds.Indetermine
}

/**
 * Retourne l'id du statut d'une démarche
 * @param demarcheTypeId - id du type de la démarche
 * @param titreDemarcheEtapes - étapes de la démarche
 * @param titreTypeId - id du type de titre
 */

export const titreDemarcheStatutIdFind = (
  demarcheTypeId: string,
  titreDemarcheEtapes: ITitreEtape[],
  titreTypeId: string,
  demarcheId: DemarcheId
): DemarcheStatutId => {
  // si la démarche ne contient pas d'étapes
  // -> le statut est indétrminé
  if (!titreDemarcheEtapes.length) return DemarchesStatutsIds.Indetermine

  // si la démarche est pour des travaux
  if (titreDemarchesTravauxTypes.includes(demarcheTypeId)) {
    return titreDemarcheTravauxStatutIdFind(titreDemarcheEtapes, demarcheTypeId)
  }

  const demarcheDefinition = demarcheDefinitionFind(
    titreTypeId,
    demarcheTypeId,
    titreDemarcheEtapes,
    demarcheId
  )

  if (isDemarcheDefinitionMachine(demarcheDefinition)) {
    return demarcheStatut(toMachineEtapes(titreDemarcheEtapes))
  }

  //  si la démarche fait l’objet d’une demande
  // (son type est :
  //  - octroi ou prolongation(1, 2 ou exceptionnelle)
  //  - renonciation ou fusion (native ou virtuelle) ou extension du périmètre
  //  - extension de substance ou mutation (native ou virtuelle) ou amodiation
  //  - résiliation d’amodiation ou déplacement de périmètre)
  if (titreDemarchesDemandesTypes.includes(demarcheTypeId)) {
    return titreDemarcheDemandeStatutIdFind(titreDemarcheEtapes, titreTypeId)
  }

  //  si la démarche ne fait pas l’objet d’une demande (unilatérale)
  //  (son type est retrait ou abrogation ou prorogation)
  else if (titreDemarchesUnilateralesTypes.includes(demarcheTypeId)) {
    return titreDemarcheUnilateralStatutIdFind(titreDemarcheEtapes)
  }

  //  sinon, le statut est indéterminé
  return DemarchesStatutsIds.Indetermine
}
