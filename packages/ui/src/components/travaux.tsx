import { FunctionalComponent } from 'vue'
import { Page } from './demarches/page'

export const Travaux: FunctionalComponent = () => {
  return <Page travaux={true} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
Travaux.displayName = 'Travaux'
