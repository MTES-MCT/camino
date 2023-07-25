import { FunctionalComponent } from 'vue'
import { Page } from './demarches/page'

export const Demarches: FunctionalComponent = () => {
  return <Page travaux={false} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
Demarches.displayName = 'Demarches'
