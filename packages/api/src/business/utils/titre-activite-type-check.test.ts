import { toCommuneId } from 'camino-common/src/static/communes.js'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes.js'
import { titreActiviteTypeCheck } from './titre-activite-type-check.js'
import { describe, test, expect } from 'vitest'

describe("vérifie si un titre a des activités d'un certain type", () => {
  test("ne retourne aucun type d'activité relié à un pays sur un titre sans pays", () => {
    expect(
      titreActiviteTypeCheck(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], {
        typeId: 'axm',
        communes: [],
      })
    ).toEqual(false)
  })

  test("retourne un type d'activité sur un titre AXM de Guyane", () => {
    expect(
      titreActiviteTypeCheck(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], {
        typeId: 'axm',
        communes: [{ id: toCommuneId('97300') }],
      })
    ).toEqual(true)
  })

  test("ne retourne aucun type d'activité sur un titre AXM de métropole", () => {
    expect(titreActiviteTypeCheck(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], { typeId: 'axm', communes: [{ id: toCommuneId('72000') }] })).toEqual(false)
  })

  test("retourne un type d'activité sur un titre AXM de métropole", () => {
    expect(
      titreActiviteTypeCheck(ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration'], {
        typeId: 'prm',
        communes: [{ id: toCommuneId('72000') }],
      })
    ).toEqual(true)
  })

  test("ne retourne aucun type d'activité de titre AXM Guyane sur un titre PRM de métropole", () => {
    expect(
      titreActiviteTypeCheck(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], {
        typeId: 'prm',
        communes: [{ id: toCommuneId('72000') }],
      })
    ).toEqual(false)
  })

  test("retourne un type d'activité de titre  qui n'a pas de pays et qui est liée à un type de titre", () => {
    expect(
      titreActiviteTypeCheck(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"], {
        typeId: 'pxw',
        communes: [],
      })
    ).toEqual(true)
  })
})
