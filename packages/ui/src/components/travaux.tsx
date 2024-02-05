import { FunctionalComponent } from 'vue'
import { Page } from './demarches/page'
import { CaminoFiltre } from 'camino-common/src/filters'

export const filtres = [
  'titresIds',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'travauxTypesIds',
  'demarchesStatutsIds',
  'etapesInclues',
  'etapesExclues',
] as const satisfies readonly CaminoFiltre[]

export const Travaux: FunctionalComponent = () => {
  return <Page travaux={true} filtres={filtres} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
Travaux.displayName = 'Travaux'
