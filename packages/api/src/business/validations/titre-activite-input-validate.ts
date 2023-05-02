import { ITitreActivite } from '../../types.js'

import { contenuNumbersCheck } from './utils/contenu-numbers-check.js'
import { propsDatesCheck } from './utils/props-dates-check.js'
import { contenuDatesCheck } from './utils/contenu-dates-check.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'

const datePropsNames = ['date'] as [keyof ITitreActivite]

export const titreActiviteInputValidate = (titreActivite: ITitreActivite, activiteSections: DeepReadonly<Section[]>) => {
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
