import { DomaineId, DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Pill } from '../_ui/pill'

export type Props = {
  domaineId?: DomaineId
} & HTMLAttributes

const couleurParDomaine = {
  m: 'background-contrast-blue-ecume',
  w: 'background-contrast-blue-cumulus',
  c: 'background-contrast-green-archipel',
  h: 'background-contrast-green-bourgeon',
  f: 'background-contrast-yellow-tournesol',
  r: 'background-contrast-orange-terre-battue',
  g: 'background-contrast-pink-tuile',
  s: 'background-contrast-purple-glycine',
} as const satisfies Record<DomaineId, string>

export const Domaine: FunctionalComponent<Props> = props => {
  let domaine = props.domaineId
  if (domaine === undefined) {
    domaine = DOMAINES_IDS.METAUX
  }
  return (
    <p class="fr-tag mono" style={{ backgroundColor: `var(--${couleurParDomaine[domaine]})`, color: 'black' }}>
      {domaine.toUpperCase()}
    </p>
  )
}
