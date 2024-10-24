import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { ITitreActivite } from '../../types'
import { titreActiviteStatutIdFind } from './titre-activite-statut-id-find'
import { describe, expect, test } from 'vitest'

const titreActiviteFermee = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.CLOTURE,
  date: '1000-01-01',
  typeId: 'gra',
} as ITitreActivite

const titreActiviteDeposee = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.DEPOSE,
  date: '1000-01-01',
  typeId: 'gra',
} as ITitreActivite

const titreActiviteAbsenteDelaiDepasse = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
  date: '1000-01-01',
  typeId: 'gra',
} as ITitreActivite

const titreActiviteEnCoursDelaiNonDepasse = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION,
  date: '3000-01-01',
  typeId: 'gra',
} as ITitreActivite

describe("statut d'une activité", () => {
  test('une activité dont le statut est “fermé" garde le statut "fermé"', () => {
    expect(titreActiviteStatutIdFind(titreActiviteFermee, '2020-12-31')).toEqual(titreActiviteFermee.activiteStatutId)
  })

  test('une activité dont le statut est “déposé" garde le statut "déposé"', () => {
    expect(titreActiviteStatutIdFind(titreActiviteDeposee, '2020-12-31')).toEqual(titreActiviteDeposee.activiteStatutId)
  })

  test('une activité dont statut est "abs" et le délai est dépassé a le statut “fermé', () => {
    expect(titreActiviteStatutIdFind(titreActiviteAbsenteDelaiDepasse, '2020-12-31')).toEqual('fer')
  })

  test('une activité dont le statut est "enc" dont le délai n\'est pas dépassé ne change pas de statut', () => {
    expect(titreActiviteStatutIdFind(titreActiviteEnCoursDelaiNonDepasse, '2020-12-31')).toEqual(titreActiviteEnCoursDelaiNonDepasse.activiteStatutId)
  })
})
