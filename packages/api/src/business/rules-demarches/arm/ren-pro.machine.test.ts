import { describe, expect, test } from 'vitest'
import { ArmRenProMachine } from './ren-pro.machine'
import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'

describe('vérifie l’arbre de renonciation et de prolongation d’ARM', () => {
  const armRenProMachine = new ArmRenProMachine(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Prolongation)

  test('peut créer une étape "men" après une "mfr"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-27', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE       (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "[2020-05-28 -> null]",
        "ENREGISTRER_DEMANDE (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE]",
        "[2020-05-28 -> null]",
      ]
    `)
  })

  test('peut faire une prolongation complète', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2021-02-20', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avenantALautorisationDeRechercheMiniere.FAIT,
      ETES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "[2021-02-21 -> null]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE]",
        "[2021-02-21 -> null]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE                  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "[2021-02-21 -> null]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2021-02-21 -> null]",
        "FAIRE_AVENANT_ARM                                     (publique      , accepté                ) -> [NOTIFIER_AVENANT_ARM]",
        "[2021-02-21 -> 2022-02-21]",
        "NOTIFIER_AVENANT_ARM                                  (publique      , accepté                ) -> []",
        "[2021-02-21 -> 2022-02-21]",
      ]
    `)
  })

  test('peut désister une prolongation', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2021-02-20', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.desistementDuDemandeur.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                      (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE             (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "[2021-02-21 -> null]",
        "ENREGISTRER_DEMANDE       (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE]",
        "[2021-02-21 -> null]",
        "DESISTER_PAR_LE_DEMANDEUR (publique      , désisté                ) -> []",
        "[2021-02-21 -> 2021-02-23]",
      ]
    `)
  })

  test('ne peut pas faire de "mod" après une "mcr"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-26', [
        ETES.demande.FAIT,
        ETES.enregistrementDeLaDemande.FAIT,
        ETES.recevabiliteDeLaDemande.FAVORABLE,
        ETES.modificationDeLaDemande.FAIT,
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"duree":12,"etapeTypeId":"mod","etapeStatutId":"fai","date":"2020-05-30"}' after '["mfr_fai","men_fai","mcr_fav"]'. The event {"type":"RECEVOIR_MODIFICATION_DE_LA_DEMANDE","date":"2020-05-30","status":"fai","duree":12} should be one of 'CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })

  test('ne peut pas faire 2 "mco" d’affilée', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-27', [
        ETES.demande.FAIT,
        ETES.enregistrementDeLaDemande.FAIT,
        ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"duree":12,"etapeTypeId":"mca","etapeStatutId":"fai","date":"2020-05-31"}' after '["mfr_fai","men_fai","mca_fai"]'. The event {"type":"DEMANDER_COMPLEMENTS_POUR_RECEVABILITE","date":"2020-05-31","status":"fai","duree":12} should be one of 'DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE']`
    )
  })

  test('peut mettre une "asc" après une "mcp"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-06-30', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "[2020-07-01 -> null]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE]",
        "[2020-07-01 -> null]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE                  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "[2020-07-01 -> null]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2020-07-01 -> null]",
      ]
    `)
  })
})
