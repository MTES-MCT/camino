import { dateValidate } from 'camino-common/src/date.js'
import { ITitreActivite, ITitreEtape } from '../../../types.js'

/**
 * Vérifie que les champs `date` d'une étape ou activité sont valides
 *
 * @param propsNames - Noms des propriétés date de l'étape ou activité
 * @param element - Étape ou activité dont on vérifie les propriétés date
 * @returns un tableau d'erreurs si au moins une date est invalide
 *
 */

export const propsDatesCheck = <T extends ITitreActivite | ITitreEtape>(propsNames: [keyof T], element: T) => {
  const errors = propsNames.reduce((errors: string[], propId) => {
    if (element[propId]) {
      const dateCheck = dateValidate(element[propId] as unknown as string)
      if (!dateCheck.valid) {
        errors.push(`le champ "${String(propId)}" n'est pas une date valide`)
      }
    }

    return errors
  }, [])

  if (errors.length) {
    return errors.join(', ')
  }

  return null
}
