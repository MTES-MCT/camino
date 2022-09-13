import { contenusTitreEtapesIdsFind } from './props-titre-etapes-ids-find'
import { newDemarcheId } from '../../database/models/_format/id-create'

describe("liste des propriétés et les étapes qui en sont à l'origine", () => {
  test('trouve la liste des propriétés', () => {
    expect(
      contenusTitreEtapesIdsFind(
        'val',
        [
          {
            id: newDemarcheId('demarche-id'),
            titreId: 'titre-id',
            typeId: 'oct',
            statutId: 'acc',
            etapes: []
          }
        ],
        [{ elementId: 'mecanise', sectionId: 'arm' }]
      )
    ).toBeNull()
  })
})
