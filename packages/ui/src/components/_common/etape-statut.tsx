import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Badge } from '../_ui/badge'
import { CouleurIllustrative } from 'camino-common/src/static/couleurs'
import { EtapeStatutId, EtapesStatuts, ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'

export type Props = {
  etapeStatutId: EtapeStatutId
} & HTMLAttributes

const couleurParStatut = {
  [ETAPES_STATUTS.ACCEPTE]: 'green-bourgeon',
  [ETAPES_STATUTS.DEFAVORABLE_AVEC_RESERVES]: 'purple-glycine',
  [ETAPES_STATUTS.EN_COURS]: 'orange-terre-battue',
  [ETAPES_STATUTS.FAIT]: 'green-bourgeon',
  [ETAPES_STATUTS.DEPOSE]: 'green-bourgeon',
  [ETAPES_STATUTS.EXEMPTE]: 'beige-gris-galet',
  [ETAPES_STATUTS.REQUIS]: 'orange-terre-battue',
  [ETAPES_STATUTS.COMPLETE]: 'green-bourgeon',
  [ETAPES_STATUTS.INCOMPLETE]: 'purple-glycine',
  [ETAPES_STATUTS.FAVORABLE]: 'green-bourgeon',
  [ETAPES_STATUTS.DEFAVORABLE]: 'purple-glycine',
  [ETAPES_STATUTS.FAVORABLE_AVEC_RESERVE]: 'green-bourgeon',
  [ETAPES_STATUTS.AJOURNE]: 'orange-terre-battue',
  [ETAPES_STATUTS.REJETE]: 'purple-glycine',
  [ETAPES_STATUTS.TERMINE]: 'green-bourgeon',
  [ETAPES_STATUTS.EN_CONSTRUCTION]: 'orange-terre-battue',
  [ETAPES_STATUTS.NON_APPLICABLE]: 'beige-gris-galet',
  [ETAPES_STATUTS.PROGRAMME]: 'orange-terre-battue',
} as const satisfies Record<EtapeStatutId, CouleurIllustrative>

// FIXME utiliser dans les filtres et dans l'affichage des étapes sur la page d'un titre
export const EtapeStatut: FunctionalComponent<Props> = (props: Props) => {
  const couleur = couleurParStatut[props.etapeStatutId]

  return <Badge ariaLabel={EtapesStatuts[props.etapeStatutId].nom} badgeColor={couleur} />
}
