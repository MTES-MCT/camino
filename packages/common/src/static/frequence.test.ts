import { FREQUENCES_IDS, getPeriode } from './frequence'

test('getPeriode', () => {
  expect(Object.values(FREQUENCES_IDS).map(frequenceId => [...Array(13).keys()].map(periodeId => getPeriode(frequenceId, periodeId)))).toMatchSnapshot()
})
