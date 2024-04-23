import { expect, test } from 'vitest'
import { getEntrepriseDocuments } from './entrepriseDocuments'

test('getEntrepriseDocuments pas de documents', () => {
  expect(getEntrepriseDocuments('apm', 'amo', 'wfo')).toMatchInlineSnapshot('[]')
})

test('getEntrepriseDocuments', () => {
  expect(getEntrepriseDocuments('arm', 'oct', 'mfr')).toMatchInlineSnapshot(`
    [
      {
        "description": undefined,
        "id": "atf",
        "nom": "Attestation fiscale",
        "optionnel": false,
      },
      {
        "id": "sir",
        "nom": "Avis de situation au répertoire Sirene",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "cur",
        "nom": "Curriculum vitae",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "idm",
        "nom": "Identification de matériel",
        "optionnel": true,
      },
      {
        "description": undefined,
        "id": "jid",
        "nom": "Justificatif d’identité",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "jct",
        "nom": "Justificatif des capacités techniques",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "kbi",
        "nom": "Kbis",
        "optionnel": false,
      },
      {
        "description": undefined,
        "id": "jcf",
        "nom": "Justificatif des capacités financières",
        "optionnel": false,
      },
    ]
  `)

  expect(getEntrepriseDocuments('prr', 'oct', 'mfr')).toMatchInlineSnapshot(`
    [
      {
        "id": "atf",
        "nom": "Attestation fiscale",
        "optionnel": true,
      },
      {
        "id": "sir",
        "nom": "Avis de situation au répertoire Sirene",
        "optionnel": true,
      },
      {
        "id": "cur",
        "nom": "Curriculum vitae",
        "optionnel": true,
      },
      {
        "id": "idm",
        "nom": "Identification de matériel",
        "optionnel": true,
      },
      {
        "id": "jid",
        "nom": "Justificatif d’identité",
        "optionnel": true,
      },
      {
        "id": "jct",
        "nom": "Justificatif des capacités techniques",
        "optionnel": true,
      },
      {
        "id": "kbi",
        "nom": "Kbis",
        "optionnel": true,
      },
      {
        "id": "jcf",
        "nom": "Justificatif des capacités financières",
        "optionnel": true,
      },
    ]
  `)
})
