import {
  ADMINISTRATION_TYPES,
  Administrations
} from 'camino-common/src/administrations'
import { IAdministration } from '../../../types'
import { Regions } from 'camino-common/src/region'
import { Departements } from 'camino-common/src/departement'

export const fillAdministrations = (
  administrations: IAdministration[] | null | undefined
) => {
  if (administrations) {
    for (const administration of administrations) {
      fillAdministrationInPlace(administration)
    }
  }
}

// Objection n'aime pas quand on change les références, faites très attention ici
export const fillAdministrationInPlace = (
  administration: IAdministration
): void => {
  const adminis = Administrations[administration.id]

  for (const key in Object.keys(adminis)) {
    administration[key] = adminis[key]
  }

  administration.type = ADMINISTRATION_TYPES[adminis.type_id]

  if (adminis.departement_id) {
    const departement = Departements[adminis.departement_id]
    if (administration.departement) {
      for (const key in Object.keys(departement)) {
        administration.departement[key] = departement[key]
      }
    }
  }
  if (adminis.region_id) {
    const region = Regions[adminis.region_id]
    if (administration.region) {
      for (const key in Object.keys(region)) {
        administration.region[key] = region[key]
      }
    }
  }
}
