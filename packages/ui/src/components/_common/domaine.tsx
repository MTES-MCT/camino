import { DomaineId, DOMAINES_IDS, Domaines } from 'camino-common/src/static/domaines'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { DsfrTag } from '../_ui/tag'

type Props = {
  domaineId?: DomaineId
} & HTMLAttributes

export const dsfrVariableCouleurParDomaine = {
  m: 'background-contrast-blue-ecume',
  w: 'background-contrast-blue-cumulus',
  c: 'background-contrast-green-archipel',
  h: 'background-contrast-green-bourgeon',
  f: 'background-contrast-yellow-tournesol',
  r: 'background-contrast-orange-terre-battue',
  g: 'background-contrast-pink-tuile',
  s: 'background-contrast-purple-glycine',
} as const satisfies Record<DomaineId, string>

export const couleurParDomaine = {
  m: '#e9edfe',
  w: '#e6eefe',
  c: '#c7f6fc',
  h: '#c9fcac',
  f: '#feecc2',
  r: '#fee9e5',
  g: '#fee9e7',
  s: '#fee7fc',
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
      style={{ minWidth: '2rem', backgroundColor: `var(--${dsfrVariableCouleurParDomaine[domaine]})`, color: 'black' }}
      label={domaine.toUpperCase()}
    />
  )
}
