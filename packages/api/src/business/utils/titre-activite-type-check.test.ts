import { toCommuneId } from 'camino-common/src/static/communes.js'
import { ActiviteTypeReduced, titreActiviteTypeCheck } from './titre-activite-type-check.js'
import { describe, test, expect } from 'vitest'

const activiteTypeMAxmPxmGuyane: ActiviteTypeReduced = {
  titresTypes: [{ id: 'axm' }, { id: 'pxm' }],
  activitesTypesPays: [{ paysId: 'GF' }],
}

describe("vérifie si un titre a des activités d'un certain type", () => {
  test("ne retourne aucun type d'activité relié à un pays sur un titre sans pays", () => {
    expect(
      titreActiviteTypeCheck(activiteTypeMAxmPxmGuyane, {
        typeId: 'axm',
        communes: [],
      })
    ).toEqual(false)
  })

  test("retourne un type d'activité sur un titre AXM de Guyane", () => {
    expect(
      titreActiviteTypeCheck(activiteTypeMAxmPxmGuyane, {
        typeId: 'axm',
        communes: [{ id: toCommuneId('97300') }],
      })
    ).toEqual(true)
  })

  test("ne retourne aucun type d'activité sur un titre AXM de métropole", () => {
    expect(titreActiviteTypeCheck(activiteTypeMAxmPxmGuyane, { typeId: 'axm', communes: [{ id: toCommuneId('72000') }] })).toEqual(false)
  })

  test("retourne un type d'activité sur un titre AXM de métropole", () => {
    expect(
      titreActiviteTypeCheck(
        {
          titresTypes: [{ id: 'prm' }],
          activitesTypesPays: [{ paysId: 'FR' }],
        },
        {
          typeId: 'prm',
          communes: [{ id: toCommuneId('72000') }],
        }
      )
    ).toEqual(true)
  })

  test("ne retourne aucun type d'activité de titre AXM Guyane sur un titre PRM de métropole", () => {
    expect(
      titreActiviteTypeCheck(activiteTypeMAxmPxmGuyane, {
        typeId: 'prm',
        communes: [{ id: toCommuneId('72000') }],
      })
    ).toEqual(false)
  })

  test("retourne un type d'activité de titre  qui n'a pas de pays et qui est liée à un type de titer", () => {
    expect(
      titreActiviteTypeCheck(
        {
          titresTypes: [{ id: 'prw' }],
          activitesTypesPays: [],
        },
        {
          typeId: 'prw',
          communes: [],
        }
      )
    ).toEqual(true)
  })
})
