import { graphQLCall, queryImport } from '../../../tests/_utils/index'

import { dbManager } from '../../../tests/db-manager'
import { ADMINISTRATION_IDS } from 'camino-common/src/administrations'
import { Domaines, DOMAINES_IDS } from 'camino-common/src/domaines'

console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('administrationTitreTypeModifier', () => {
  const administrationTitreTypeModifierQuery = queryImport(
    'administration-titre-type-modifier'
  )

  test("ne peut pas modifier les types de titres d'une administration (anonyme)", async () => {
    const res = await graphQLCall(administrationTitreTypeModifierQuery, {
      administrationTitreType: {
        administrationId: ADMINISTRATION_IDS.BRGM,
        titreTypeId: 'arm',
        gestionnaire: true,
        associee: false
      }
    })

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test("modifie les types de titre d'une administration (un utilisateur 'super')", async () => {
    const res = await graphQLCall(
      administrationTitreTypeModifierQuery,
      {
        administrationTitreType: {
          administrationId: ADMINISTRATION_IDS.BRGM,
          titreTypeId: 'arm',
          gestionnaire: true,
          associee: false
        }
      },
      'super'
    )

    expect(res.body).toMatchObject({
      data: {
        administrationTitreTypeModifier: {
          id: ADMINISTRATION_IDS.BRGM,
          titresTypes: [
            {
              id: 'arm',
              gestionnaire: true,
              associee: false,
              domaine: {
                id: Domaines[DOMAINES_IDS.METAUX].id,
                nom: Domaines[DOMAINES_IDS.METAUX].nom
              }
            },
            { id: 'pcc', gestionnaire: null, associee: true }
          ]
        }
      }
    })
    expect(res.body.errors).toBeUndefined()
  })
})

describe('administrationTitreTypeModifier', () => {
  const administrationTitreTypeModifierQuery = queryImport(
    'administration-titre-type-modifier'
  )

  test("ne peut pas modifier les types de titres d'une administration (anonyme)", async () => {
    const res = await graphQLCall(administrationTitreTypeModifierQuery, {
      administrationTitreType: {
        administrationId: ADMINISTRATION_IDS.BRGM,
        titreTypeId: 'arm',
        gestionnaire: true,
        associee: false
      }
    })

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test("modifie les types de titre d'une administration (un utilisateur 'super')", async () => {
    const res = await graphQLCall(
      administrationTitreTypeModifierQuery,
      {
        administrationTitreType: {
          administrationId: ADMINISTRATION_IDS.BRGM,
          titreTypeId: 'arm',
          gestionnaire: true,
          associee: false
        }
      },
      'super'
    )

    expect(res.body).toMatchObject({
      data: {
        administrationTitreTypeModifier: {
          id: ADMINISTRATION_IDS.BRGM,
          titresTypes: [
            {
              id: 'arm',
              gestionnaire: true,
              associee: false,
              domaine: {
                id: Domaines[DOMAINES_IDS.METAUX].id,
                nom: Domaines[DOMAINES_IDS.METAUX].nom
              }
            },
            { id: 'pcc', gestionnaire: null, associee: true }
          ]
        }
      }
    })
    expect(res.body.errors).toBeUndefined()
  })
})

describe('administrationTitreTypeTitreStatutModifier', () => {
  const administrationTitreTypeTitreStatutModifierQuery = queryImport(
    'administration-titre-type-titre-statut-modifier'
  )

  test("ne peut pas modifier les types de titre / statuts de titre d'une administration (anonyme)", async () => {
    const res = await graphQLCall(
      administrationTitreTypeTitreStatutModifierQuery,
      {
        administrationTitreTypeTitreStatut: {
          administrationId: ADMINISTRATION_IDS.BRGM,
          titreTypeId: 'arm',
          titreStatutId: 'val',
          titresModificationInterdit: true,
          demarchesModificationInterdit: true,
          etapesModificationInterdit: true
        }
      }
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test("modifie les types de titre / statuts de titre d'une administration (un utilisateur 'super')", async () => {
    const res = await graphQLCall(
      administrationTitreTypeTitreStatutModifierQuery,
      {
        administrationTitreTypeTitreStatut: {
          administrationId: ADMINISTRATION_IDS.BRGM,
          titreTypeId: 'arm',
          titreStatutId: 'val',
          titresModificationInterdit: true,
          demarchesModificationInterdit: true,
          etapesModificationInterdit: true
        }
      },
      'super'
    )

    expect(res.body).toMatchObject({
      data: {
        administrationTitreTypeTitreStatutModifier: {
          id: ADMINISTRATION_IDS.BRGM,
          titresTypesTitresStatuts: [
            {
              titreType: { id: 'arm' },
              titreStatut: { id: 'val' },
              titresModificationInterdit: true,
              demarchesModificationInterdit: true,
              etapesModificationInterdit: true
            }
          ]
        }
      }
    })
    expect(res.body.errors).toBeUndefined()
  })
})

describe('administrationTitreTypeEtapeTypeModifier', () => {
  const administrationTitreTypeEtapeTypeModifierQuery = queryImport(
    'administration-titre-type-etape-type-modifier'
  )

  test("ne peut pas modifier les types de titre / types d'??tape d'une administration (anonyme)", async () => {
    const res = await graphQLCall(
      administrationTitreTypeEtapeTypeModifierQuery,
      {
        administrationTitreTypeEtapeType: {
          administrationId: ADMINISTRATION_IDS.BRGM,
          titreTypeId: 'arm',
          etapeTypeId: 'dex',
          lectureInterdit: true,
          modificationInterdit: true,
          creationInterdit: true
        }
      }
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test("modifie les types de titre / types d'??tape d'une administration (un utilisateur 'super')", async () => {
    const res = await graphQLCall(
      administrationTitreTypeEtapeTypeModifierQuery,
      {
        administrationTitreTypeEtapeType: {
          administrationId: ADMINISTRATION_IDS.BRGM,
          titreTypeId: 'arm',
          etapeTypeId: 'dex',
          lectureInterdit: true,
          modificationInterdit: true,
          creationInterdit: true
        }
      },
      'super'
    )

    expect(res.body).toMatchObject({
      data: {
        administrationTitreTypeEtapeTypeModifier: {
          id: ADMINISTRATION_IDS.BRGM,
          titresTypesEtapesTypes: [
            {
              titreType: { id: 'arm' },
              etapeType: { id: 'dex' },
              lectureInterdit: true,
              modificationInterdit: true,
              creationInterdit: true
            }
          ]
        }
      }
    })
    expect(res.body.errors).toBeUndefined()
  })
})
