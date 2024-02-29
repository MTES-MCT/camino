import { User } from '../roles.js'
import { ADMINISTRATION_IDS, AdministrationId } from '../static/administrations.js'
import { test, expect, describe } from 'vitest'
import { canDeleteActiviteDocument, canEditActivite, canReadActivites, canReadTitreActivites, isActiviteComplete, isActiviteDeposable, isActiviteDocumentsComplete } from './activites.js'
import { testBlankUser, TestUser } from '../tests-utils'
import { TITRES_TYPES_IDS, TitreTypeId } from '../static/titresTypes.js'
import { ActiviteDocumentTypeId, ActiviteDocumentTypeIds, DOCUMENTS_TYPES_IDS } from '../static/documentsTypes.js'
import { ACTIVITES_STATUTS_IDS, ActivitesStatutId } from '../static/activitesStatuts.js'
import { ACTIVITES_TYPES_IDS, ActivitesTypesId } from '../static/activitesTypes.js'
import { EntrepriseId, newEntrepriseId } from '../entreprise'

test.each<[User, boolean]>([
  [{ ...testBlankUser, role: 'super' }, true],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DEAL - GUADELOUPE'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    },
    false,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['PRÉFECTURE - ARDÈCHE'],
    },
    false,
  ],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS["DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"],
    },
    true,
  ],
  [{ ...testBlankUser, role: 'entreprise', entreprises: [] }, true],
  [{ ...testBlankUser, role: 'bureau d’études', entreprises: [] }, false],
  [{ ...testBlankUser, role: 'defaut' }, false],
])('utilisateur %s peur voir les activités: %s', async (user, lecture) => {
  expect(canReadActivites(user)).toBe(lecture)
})

describe('canEditActivite', () => {
  test("l'ONF, le BRGM ne peuvent pas éditer (ni voir) les activités", async () => {
    expect(
      await canEditActivite(
        { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'] },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES),
        () => Promise.resolve([ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]),
        () => Promise.resolve([]),
        ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION
      )
    ).toBe(false)

    expect(
      await canEditActivite(
        { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES),
        () => Promise.resolve([ADMINISTRATION_IDS.BRGM]),
        () => Promise.resolve([]),
        ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION
      )
    ).toBe(false)
  })

  test('La préfecture de Guyane peut éditer les activités', async () => {
    expect(
      await canEditActivite(
        { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'] },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES),
        () => Promise.resolve([ADMINISTRATION_IDS['PRÉFECTURE - GUYANE']]),
        () => Promise.resolve([]),
        ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION
      )
    ).toBe(true)
  })
})

describe('canDeleteActiviteDocument', () => {
  test.each<[ActiviteDocumentTypeId, ActivitesStatutId, ActivitesTypesId, boolean]>([
    ['rie', 'enc', 'pma', true],
    ['rgr', 'enc', 'wrp', true],
    ['rie', 'dep', 'pma', true],
    ['rgr', 'dep', 'wrp', false],
  ])('vérifie la possibilité de supprimer un document optionnel ou non d’une activité (utilisateur super)', async (documentTypeId, activiteStatutId, activiteTypeId, suppression) => {
    expect(canDeleteActiviteDocument(documentTypeId, activiteTypeId, activiteStatutId)).toBe(suppression)
  })
})

describe('canReadTitreActivites', () => {
  const entrepriseId = newEntrepriseId('entrepriseId')

  test.each<[TestUser, TitreTypeId, AdministrationId[], EntrepriseId[], boolean]>([
    [{ role: 'defaut' }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], false],
    [{ role: 'super' }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], true],
    [{ role: 'bureau d’études', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], false],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], false],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], true],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], true],
    [{ role: 'editeur', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], true],
    [{ role: 'lecteur', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], false],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [], [], true],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [], [], false],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [ADMINISTRATION_IDS['DGCL/SDFLAE/FL1']], [], true],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['PRÉFECTURE - ARDÈCHE'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [ADMINISTRATION_IDS['PRÉFECTURE - ARDÈCHE']], [], false],
  ])('vérifie la possibilité de consulter les activités d un titre', async (user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, readable) => {
    expect(
      await canReadTitreActivites(
        { ...testBlankUser, ...user },
        () => Promise.resolve(titreTypeId),
        () => Promise.resolve(titresAdministrationsLocales),
        () => Promise.resolve(entreprisesTitulairesOuAmodiataires)
      )
    ).toBe(readable)
  })
})

