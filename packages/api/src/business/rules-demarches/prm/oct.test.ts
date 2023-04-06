import { toCaminoDate } from 'camino-common/src/date.js'
import { demarcheEtatsValidate } from '../_utils.test.js'
import { describe, expect, test } from 'vitest'
describe('vérifie l’arbre d’octroi d’une PRM', () => {
  const octEtatsValidate = demarcheEtatsValidate('oct', 'prm', toCaminoDate('2020-01-01'))

  test('ne peut pas créer une "rpu" après une "dex" rejetée', () => {
    expect(
      octEtatsValidate([
        { typeId: 'mfr', date: toCaminoDate('2020-01-01') },
        { typeId: 'mdp', date: toCaminoDate('2020-01-02') },
        { typeId: 'spp', date: toCaminoDate('2020-01-03') },
        { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2020-01-04') },
        { typeId: 'anf', date: toCaminoDate('2020-01-05') },
        { typeId: 'mec', date: toCaminoDate('2020-01-06') },
        { typeId: 'ppu', date: toCaminoDate('2020-01-07') },
        { typeId: 'ppc', date: toCaminoDate('2020-01-08') },
        { typeId: 'scl', date: toCaminoDate('2020-01-07') },
        { typeId: 'ssr', date: toCaminoDate('2020-01-07') },
        { typeId: 'spo', date: toCaminoDate('2020-01-08') },
        { typeId: 'apo', date: toCaminoDate('2020-01-09') },
        { typeId: 'apd', date: toCaminoDate('2020-01-10') },
        { typeId: 'app', date: toCaminoDate('2020-01-11') },
        { typeId: 'scg', date: toCaminoDate('2020-01-12') },
        { typeId: 'rcg', date: toCaminoDate('2020-01-13') },
        { typeId: 'acg', date: toCaminoDate('2020-01-14') },
        { typeId: 'sas', date: toCaminoDate('2020-01-15') },
        { typeId: 'dex', statutId: 'rej', date: toCaminoDate('2020-01-16') },
        { typeId: 'npp', date: toCaminoDate('2020-01-17') },
        { typeId: 'mno', date: toCaminoDate('2020-01-18') },
        { typeId: 'rpu', date: toCaminoDate('2020-01-19') },
      ])
    ).toMatchInlineSnapshot(`
      [
        "l’étape \\"rpu\\" n’est pas possible après \\"ssr\\", \\"scl\\", \\"spo\\", \\"apo\\", \\"npp\\", \\"mno\\"",
      ]
    `)
  })

  test('peut créer une "rpu" après une "dex" acceptée', () => {
    expect(
      octEtatsValidate([
        { typeId: 'mfr', date: toCaminoDate('2020-01-01') },
        { typeId: 'mdp', date: toCaminoDate('2020-01-02') },
        { typeId: 'spp', date: toCaminoDate('2020-01-03') },
        { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2020-01-04') },
        { typeId: 'anf', date: toCaminoDate('2020-01-05') },
        { typeId: 'mec', date: toCaminoDate('2020-01-06') },
        { typeId: 'ppu', date: toCaminoDate('2020-01-07') },
        { typeId: 'ppc', date: toCaminoDate('2020-01-08') },
        { typeId: 'scl', date: toCaminoDate('2020-01-07') },
        { typeId: 'ssr', date: toCaminoDate('2020-01-07') },
        { typeId: 'spo', date: toCaminoDate('2020-01-08') },
        { typeId: 'apo', date: toCaminoDate('2020-01-09') },
        { typeId: 'apd', date: toCaminoDate('2020-01-10') },
        { typeId: 'app', date: toCaminoDate('2020-01-11') },
        { typeId: 'scg', date: toCaminoDate('2020-01-12') },
        { typeId: 'rcg', date: toCaminoDate('2020-01-13') },
        { typeId: 'acg', date: toCaminoDate('2020-01-14') },
        { typeId: 'sas', date: toCaminoDate('2020-01-15') },
        { typeId: 'dex', statutId: 'acc', date: toCaminoDate('2020-01-16') },
        { typeId: 'dpu', statutId: 'acc', date: toCaminoDate('2020-01-17') },
        { typeId: 'npp', date: toCaminoDate('2020-01-18') },
        { typeId: 'mno', date: toCaminoDate('2020-01-19') },
        { typeId: 'rpu', date: toCaminoDate('2020-01-19') },
      ])
    ).toHaveLength(0)
  })

  test('peut créer une participation du public (ppu) directement après une recevabilité de la demande fav (mcr)', () => {
    expect(
      octEtatsValidate([
        { typeId: 'mfr', date: toCaminoDate('2020-01-01') },
        { typeId: 'mdp', date: toCaminoDate('2020-01-02') },
        { typeId: 'spp', date: toCaminoDate('2020-01-03') },
        { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2020-01-04') },
        { typeId: 'ppu', date: toCaminoDate('2020-01-07') },
      ])
    ).toHaveLength(0)
  })

  test('la saisine de la commission départementale des mines (spo) est optionnelle', () => {
    expect(
      octEtatsValidate([
        { typeId: 'mfr', date: toCaminoDate('2020-01-01') },
        { typeId: 'mdp', date: toCaminoDate('2020-01-02') },
        { typeId: 'spp', date: toCaminoDate('2020-01-03') },
        { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2020-01-04') },
        { typeId: 'anf', date: toCaminoDate('2020-01-05') },
        { typeId: 'mec', date: toCaminoDate('2020-01-06') },
        { typeId: 'ppu', date: toCaminoDate('2020-01-07') },
        { typeId: 'ppc', date: toCaminoDate('2020-01-08') },
        { typeId: 'scl', date: toCaminoDate('2020-01-07') },
        { typeId: 'ssr', date: toCaminoDate('2020-01-07') },
        { typeId: 'apd', date: toCaminoDate('2020-01-09') },
      ])
    ).toHaveLength(0)
  })
})
