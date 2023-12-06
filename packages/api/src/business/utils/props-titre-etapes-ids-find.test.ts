import { contenusTitreEtapesIdsFind } from './props-titre-etapes-ids-find.js'
import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create.js'
import { describe, test, expect } from 'vitest'

describe("liste des propriétés et les étapes qui en sont à l'origine", () => {
  test('trouve la liste des propriétés', () => {
    expect(
      contenusTitreEtapesIdsFind(
        'val',
        [
          {
            id: newDemarcheId('demarche-id'),
            titreId: newTitreId('titre-id'),
            typeId: 'oct',
            statutId: 'acc',
            etapes: [],
          },
        ],
        [{ elementId: 'mecanise', sectionId: 'arm' }]
      )
    ).toBeNull()
  })
})
