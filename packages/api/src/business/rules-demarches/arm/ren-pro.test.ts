import { demarcheEtatsValidate } from '../_utils.test'

describe('vérifie l’arbre de renonciation et de prolongation d’ARM', () => {
  const renProEtatsValidate = demarcheEtatsValidate('ren', 'arm', '2020-01-01')

  test('peut créer une étape "mdp" après une "mfr"', () => {
    expect(
      renProEtatsValidate([
        { typeId: 'mfr', date: '2020-05-27' },
        { typeId: 'mdp', date: '2020-05-30' }
      ])
    ).toHaveLength(0)
  })

  test('ne peut pas faire de "mod" après une "mcr"', () => {
    expect(
      renProEtatsValidate([
        { typeId: 'mfr', date: '2020-05-27' },
        { typeId: 'mdp', date: '2020-05-30' },
        { typeId: 'mcr', date: '2020-06-01' },
        { typeId: 'mod', date: '2020-06-03' }
      ])
    ).toEqual(['l’étape "mod" n’est pas possible juste après "mcr"'])
  })

  test('ne peut pas faire 2 "mco" d’affilée', () => {
    expect(
      renProEtatsValidate([
        { typeId: 'mfr', date: '2020-05-27' },
        { typeId: 'mdp', date: '2020-05-30' },
        { typeId: 'mca', date: '2020-06-03' },
        { typeId: 'mca' }
      ])
    ).toEqual(['l’étape "mca" ne peut-être effecutée 2 fois d’affilée'])
  })

  test('peut mettre une "aof" après une "eof"', () => {
    expect(
      renProEtatsValidate([
        { typeId: 'mfr', date: '2020-05-27' },
        { typeId: 'mdp', date: '2020-05-30' },
        { typeId: 'mcr', date: '2020-06-03', statutId: 'fav' },
        { typeId: 'eof', date: '2020-07-03' },
        { typeId: 'aof', date: '2020-07-03' }
      ])
    ).toHaveLength(0)
  })
})
