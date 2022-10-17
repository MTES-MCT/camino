import { getDocuments } from './titresTypes_demarchesTypes_etapesTypes'

test('getDocuments erreurs', () => {
  expect(() => getDocuments()).toThrowErrorMatchingInlineSnapshot(
    `"il manque des éléments pour trouver les documents domaineId: 'undefined', titreTypeType: undefined, demarcheId: undefined, etapeTypeId: undefined"`
  )
})

test('getDocuments pas de surcharge mais pas de documents', () => {
  expect(getDocuments('ap', 'm', 'amo', 'abs')).toMatchInlineSnapshot(`Array []`)
})

test('getDocuments pas de surcharge', () => {
  expect(getDocuments('ap', 'm', 'amo', 'wfo')).toMatchInlineSnapshot(`
    Array [
      Object {
        "id": "dcl",
        "nom": "Déclaration",
        "optionnel": true,
      },
    ]
  `)
})

test('getDocuments surcharge', () => {
  expect(getDocuments('ax', 'm', 'oct', 'dae')).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": undefined,
        "id": "arp",
        "nom": "Arrêté préfectoral",
        "optionnel": false,
      },
      Object {
        "id": "arr",
        "nom": "Arrêté",
        "optionnel": true,
      },
      Object {
        "id": "dep",
        "nom": "Décision cas par cas",
        "optionnel": true,
      },
      Object {
        "id": "let",
        "nom": "Lettre",
        "optionnel": true,
      },
      Object {
        "id": "ndd",
        "nom": "Notification de décision",
        "optionnel": true,
      },
    ]
  `)

  expect(getDocuments('ax', 'm', 'oct', 'mfr')).toMatchSnapshot()

  expect(getDocuments('ax', 'm', 'oct', 'dae')).not.toEqual(getDocuments('ax', 'm', 'ces', 'dae'))
})
