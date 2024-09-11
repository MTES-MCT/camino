import { describe, expect, test } from 'vitest'
import { ArmRenProMachine } from './ren-pro.machine'
import { interpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
const etapesProd = require('./2019-10-31-ren-pro.cas.json')

describe('vérifie l’arbre de renonciation et de prolongation d’ARM', () => {
  const armRenProMachine = new ArmRenProMachine()

  test('peut créer une étape "mdp" après une "mfr"', () => {
    const { service } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-27', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Depose)
  })

  test('ne peut pas faire de "mod" après une "mcr"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-26', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE, ETES.modificationDeLaDemande.FAIT])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mod","etapeStatutId":"fai","date":"2020-05-30"}' after '["mfr_fai","mdp_fai","mcr_fav"]'. The event {"type":"RECEVOIR_MODIFICATION_DE_LA_DEMANDE","date":"2020-05-30","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })

  test('ne peut pas faire 2 "mco" d’affilée', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-05-27', [
        ETES.demande.FAIT,
        ETES.depotDeLaDemande.FAIT,
        ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        // {...ETES.recevabiliteDeLaDemande.DEFAVORABLE, date: toCaminoDate('2020-05-30') },
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mca","etapeStatutId":"fai","date":"2020-05-31"}' after '["mfr_fai","mdp_fai","mca_fai"]'. The event {"type":"DEMANDER_COMPLEMENTS_POUR_RECEVABILITE","date":"2020-05-31","status":"fai"} should be one of 'DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE']`
    )
  })

  test('peut mettre une "asc" après une "mcp"', () => {
    const { service } = setDateAndOrderAndInterpretMachine(armRenProMachine, '2020-06-30', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
  })

  // pour regénérer le ren.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(armRenProMachine, demarche.etapes)
    expect(armRenProMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
