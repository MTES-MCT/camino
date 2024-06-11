import { interpretMachine, orderAndInterpretMachine } from '../machine-test-helper.js'
import { PrmOctMachine } from './oct.machine.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { PAYS_IDS } from 'camino-common/src/static/pays.js'
const etapesProd = require('./oct.cas.json')

describe('vérifie l’arbre d’octroi de PRM', () => {
  const prmOctMachine = new PrmOctMachine()
  test('peut créer une demande d’octroi de PRM complète en Métropole', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['République Française'] },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.avisDuPrefet.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-05-18') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-05-19') },
      { ...ETES.consultationDesAdministrationsCentrales.FAIT, date: toCaminoDate('2022-05-21') },
      { ...ETES.saisineDuConseilGeneralDeLeconomie_CGE_.FAIT, date: toCaminoDate('2022-05-22') },
      { ...ETES.rapportDuConseilGeneralDeLeconomie_CGE_.FAVORABLE, date: toCaminoDate('2022-05-23') },
      { ...ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAVORABLE, date: toCaminoDate('2022-05-24') },
      { ...ETES.saisineDeLautoriteSignataire.FAIT, date: toCaminoDate('2022-05-25') },
      { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-05-26') },
      { ...ETES.publicationDeDecisionAuJORF.ACCEPTE, date: toCaminoDate('2022-05-27') },
      { ...ETES.notificationDesCollectivitesLocales.FAIT, date: toCaminoDate('2022-05-28') },
      { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-05-29') },
      { ...ETES.publicationDansUnJournalLocalOuNational.FAIT, date: toCaminoDate('2022-05-30') },
      { ...ETES.notificationAuDemandeur.FAIT, date: toCaminoDate('2022-05-31') },
      { ...ETES.notificationAuPrefet.FAIT, date: toCaminoDate('2022-05-31') },
    ]
    const service = orderAndInterpretMachine(prmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: prmOctMachine, date: toCaminoDate('2022-07-01') }, [])
    expect(prmOctMachine.demarcheStatut(etapes)).toMatchInlineSnapshot(`
      {
        "demarcheStatut": "acc",
        "publique": true,
      }
    `)
  })

  test('peut créer une demande d’octroi de PRM en Guyane', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['Département de la Guyane'], surface: 200 },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.saisineDesCollectivitesLocales.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisDunMaire.FAVORABLE, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.avisDuPrefet.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-05-18') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-05-19') },
    ]
    expect(() => orderAndInterpretMachine(prmOctMachine, etapes)).not.toThrowError()
  })

  test('peut créer une demande d’octroi de PRM en Outre mer (hors Guyane)', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['Wallis-et-Futuna'] },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.avisDuPrefet.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-05-18') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-05-19') },
    ]
    expect(() => orderAndInterpretMachine(prmOctMachine, etapes)).not.toThrowError()
  })

  test('ne peut pas faire l’avis de la DREAL si la saisine des services a été faite dans les 30 jours', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['République Française'] },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE, date: toCaminoDate('2022-04-20') },
    ]
    expect(() => orderAndInterpretMachine(prmOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"apd","etapeStatutId":"fav","date":"2022-04-20"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai","asc_fai"]'. The event {"type":"RENDRE_RAPPORT_DREAL","date":"2022-04-20"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS']`
    )
  })

  test('ne peut pas faire 2 avis des services et commissions consultatives', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['République Française'] },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
    ]
    expect(() => orderAndInterpretMachine(prmOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"asc","etapeStatutId":"fai","date":"2022-04-19"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai","asc_fai"]'. The event {"type":"RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES","date":"2022-04-19"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS']`
    )
  })

  test('ne peut pas ouvrir la participation du public si la mise en concurrence n’est pas terminée', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['République Française'] },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-19') },
    ]
    expect(() => orderAndInterpretMachine(prmOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"ppu","etapeStatutId":"fai","date":"2022-04-19"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai"]'. The event {"type":"OUVRIR_PARTICIPATION_DU_PUBLIC","date":"2022-04-19"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })

  test('ne peut pas créer une "rpu" après une "dex" rejetée', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14'), paysId: PAYS_IDS['République Française'] },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.saisineDuPrefet.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDeMiseEnConcurrenceAuJORF.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-19') },
      { ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.avisDuPrefet.FAVORABLE, date: toCaminoDate('2022-05-20') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-05-18') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-05-19') },
      { ...ETES.consultationDesAdministrationsCentrales.FAIT, date: toCaminoDate('2022-05-21') },
      { ...ETES.saisineDuConseilGeneralDeLeconomie_CGE_.FAIT, date: toCaminoDate('2022-05-22') },
      { ...ETES.rapportDuConseilGeneralDeLeconomie_CGE_.FAVORABLE, date: toCaminoDate('2022-05-23') },
      { ...ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAVORABLE, date: toCaminoDate('2022-05-24') },
      { ...ETES.saisineDeLautoriteSignataire.FAIT, date: toCaminoDate('2022-05-25') },
      { ...ETES.decisionDeLadministration.REJETE, date: toCaminoDate('2022-05-26') },
      { ...ETES.notificationAuPrefet.FAIT, date: toCaminoDate('2022-05-31') },
      { ...ETES.notificationAuDemandeur.FAIT, date: toCaminoDate('2022-06-01') },
      { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-06-01') },
    ]

    expect(() => orderAndInterpretMachine(prmOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"rpu","etapeStatutId":"fai","date":"2022-06-01"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai","asc_fai","ppu_fai","ppc_ter","apd_fav","app_fav","cac_fai","scg_fai","rcg_fav","acg_fav","sas_fai","dex_rej","npp_fai","mno_fai"]'. The event {"type":"PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS"} should be one of 'RENDRE_DECISION_ABROGATION,RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF']`
    )
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(prmOctMachine, demarche.etapes)
    expect(prmOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
