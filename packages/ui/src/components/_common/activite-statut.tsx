import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Badge } from '../_ui/badge'
import { CouleurIllustrative } from 'camino-common/src/static/couleurs'
import { ActivitesStatutId, ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'

type Props = {
  activiteStatutId: ActivitesStatutId
} & HTMLAttributes

const couleurParStatut = {
  enc: 'orange-terre-battue',
  abs: 'purple-glycine',
  fer: 'beige-gris-galet',
  dep: 'green-bourgeon',
} as const satisfies Record<ActivitesStatutId, CouleurIllustrative>

export const ActiviteStatut: FunctionalComponent<Props> = (props: Props) => {
  const couleur = couleurParStatut[props.activiteStatutId]

  return <Badge ariaLabel={ActivitesStatuts[props.activiteStatutId].nom} badgeColor={couleur} />
}