describe('canEditActivite', () => {
  const entrepriseId = newEntrepriseId('entrepriseId')

  test.each<[TestUser, TitreTypeId, AdministrationId[], EntrepriseId[], ActivitesStatutId, boolean]>([
    [{ role: 'defaut' }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], ACTIVITES_STATUTS_IDS.ABSENT, false],
    [{ role: 'super' }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], ACTIVITES_STATUTS_IDS.ABSENT, true],
    [{ role: 'bureau d’études', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], ACTIVITES_STATUTS_IDS.ABSENT, false],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], ACTIVITES_STATUTS_IDS.ABSENT, false],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], ACTIVITES_STATUTS_IDS.ABSENT, true],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, true],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], ACTIVITES_STATUTS_IDS.DEPOSE, false],
    [{ role: 'entreprise', entreprises: [{ id: entrepriseId, nom: 'nom' }] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [entrepriseId], ACTIVITES_STATUTS_IDS.CLOTURE, false],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], ACTIVITES_STATUTS_IDS.ABSENT, true],
    [{ role: 'editeur', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], ACTIVITES_STATUTS_IDS.ABSENT, true],
    [{ role: 'lecteur', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, [], [], ACTIVITES_STATUTS_IDS.ABSENT, false],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [], [], ACTIVITES_STATUTS_IDS.ABSENT, false],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [], [], ACTIVITES_STATUTS_IDS.ABSENT, false],
    [{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] }, TITRES_TYPES_IDS.CONCESSION_FOSSILES, [ADMINISTRATION_IDS['DGCL/SDFLAE/FL1']], [], ACTIVITES_STATUTS_IDS.ABSENT, true],
    [
      { role: 'admin', administrationId: ADMINISTRATION_IDS['PRÉFECTURE - ARDÈCHE'] },
      TITRES_TYPES_IDS.CONCESSION_FOSSILES,
      [ADMINISTRATION_IDS['PRÉFECTURE - ARDÈCHE']],
      [],
      ACTIVITES_STATUTS_IDS.ABSENT,
      false,
    ],
  ])('vérifie la possibilité de éditer les activités d un titre', async (user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, activiteStatutId, readable) => {
    expect(
      await canEditActivite(
        { ...testBlankUser, ...user },
        () => Promise.resolve(titreTypeId),
        () => Promise.resolve(titresAdministrationsLocales),
        () => Promise.resolve(entreprisesTitulairesOuAmodiataires),
        activiteStatutId
      )
    ).toBe(readable)
  })
})

