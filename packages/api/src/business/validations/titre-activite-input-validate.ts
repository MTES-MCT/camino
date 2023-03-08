import { ITitreActivite, ISection } from '../../types.js'

import { contenuNumbersCheck } from './utils/contenu-numbers-check.js'
import { propsDatesCheck } from './utils/props-dates-check.js'
import { contenuDatesCheck } from './utils/contenu-dates-check.js'

const datePropsNames = ['date'] as [keyof ITitreActivite]

export const titreActiviteInputValidate = (titreActivite: ITitreActivite, activiteSections: ISection[]) => {
  const errors = []

  // 1. le format des dates est correct
  const errorsDates = propsDatesCheck(datePropsNames, titreActivite)
  if (errorsDates) {
    errors.push(errorsDates)
  }

  if (titreActivite.contenu && activiteSections) {
    const errorsSections = contenuDatesCheck(activiteSections, titreActivite.contenu)
    if (errorsSections) {
      errors.push(errorsSections)
    }
  }

  // 3. les champs number n'ont pas de durée négative
  if (titreActivite.contenu && activiteSections) {
    const errorsContenu = contenuNumbersCheck(activiteSections, titreActivite.contenu)
    if (errorsContenu) {
      errors.push(errorsContenu)
    }
  }

  return errors
}
