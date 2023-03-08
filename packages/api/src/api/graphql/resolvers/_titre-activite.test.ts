import { productionCheck, titreActiviteAdministrationsEmailsGet } from './_titre-activite.js'
import { IAdministrationActiviteTypeEmail, IContenu } from '../../../types.js'
import { AdministrationId, ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { describe, expect, test } from 'vitest'

describe('teste la construction des emails lors du dépôt d’une activité', () => {
  describe('teste le calcul des emails des administrations', () => {
    test.each<null | undefined | Pick<IAdministrationActiviteTypeEmail, 'activiteTypeId' | 'email'>[]>([
      null,
      undefined,
      [],
      [{ activiteTypeId: 'grx', email: '' }],
      [{ activiteTypeId: 'gra', email: 'toto@foo.bar' }],
      [{ activiteTypeId: 'grx', email: 'toto@foo.bar' }],
    ])('qu’on envoie pas d’emails', administrationActiviteTypeEmail => {
      expect(
        titreActiviteAdministrationsEmailsGet(
          ['ope-onf-973-01'],
          administrationActiviteTypeEmail?.map(a => ({
            ...a,
            administrationId: 'ope-onf-973-01',
          })),
          'grx',
          undefined
        )
      ).toHaveLength(0)
    })

    test.each<[AdministrationId, boolean]>([
      [ADMINISTRATION_IDS["DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"], true],
      [ADMINISTRATION_IDS['DREAL - BRETAGNE'], true],
      [ADMINISTRATION_IDS['DEAL - LA RÉUNION'], true],
      [ADMINISTRATION_IDS['PRÉFECTURE - ALLIER'], false],
      [ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'], false],
      [ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'], false],
    ])('si la production est nulle on envoie des emails que aux ministères et au DREAL', (administrationId, envoie) => {
      expect(titreActiviteAdministrationsEmailsGet([administrationId], [{ activiteTypeId: 'grx', email: 'toto@foo.bar', administrationId }], 'grx', undefined)).toHaveLength(envoie ? 1 : 0)
    })
  })

  describe('teste le calcul de la production', () => {
    test.each<[string, boolean]>([
      ['pma', true],
      ['pmd', true],
      ['pmb', true],
      ['pmc', true],
      ['grx', false],
      ['wrp', false],
      ['grp', false],
      ['gra', false],
    ])('la production est positive sur les type d’activités sans exploitation', (typeId, positive) => {
      expect(productionCheck(typeId, undefined)).toEqual(!!positive)
    })

    test.each<[IContenu | undefined, boolean]>([
      [undefined, false],
      [{}, false],
      [{ substancesFiscales: {} }, false],
      [{ substancesFiscales: { auru: 0 } }, false],
      [{ substancesFiscales: { auru: 10 } }, true],
      [{ substancesFiscales: { iiii: 0, auru: 10 } }, true],
    ])('teste la production des GRX et GRA', (contenu, positive) => {
      ;['grx', 'gra'].forEach(typeId => expect(productionCheck(typeId, contenu)).toEqual(!!positive))
    })

    test.each<[IContenu | undefined, boolean]>([
      [undefined, false],
      [{}, false],
      [{ renseignements: {} }, false],
      [{ renseignements: { orExtrait: null } }, false],
      [{ renseignements: { orExtrait: 0 } }, false],
      [{ renseignements: { orExtrait: 232 } }, true],
    ])('teste la production des GRP', (contenu, positive) => {
      expect(productionCheck('grp', contenu)).toEqual(!!positive)
    })

    test.each<[IContenu | undefined, boolean]>([
      [undefined, false],
      [{}, false],
      [{ renseignementsProduction: {} }, false],
      [{ renseignementsProduction: { volumeGranulatsExtrait: 0 } }, false],
      [{ renseignementsProduction: { volumeGranulatsExtrait: 232 } }, true],
    ])('teste la production des WRP', (contenu, positive) => {
      expect(productionCheck('wrp', contenu)).toEqual(!!positive)
    })
  })
})
