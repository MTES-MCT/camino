import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { ArmRenProMachine } from './ren-pro.machine.js'
import { interpretMachine, orderAndInterpretMachine } from '../machine-test-helper.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
const etapesProd = require('./ren.cas.json')

describe('vérifie l’arbre de renonciation et de prolongation d’ARM', () => {
  const armRenProMachine = new ArmRenProMachine()

  test('peut créer une étape "mdp" après une "mfr"', () => {
    const service = orderAndInterpretMachine(armRenProMachine, [
      { ...ETES.demande.FAIT, date: toCaminoDate('2020-05-27') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2020-05-30') },
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Depose)
  })

  test('ne peut pas faire de "mod" après une "mcr"', () => {
    expect(() =>
      orderAndInterpretMachine(armRenProMachine, [
        { ...ETES.demande.FAIT, date: toCaminoDate('2020-05-27') },
        { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2020-05-30') },
        { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2020-05-30') },
        { ...ETES.modificationDeLaDemande.FAIT, date: toCaminoDate('2020-06-30') },
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      '"Error: cannot execute step: \'{\\"etapeTypeId\\":\\"mod\\",\\"etapeStatutId\\":\\"fai\\",\\"date\\":\\"2020-06-30\\"}\' after \'[\\"mfr_fai\\",\\"mdp_fai\\",\\"mcr_fav\\"]\'. The event {\\"type\\":\\"RECEVOIR_MODIFICATION_DE_LA_DEMANDE\\"} should be one of \'DEMANDER_INFORMATION_EXPERTISE_ONF,FAIRE_EXPERTISE_ONF,DESISTER_PAR_LE_DEMANDEUR,CLASSER_SANS_SUITE\'"'
    )
  })

  test('ne peut pas faire 2 "mco" d’affilée', () => {
    expect(() =>
      orderAndInterpretMachine(armRenProMachine, [
        { ...ETES.demande.FAIT, date: toCaminoDate('2020-05-27') },
        { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2020-05-30') },
        { ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT, date: toCaminoDate('2020-06-30') },
        { ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT, date: toCaminoDate('2020-06-30') },
        // {...ETES.recevabiliteDeLaDemande.DEFAVORABLE, date: toCaminoDate('2020-05-30') },
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      '"Error: cannot execute step: \'{\\"etapeTypeId\\":\\"mca\\",\\"etapeStatutId\\":\\"fai\\",\\"date\\":\\"2020-06-30\\"}\' after \'[\\"mfr_fai\\",\\"mdp_fai\\",\\"mca_fai\\"]\'. The event {\\"type\\":\\"DEMANDER_COMPLEMENTS_POUR_RECEVABILITE\\"} should be one of \'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,DESISTER_PAR_LE_DEMANDEUR\'"'
    )
  })

  test('peut mettre une "aof" après une "eof"', () => {
    const service = orderAndInterpretMachine(armRenProMachine, [
      { ...ETES.demande.FAIT, date: toCaminoDate('2020-05-27') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2020-05-30') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2020-05-30') },
      { ...ETES.expertiseDeLOfficeNationalDesForets.FAIT, date: toCaminoDate('2020-06-30') },
      { ...ETES.avisDeLOfficeNationalDesForets.FAVORABLE, date: toCaminoDate('2020-06-30') },
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
