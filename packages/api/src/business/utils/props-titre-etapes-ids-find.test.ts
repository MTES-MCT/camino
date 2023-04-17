import { contenusTitreEtapesIdsFind } from './props-titre-etapes-ids-find.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, test, expect } from 'vitest'

describe("liste des propriétés et les étapes qui en sont à l'origine", () => {
  test('trouve la liste des propriétés', () => {
    expect(
      contenusTitreEtapesIdsFind(
        toCaminoDate('2023-04-06'),
        'val',
        [
          {
            id: newDemarcheId('demarche-id'),
            titreId: 'titre-id',
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