describe('isActiviteDocumentsComplete', () => {
  test('aucun doc n est liable pour les rapport trimestrie de guyane', () => {
    expect(isActiviteDocumentsComplete([], ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"])).toEqual({ valid: true })
    expect(isActiviteDocumentsComplete([{ activite_document_type_id: ActiviteDocumentTypeIds[0] }], ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"])).toMatchInlineSnapshot(`
      {
        "errors": [
          "impossible de lier un document",
        ],
        "valid": false,
      }
    `)
  })

  test("le rapport social et économique d'exploration est optionnel", () => {
    expect(isActiviteDocumentsComplete([], ACTIVITES_TYPES_IDS["rapport social et économique d'exploration"])).toEqual({ valid: true })
    expect(isActiviteDocumentsComplete([{ activite_document_type_id: 'ree' }], ACTIVITES_TYPES_IDS["rapport social et économique d'exploration"])).toEqual({ valid: true })
  })

  test("le rapport d'exploitation (permis et concessions W) esr obligatoire", () => {
    expect(isActiviteDocumentsComplete([], ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"])).toMatchInlineSnapshot(`
      {
        "errors": [
          "le document \\"rgr\\" est obligatoire",
        ],
        "valid": false,
      }
    `)
    expect(isActiviteDocumentsComplete([{ activite_document_type_id: 'rgr' }], ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"])).toMatchInlineSnapshot(`
      {
        "valid": true,
      }
    `)
  })
})

describe('isActiviteDeposable', () => {
  test('Seules les activités en construction sont déposables', async () => {
    expect(
      await isActiviteDeposable(
        { ...testBlankUser, role: 'super' },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX),
        () => Promise.resolve([]),
        () => Promise.resolve([]),
        { activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, type_id: 'grp', sections_with_value: [] },
        []
      )
    ).toEqual(true)
    expect(
      await isActiviteDeposable(
        { ...testBlankUser, role: 'super' },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX),
        () => Promise.resolve([]),
        () => Promise.resolve([]),
        { activite_statut_id: ACTIVITES_STATUTS_IDS.DEPOSE, type_id: 'grp', sections_with_value: [] },
        []
      )
    ).toEqual(false)
  })

  test('Seules les activités éditables sont déposables', async () => {
    expect(
      await isActiviteDeposable(
        { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX),
        () => Promise.resolve([]),
        () => Promise.resolve([]),
        { activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, type_id: 'grp', sections_with_value: [] },
        []
      )
    ).toEqual(true)
    expect(
      await isActiviteDeposable(
        { ...testBlankUser, role: 'lecteur', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX),
        () => Promise.resolve([]),
        () => Promise.resolve([]),
        { activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, type_id: 'grp', sections_with_value: [] },
        []
      )
    ).toEqual(false)
  })

  test('Seules les activités complètes sont déposables', async () => {
    expect(
      await isActiviteDeposable(
        { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX),
        () => Promise.resolve([]),
        () => Promise.resolve([]),
        { activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, type_id: ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], sections_with_value: [] },
        [{ activite_document_type_id: DOCUMENTS_TYPES_IDS.rapportAnnuelDExploitation }]
      )
    ).toEqual(true)
    expect(
      await isActiviteDeposable(
        { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['DGALN/DEB/EARM2'] },
        () => Promise.resolve(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX),
        () => Promise.resolve([]),
        () => Promise.resolve([]),
        { activite_statut_id: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, type_id: ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], sections_with_value: [] },
        []
      )
    ).toEqual(false)
  })
})

describe('isActiviteComplete', () => {
  test('Une activité est complète si toutes ses sections sont complètes ', () => {
    expect(
      isActiviteComplete(
        [{ nom: 'section', elements: [{ type: 'text', nom: 'element', optionnel: false, value: 'une valeur' }] }],
        ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"],
        []
      )
    ).toMatchInlineSnapshot(`
      {
        "valid": true,
      }
    `)
    expect(
      isActiviteComplete([{ nom: 'section', elements: [{ type: 'text', nom: 'element', optionnel: false, value: '' }] }], ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [])
    ).toMatchInlineSnapshot(`
      {
        "errors": [
          "l’élément \\"element\\" de la section \\"section\\" est obligatoire",
        ],
        "valid": false,
      }
    `)
  })
  test('Une activité est complète si tous les documents obligatoires sont renseignés ', () => {
    expect(isActiviteComplete([], ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], [{ activite_document_type_id: 'rgr' }])).toMatchInlineSnapshot(`
      {
        "valid": true,
      }
    `)
    expect(isActiviteComplete([], ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], [])).toMatchInlineSnapshot(`
      {
        "errors": [
          "le document \\"rgr\\" est obligatoire",
        ],
        "valid": false,
      }
    `)
  })
})
