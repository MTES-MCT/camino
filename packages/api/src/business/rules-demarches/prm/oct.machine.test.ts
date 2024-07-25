import { interpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { PrmOctMachine } from './oct.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { describe, expect, test } from 'vitest'
import { PAYS_IDS } from 'camino-common/src/static/pays'
const etapesProd = require('./2019-10-31-oct.cas.json')

describe('vérifie l’arbre d’octroi de PRM', () => {
  const prmOctMachine = new PrmOctMachine()
  test('peut créer une demande d’octroi de PRM complète en Métropole', () => {
    const { service, etapes, dateFin } = setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-07-01', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE, addDays: 31 },
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.saisineDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.rapportDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.saisineDeLautoriteSignataire.FAIT,
      ETES.decisionDeLadministration.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.ACCEPTE,
      ETES.notificationDesCollectivitesLocales.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
      ETES.publicationDansUnJournalLocalOuNational.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.notificationAuPrefet.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine: prmOctMachine, date: dateFin }, [])
    expect(prmOctMachine.demarcheStatut(etapes)).toMatchInlineSnapshot(`
      {
        "demarcheStatut": "acc",
        "publique": true,
      }
    `)
  })

  test('peut créer une demande d’octroi de PRM en Guyane', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['Département de la Guyane'], surface: 200 },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      { ...ETES.participationDuPublic.TERMINE, addDays: 31 },
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.saisineDesCollectivitesLocales.FAIT,
      ETES.avisDunMaire.FAVORABLE,
      { ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE, addDays: 31 },
      ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2020-04-14', etapes)).not.toThrowError()
  })

  test('peut créer une demande d’octroi de PRM en Guyane sans avis du maire', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['Département de la Guyane'], surface: 14 },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.saisineDesCollectivitesLocales.FAIT,
      { ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE, addDays: 31 },
      ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2023-09-05', etapes)).not.toThrowError()
  })

  test('peut créer une demande d’octroi de PRM en Outre mer (hors Guyane)', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['Wallis-et-Futuna'] },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.participationDuPublic.TERMINE, addDays: 31 },
      ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
      ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-06-08', etapes)).not.toThrowError()
  })

  test('ne peut pas faire l’avis de la DREAL si la saisine des services a été faite dans les 30 jours', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-13', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"apd","etapeStatutId":"fav","date":"2022-04-20"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai","asc_fai"]'. The event {"type":"RENDRE_RAPPORT_DREAL","date":"2022-04-20"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS']`
    )
  })

  test('ne peut pas faire 2 avis des services et commissions consultatives', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-12', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"asc","etapeStatutId":"fai","date":"2022-04-19"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai","asc_fai"]'. The event {"type":"RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES","date":"2022-04-19"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS']`
    )
  })

  test('ne peut pas ouvrir la participation du public si la mise en concurrence n’est pas terminée', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      ETES.participationDuPublic.PROGRAMME,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-13', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"ppu","etapeStatutId":"pro","date":"2022-04-19"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai"]'. The event {"type":"OUVRIR_PARTICIPATION_DU_PUBLIC","date":"2022-04-19","status":"pro"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })

  test('ne peut pas créer une "rpu" après une "dex" rejetée', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.depotDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.participationDuPublic.TERMINE, addDays: 31 },
      ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.saisineDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.rapportDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.saisineDeLautoriteSignataire.FAIT,
      ETES.decisionDeLadministration.REJETE,
      ETES.notificationAuPrefet.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
    ]

    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-13', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"rpu","etapeStatutId":"fai","date":"2022-05-30"}' after '["mfr_fai","mdp_fai","spp_fai","mcr_fav","anf_fai","asc_fai","ppu_ter","apd_fav","app_fav","scg_fai","rcg_fav","acg_fav","sas_fai","dex_rej","npp_fai","mno_fai"]'. The event {"type":"PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS"} should be one of 'RENDRE_DECISION_ABROGATION,RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF']`
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
