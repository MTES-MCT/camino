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
  'titresTerritoires',
  'demarchesTypesIds',
  'demarchesStatutsIds',
  'etapesInclues',
  'etapesExclues',
] as const satisfies readonly CaminoFiltre[]

export const Demarches: FunctionalComponent = () => {
  return <Page travaux={false} filtres={filtres} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
Demarches.displayName = 'Demarches'
