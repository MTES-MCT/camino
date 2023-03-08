import cryptoRandomString from 'crypto-random-string'
import { DemarcheId } from '../../../types.js'

export const idGenerate = <T extends string = string>(): T => cryptoRandomString({ length: 24, type: 'alphanumeric' }) as T

// TODO 2022-09-13 il faudrait ajouter un préfixe dédié aux démarche à l’id.
// pour pouvoir utiliser « is » de Typescript et controler qu’on ne met pas n’importe quel string dans cette méthode
export const newDemarcheId = (value: string = idGenerate()): DemarcheId => {
  return value as DemarcheId
}
