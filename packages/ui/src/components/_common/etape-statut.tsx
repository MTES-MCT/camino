import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Badge } from '../_ui/badge'
import { CouleurIllustrative } from 'camino-common/src/static/couleurs'
import { EtapeStatutId, EtapesStatuts, ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { AvisStatutId } from 'camino-common/src/static/avisTypes'

type Props = {
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
  [ETAPES_STATUTS.REJETE_DECISION_IMPLICITE]: 'purple-glycine',
  [ETAPES_STATUTS.TERMINE]: 'green-bourgeon',
  [ETAPES_STATUTS.NON_APPLICABLE]: 'beige-gris-galet',
  [ETAPES_STATUTS.PROGRAMME]: 'orange-terre-battue',
} as const satisfies Record<EtapeStatutId, CouleurIllustrative>

export const EtapeStatut: FunctionalComponent<Props> = (props: Props) => {
  const couleur = couleurParStatut[props.etapeStatutId]

  return <Badge ariaLabel={EtapesStatuts[props.etapeStatutId].nom} badgeColor={couleur} />
}

const avisStatutToEtapeStatut = {
  Favorable: ETAPES_STATUTS.FAVORABLE,
  Défavorable: ETAPES_STATUTS.DEFAVORABLE,
  'Favorable avec réserves': ETAPES_STATUTS.FAVORABLE_AVEC_RESERVE,
  'Non renseigné': ETAPES_STATUTS.NON_APPLICABLE,
} as const satisfies Record<AvisStatutId, EtapeStatutId>

export const AvisStatut: FunctionalComponent<{ avisStatutId: AvisStatutId }> = props => {
  const couleur = couleurParStatut[avisStatutToEtapeStatut[props.avisStatutId]]
  return <Badge ariaLabel={props.avisStatutId} badgeColor={couleur} />
}
