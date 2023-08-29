import { getSections, sectionValidator } from './sections.js'
import { test, expect } from 'vitest'

test('getSections erreurs', () => {
  expect(() => getSections(undefined, undefined, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"il manque des éléments pour trouver les sections titreTypeId: \'undefined\', demarcheId: undefined, etapeTypeId: undefined"'
  )
})

test('getSections pas de surcharge mais pas de sections', () => {
  expect(getSections('apm', 'amo', 'abs')).toMatchInlineSnapshot('[]')
})

test('getSections surcharge', () => {
  expect(getSections('arm', 'oct', 'rde')).toMatchInlineSnapshot(`
    [
      {
        "elements": [
          {
            "description": "Nombre de franchissements de cours d'eau",
            "id": "franchissements",
            "nom": "Franchissements de cours d'eau",
            "optionnel": true,
            "type": "integer",
          },
        ],
        "id": "arm",
        "nom": "Caractéristiques ARM",
      },
      {
        "elements": [
          {
            "description": "Numéro de dossier DEAL Service eau",
            "id": "numero-dossier-deal-eau",
            "nom": "Numéro de dossier",
            "optionnel": true,
            "type": "text",
          },
          {
            "description": "Numéro de récépissé émis par la DEAL Service eau",
            "id": "numero-recepisse",
            "nom": "Numéro de récépissé",
            "optionnel": true,
            "type": "text",
          },
        ],
        "id": "deal",
        "nom": "DEAL",
      },
    ]
  `)
})

test('sectionValidator prod', () => {
  expect(
    sectionValidator.parse({
      id: 'travaux',
      nom: 'Statut des travaux',
      elements: [
        {
          id: '4',
          nom: 'Avril',
          type: 'checkboxes',
          options: [
            {
              id: 'nonDebutes',
              nom: 'non débutés',
            },
            {
              id: 'exploitationEnCours',
              nom: 'exploitation en cours',
            },
            {
              id: 'arretTemporaire',
              nom: 'arrêt temporaire',
            },
            {
              id: 'rehabilitation',
              nom: 'réhabilitation',
            },
            {
              id: 'arretDefinitif',
              nom: 'arrêt définitif (après réhabilitation)',
            },
          ],
        },
        {
          id: '5',
          nom: 'Mai',
          type: 'checkboxes',
          options: [
            {
              id: 'nonDebutes',
              nom: 'non débutés',
            },
            {
              id: 'exploitationEnCours',
              nom: 'exploitation en cours',
            },
            {
              id: 'arretTemporaire',
              nom: 'arrêt temporaire',
            },
            {
              id: 'rehabilitation',
              nom: 'réhabilitation',
            },
            {
              id: 'arretDefinitif',
              nom: 'arrêt définitif (après réhabilitation)',
            },
          ],
        },
        {
          id: '6',
          nom: 'Juin',
          type: 'checkboxes',
          options: [
            {
              id: 'nonDebutes',
              nom: 'non débutés',
            },
            {
              id: 'exploitationEnCours',
              nom: 'exploitation en cours',
            },
            {
              id: 'arretTemporaire',
              nom: 'arrêt temporaire',
            },
            {
              id: 'rehabilitation',
              nom: 'réhabilitation',
            },
            {
              id: 'arretDefinitif',
              nom: 'arrêt définitif (après réhabilitation)',
            },
          ],
        },
      ],
    })
  )
})
