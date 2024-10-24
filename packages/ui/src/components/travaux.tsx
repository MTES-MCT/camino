import { FunctionalComponent } from 'vue'
import { Page } from './demarches/page'
import { routesDefinitions } from '@/router/routes'

export const Travaux: FunctionalComponent = () => {
  return <Page travaux={true} filtres={routesDefinitions.travaux.meta.filtres} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
Travaux.displayName = 'Travaux'
