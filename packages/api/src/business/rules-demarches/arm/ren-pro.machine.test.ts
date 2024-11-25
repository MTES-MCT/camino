import { describe, expect, test } from 'vitest'
import { ArmRenProMachine } from './ren-pro.machine'
import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
const etapesProd = require('./2019-10-31-rec-rep-pro.cas.json') // eslint-disable-line

describe('vérifie l’arbre de renonciation et de prolongation d’ARM', () => {
  const armRenProMachine = new ArmRenProMachine()

  test('peut créer une étape "men" après une "mfr"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-27', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE       (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE]",
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
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mod","etapeStatutId":"fai","date":"2020-05-30"}' after '["mfr_fai","men_fai","mcr_fav"]'. The event {"type":"RECEVOIR_MODIFICATION_DE_LA_DEMANDE","date":"2020-05-30","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })

  test('ne peut pas faire 2 "mco" d’affilée', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-27', [
        ETES.demande.FAIT,
        ETES.enregistrementDeLaDemande.FAIT,
        ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        // {...ETES.recevabiliteDeLaDemande.DEFAVORABLE, date: toCaminoDate('2020-05-30') },
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mca","etapeStatutId":"fai","date":"2020-05-31"}' after '["mfr_fai","men_fai","mca_fai"]'. The event {"type":"DEMANDER_COMPLEMENTS_POUR_RECEVABILITE","date":"2020-05-31","status":"fai"} should be one of 'DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE']`
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
        "ENREGISTRER_DEMANDE                                   (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE                  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
      ]
    `)
  })

  // pour regénérer le ren.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    armRenProMachine.interpretMachine(demarche.etapes)
    expect(armRenProMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
