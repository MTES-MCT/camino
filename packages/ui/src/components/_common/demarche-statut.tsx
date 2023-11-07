import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Badge } from '../_ui/badge'
import { CouleurIllustrative } from 'camino-common/src/static/couleurs'
import { DemarcheStatutId, DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'

export type Props = {
  demarcheStatutId: DemarcheStatutId
} & HTMLAttributes

const couleurParStatut = {
  eco: 'orange-terre-battue',
  dep: 'orange-terre-battue',
  ini: 'orange-terre-battue',
  ins: 'orange-terre-battue',
  fpm: 'green-bourgeon',
  acc: 'green-bourgeon',
  rej: 'purple-glycine',
  cls: 'beige-gris-galet',
  des: 'beige-gris-galet',
  ind: 'beige-gris-galet',
  ter: 'green-bourgeon',
} as const satisfies Record<DemarcheStatutId, CouleurIllustrative>

export const DemarcheStatut: FunctionalComponent<Props> = (props: Props) => {
  const couleur = couleurParStatut[props.demarcheStatutId]

  return <Badge ariaLabel={DemarchesStatuts[props.demarcheStatutId].nom} badgeColor={couleur} />
}
