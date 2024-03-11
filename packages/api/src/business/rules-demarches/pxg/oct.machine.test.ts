import { interpretMachine, orderAndInterpretMachine } from '../machine-test-helper.js'
import { PxgOctMachine } from './oct.machine.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
const etapesProd = require('./oct.cas.json')

describe('vérifie l’arbre d’octroi des PXG', () => {
  const pxgOctMachine = new PxgOctMachine()

  test('peut créer une "mfr"', () => {
    const etapes = [{ ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') }]
    const service = orderAndInterpretMachine(pxgOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: pxgOctMachine, date: toCaminoDate('2022-04-14') }, ['DEPOSER_DEMANDE', 'OUVRIR_ENQUETE_PUBLIQUE', 'RENDRE_DECISION_ADMINISTRATION_FAVORABLE'])
  })

  test('peut avoir une démarche en instruction', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      {
        ...ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-17'),
      },
      { ...ETES.saisineDesServices.FAIT, date: toCaminoDate('2022-04-18') },
      {
        ...ETES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi.FAVORABLE,
        date: toCaminoDate('2022-04-18'),
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-19'),
      },
      {
        ...ETES.saisineDeLautoriteEnvironnementale.FAIT,
        date: toCaminoDate('2022-04-20'),
      },
    ]
    const service = orderAndInterpretMachine(pxgOctMachine, etapes)
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('peut modifier une demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      {
        ...ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      {
        ...ETES.recevabiliteDeLaDemande.DEFAVORABLE,
        date: toCaminoDate('2022-04-17'),
      },
      {
        ...ETES.modificationDeLaDemande.FAIT,
        date: toCaminoDate('2022-04-18'),
      },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-19'),
      },
    ]
    const service = orderAndInterpretMachine(pxgOctMachine, etapes)
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Depose)
  })

  test('peut construire une demande complète', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      {
        ...ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-17'),
      },
      { ...ETES.saisineDesServices.FAIT, date: toCaminoDate('2022-04-18') },
      {
        ...ETES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi.FAVORABLE,
        date: toCaminoDate('2022-04-18'),
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-19'),
      },
      {
        ...ETES.saisineDeLautoriteEnvironnementale.FAIT,
        date: toCaminoDate('2022-04-20'),
      },
      {
        ...ETES.avisDeLautoriteEnvironnementale.FAVORABLE,
        date: toCaminoDate('2022-04-21'),
      },
      {
        ...ETES.consultationCLEDuSAGE.FAVORABLE,
        date: toCaminoDate('2022-04-21'),
      },
      {
        ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
        date: toCaminoDate('2022-04-22'),
      },
      {
        ...ETES.transmissionDuProjetDePrescriptionsAuDemandeur.FAIT,
        date: toCaminoDate('2022-04-23'),
      },
      {
        ...ETES.avisDuDemandeurSurLesPrescriptionsProposees.FAVORABLE,
        date: toCaminoDate('2022-04-24'),
      },
      {
        ...ETES.decisionDeLadministration.ACCEPTE,
        date: toCaminoDate('2022-04-25'),
      },
      {
        ...ETES.notificationAuDemandeur.FAIT,
        date: toCaminoDate('2022-04-26'),
      },
      {
        ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
        date: toCaminoDate('2022-04-26'),
      },
    ]
    const service = orderAndInterpretMachine(pxgOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: pxgOctMachine, date: toCaminoDate('2022-04-26') }, [])
  })

  describe('démarches simplifiées', () => {
    test('la plus simple possible', () => {
      const etapes = [
        { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-14') },
        { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-04-15') },
      ]
      const service = orderAndInterpretMachine(pxgOctMachine, etapes)
      expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    })

    test('ne peut pas faire une rpu seule', () => {
      const etapes = [{ ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-04-15') }]
      expect(() => orderAndInterpretMachine(pxgOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
        '"Error: cannot execute step: \'{\\"etapeTypeId\\":\\"rpu\\",\\"etapeStatutId\\":\\"fai\\",\\"date\\":\\"2022-04-15\\"}\' after \'[]\'. The event {\\"type\\":\\"PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS\\"} should be one of \'RENDRE_DECISION_ADMINISTRATION_FAVORABLE,OUVRIR_ENQUETE_PUBLIQUE,FAIRE_DEMANDE\'"'
      )
    })

    test('peut créer avec une demande', () => {
      const etapes = [
        { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
        { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-14') },
        { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-04-15') },
      ]
      const service = orderAndInterpretMachine(pxgOctMachine, etapes)
      expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    })
    test('peut créer avec une enquête publique', () => {
      const etapes = [
        { ...ETES.ouvertureDeLenquetePublique.FAIT, date: toCaminoDate('2022-04-13') },
        { ...ETES.clotureDeLenquetePublique.TERMINE, date: toCaminoDate('2022-04-14') },
        { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-14') },
        { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-04-15') },
      ]
      const service = orderAndInterpretMachine(pxgOctMachine, etapes)
      expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    })
    test('peut créer avec une demande et une enquête publique', () => {
      const etapes = [
        { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-12') },
        { ...ETES.ouvertureDeLenquetePublique.FAIT, date: toCaminoDate('2022-04-13') },
        { ...ETES.clotureDeLenquetePublique.TERMINE, date: toCaminoDate('2022-04-14') },
        { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-14') },
        { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-04-15') },
      ]
      const service = orderAndInterpretMachine(pxgOctMachine, etapes)
      expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    })

    test('ne peut pas aller dans la démarche simplifiée une fois la demande déposée', () => {
      const etapes = [
        { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-12') },
        { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-12') },
        { ...ETES.ouvertureDeLenquetePublique.FAIT, date: toCaminoDate('2022-04-13') },
      ]
      expect(() => orderAndInterpretMachine(pxgOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
        '"Error: cannot execute step: \'{\\"etapeTypeId\\":\\"epu\\",\\"etapeStatutId\\":\\"fai\\",\\"date\\":\\"2022-04-13\\"}\' after \'[\\"mfr_fai\\",\\"mdp_fai\\"]\'. The event {\\"type\\":\\"OUVRIR_ENQUETE_PUBLIQUE\\"} should be one of \'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE\'"'
      )
    })

    test("ne peut pas refaire de décision de l'administration", () => {
      const etapes = [
        { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-14') },
        { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-15') },
      ]
      expect(() => orderAndInterpretMachine(pxgOctMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
        '"Error: cannot execute step: \'{\\"etapeTypeId\\":\\"dex\\",\\"etapeStatutId\\":\\"acc\\",\\"date\\":\\"2022-04-15\\"}\' after \'[\\"dex_acc\\"]\'. The event {\\"type\\":\\"RENDRE_DECISION_ADMINISTRATION_FAVORABLE\\"} should be one of \'PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS,OUVRIR_ENQUETE_PUBLIQUE\'"'
      )
    })
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(pxgOctMachine, demarche.etapes)
    expect(pxgOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
