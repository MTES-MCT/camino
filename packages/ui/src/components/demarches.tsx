import { FunctionalComponent } from 'vue'
import { Page } from './demarches/page'
import { routesDefinitions } from '@/router/routes'

export const Demarches: FunctionalComponent = () => {
  return <Page travaux={false} filtres={routesDefinitions.demarches.meta.filtres} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
Demarches.displayName = 'Demarches'
