import { IEtapeType } from '../../types'

import { titreEtapeTypeAndStatusValidate } from './titre-etape-type-and-status-validate'
import { titreEtapeDemarcheEtapeTypeFind } from '../utils/titre-etape-demarche-etape-type-find'

jest.mock('../utils/titre-etape-demarche-etape-type-find', () => ({
  titreEtapeDemarcheEtapeTypeFind: jest.fn()
}))

const titreEtapeDemarcheEtapeTypeFindMock = jest.mocked(
  titreEtapeDemarcheEtapeTypeFind,
  true
)

describe("valide le type et le statut d'une étape en fonction du type de titre et du type de démarche", () => {
  test('le statut est obligatoire', () => {
    expect(
      titreEtapeTypeAndStatusValidate(
        'mdp',
        undefined,
        [
          {
            id: 'mdp'
          }
        ] as IEtapeType[],
        ''
      )
    ).toEqual(['le statut est obligatoire'])
  })
  test("le type et le statut de l'étape correspondent au type de titre et de démarche", () => {
    titreEtapeDemarcheEtapeTypeFindMock.mockReturnValue({
      id: 'mdp'
    } as IEtapeType)

    expect(
      titreEtapeTypeAndStatusValidate(
        'mdp',
        'fai',
        [
          {
            id: 'mdp'
          }
        ] as IEtapeType[],
        ''
      )
    ).toHaveLength(0)
  })

  test("le statut de l'étape ne correspond pas au type de titre et de démarche", () => {
    titreEtapeDemarcheEtapeTypeFindMock.mockReturnValue({
      id: 'mdp'
    } as IEtapeType)
    expect(
      titreEtapeTypeAndStatusValidate(
        'mdp',
        'rej',
        [
          {
            id: 'mdp'
          }
        ] as IEtapeType[],
        'toto'
      )
    ).toEqual([
      'statut de l\'étape "rej" invalide pour une type d\'étape mdp pour une démarche de type toto'
    ])
  })

  test("le statut de l'étape ne correspond pas au type de titre et de démarche", () => {
    titreEtapeDemarcheEtapeTypeFindMock.mockImplementation(() => {
      throw new Error('erreur titreEtapeDemarcheEtapeTypeFind')
    })
    expect(
      titreEtapeTypeAndStatusValidate(
        'mdp',
        'rej',
        [
          {
            id: 'mdp'
          }
        ] as IEtapeType[],
        'toto'
      )
    ).toEqual(['erreur titreEtapeDemarcheEtapeTypeFind'])
  })
})
