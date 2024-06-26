import { FunctionalComponent, HTMLAttributes } from 'vue'
import { TitreStatutId, TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { Badge } from '../_ui/badge'
import { CouleurIllustrative } from 'camino-common/src/static/couleurs'

type Props = {
  titreStatutId: TitreStatutId
} & HTMLAttributes

const couleurParStatut = {
  dmc: 'beige-gris-galet',
  dmi: 'orange-terre-battue',
  ech: 'beige-gris-galet',
  ind: 'beige-gris-galet',
  mod: 'green-bourgeon',
  sup: 'green-bourgeon',
  val: 'green-bourgeon',
} as const satisfies Record<TitreStatutId, CouleurIllustrative>

export const TitreStatut: FunctionalComponent<Props> = (props: Props) => {
  const couleur = couleurParStatut[props.titreStatutId]

  return <Badge ariaLabel={TitresStatuts[props.titreStatutId].nom} badgeColor={couleur} />
}
