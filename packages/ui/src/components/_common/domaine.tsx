import { DomaineId, DOMAINES_IDS, Domaines } from 'camino-common/src/static/domaines'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { DsfrTag } from '../_ui/tag'

export type Props = {
  domaineId?: DomaineId
} & HTMLAttributes

export const couleurParDomaine = {
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
    <DsfrTag
      class="mono"
      ariaLabel={`Domaine ${Domaines[domaine].nom}`}
      style={{ minWidth: '2rem', backgroundColor: `var(--${couleurParDomaine[domaine]})`, color: 'black' }}
      label={domaine.toUpperCase()}
    />
  )
}
