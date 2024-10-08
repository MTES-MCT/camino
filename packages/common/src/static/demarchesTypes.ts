import { Definition } from '../definition'
import { z } from 'zod'
import { DemarcheStatutId, demarcheStatutIdsSuccess } from './demarchesStatuts'
export interface DemarcheType<T = DemarcheTypeId> extends Definition<T> {
  titulaires: boolean
  renouvelable: boolean
  travaux: boolean
  substances: boolean
  points: boolean
  duree: boolean
  exception: boolean
  auto: boolean
}

const defaultOptions: { [key in keyof Omit<DemarcheType<DemarcheTypeId>, keyof Definition<DemarcheTypeId>>]: false } = {
  titulaires: false,
  renouvelable: false,
  travaux: false,
  substances: false,
  points: false,
  duree: false,
  exception: false,
  auto: false,
}

// prettier-ignore
const IDS = ['amo', 'aom', 'ces', 'con', 'dam', 'dec', 'dep', 'dot', 'exp', 'exs', 'fus', 'mut', 'oct', 'pr1', 'pr2', 'pre', 'pro', 'prr', 'ren', 'res', 'ret', 'vct', 'vut',] as const

export const DEMARCHES_TYPES_IDS = {
  Amodiation: 'amo',
  AutorisationDOuvertureDeTravaux: 'aom',
  Cession: 'ces',
  Conversion: 'con',
  DeclarationDArretDefinitifDesTravaux: 'dam',
  Decheance: 'dec',
  DeplacementDePerimetre: 'dep',
  DeclarationDOuvertureDeTravaux: 'dot',
  ExtensionDePerimetre: 'exp',
  ExtensionDeSubstance: 'exs',
  Fusion: 'fus',
  Mutation: 'mut',
  Octroi: 'oct',
  Prolongation1: 'pr1',
  Prolongation2: 'pr2',
  ProlongationExceptionnelle: 'pre',
  Prolongation: 'pro',
  Prorogation: 'prr',
  Renonciation: 'ren',
  ResiliationAnticipeeDAmodiation: 'res',
  Retrait: 'ret',
  DemandeDeTitreDExploitation: 'vct',
  MutationPartielle: 'vut',
} as const satisfies Record<string, (typeof IDS)[number]>

export const demarcheTypeIdValidator = z.enum(IDS)
export type DemarcheTypeId = z.infer<typeof demarcheTypeIdValidator>

export const DemarchesTypes = {
  amo: {
    ...defaultOptions,
    id: 'amo',
    nom: 'amodiation',
    description:
      'Démarche co-initiée par le titulaire de certains titres miniers d’exploitation et l’entreprise souhaitant devenir amodiataire du titre. C’est une location de l’exploitation d’un gisement à un tiers par le titulaire du titre en contrepartie d’un loyer ou / et du versement d’une quantité donnée des substances extraites. L’amodiation donne lieu à un contrat entre le titulaire du titre et l’amodiataire pour une durée fixée. Afin d’en bénéficier, l’intéressé doit satisfaire aux critères d’attribution exigés pour être détenteurs du titre minier. L’amodiation n’est pas une sous-traitance. En effet, le sous-traitant est rémunéré par le titulaire du titre pour l’exécution de prestations sur la base d’une facture et non d’un loyer.',
    titulaires: true,
    renouvelable: true,
  },
  aom: {
    ...defaultOptions,
    id: 'aom',
    nom: "Autorisation d'ouverture de travaux",
    description: "Autorisation d'ouverture de travaux",
    travaux: true,
  },
  ces: {
    ...defaultOptions,
    id: 'ces',
    nom: 'cession',
    description:
      'Démarche obsolète. Co-initiée par le titulaire du titre minier et l’entreprise souhaitant devenir titulaire ou co-titulaire elle remplit une fonction proche de la mutation dans le code minier actuel.',
    titulaires: true,
  },
  con: {
    ...defaultOptions,
    id: 'con',
    nom: 'conversion',
    description:
      'Démarche appliquée à un titre d’exploitation d’hydrocarbures liquides ou gazeux. Elle permet de substituer les substances initiales par d’autres substances de mines connexes aux hydrocarbures contenus dans le gisement ou bien par un autre usage du sous-sol. La demande de conversion peut être réalisée au plus tard 4 ans avant l’échéance de son titre. Elle doit de surcroît démontrer la rentabilité économique de la poursuite de l’exploitation du gisement, mais ne fait pas l’objet d’une mise en concurrence.',
    substances: true,
  },
  dam: {
    ...defaultOptions,
    id: 'dam',
    nom: "Déclaration d'arrêt définitif des travaux",
    description: "Déclaration d'arrêt définitif des travaux",
    travaux: true,
  },
  dec: {
    ...defaultOptions,
    id: 'dec',
    nom: 'déchéance',
    description:
      'Démarche obsolète. L’autorité administrative pouvait retirer les droits liés aux autorisations et titres miniers en cours de validité si le titulaire ne remplissait plus certaines prescriptions légales. La déchéance avait pour effet de permettre à l’Etat de réattribuer le titre ou l’autorisation lors d’un appel d’offre.',
    titulaires: true,
  },
  dep: {
    ...defaultOptions,
    id: 'dep',
    nom: 'déplacement de périmètre',
    description:
      'Démarche appliquée aux autorisation d’exploitation de minéraux et métaux pour déplacer le centre du périmètre de celle-ci dans la limite de 200 mètres. Les zones déjà exploitées doivent être maintenues à l’intérieur du périmètre déplacé.',
    points: true,
    renouvelable: true,
  },
  dot: {
    ...defaultOptions,
    id: 'dot',
    nom: "Déclaration d'ouverture de travaux",
    description: "Déclaration d'ouverture de travaux",
    travaux: true,
  },
  exp: {
    ...defaultOptions,
    id: 'exp',
    nom: 'extension de périmètre',
    description: "Démarche appliquée aux permis exclusifs de recherches, permis d'exploitation de minéraux et métaux et concessions pour étendre leurs périmètres.",
    duree: true,
    points: true,
    renouvelable: true,
  },
  exs: {
    ...defaultOptions,
    id: 'exs',
    nom: 'extension de substance',
    description:
      "Démarche appliquée aux autorisations d'exploitation et aux permis exclusifs de recherches de minéraux et métaux pour étendre la liste des substances non connexes autorisées à la prospection. Elle s’applique aussi aux concessions de géothermie qui peuvent être étendues à des substances de mines non connexes.",
    duree: true,
    substances: true,
    renouvelable: true,
  },
  fus: {
    ...defaultOptions,
    id: 'fus',
    nom: 'fusion',
    description:
      'Démarche appliquée aux permis exclusifs de recherches contigus. Elle conduit à la création d’un nouveau titre à partir de la fusion des périmètres de plusieurs permis exclusifs de recherches qui se trouvent dans la même période de validité (octroi, prolongation 1 ou prolongation 2).',
    duree: true,
    points: true,
    titulaires: true,
    renouvelable: true,
  },
  mut: {
    ...defaultOptions,
    id: 'mut',
    nom: 'mutation',
    description:
      'Démarche co-initiée par le titulaire du titre minier et l’entreprise souhaitant devenir titulaire ou co-titulaire du titre. Il s’agit de la cession d’un titre minier en cours de validité par son détenteur à un tiers. Elle peut porter sur la totalité du périmètre du titre initial ou sur une partie de celui-ci. Le titulaire initial conserve ses droits sur la partie restante. Afin de  bénéficier d’une mutation, l’intéressé doit satisfaire aux critères d’attribution exigés pour les détenteurs du titre minier équivalent. La décision du ministre ne préjuge en aucun cas des conditions financières fixées entre  les deux parties.',
    duree: true,
    points: true,
    titulaires: true,
    renouvelable: true,
  },
  oct: {
    ...defaultOptions,
    id: 'oct',
    nom: 'octroi',
    description: 'Démarche à l’initiative d’une personne physique ou morale en vue de l’obtention d’une autorisation ou d’un titre minier pour une première période de validité définie.',
    duree: true,
    points: true,
    substances: true,
    titulaires: true,
  },
  pr1: {
    ...defaultOptions,
    id: 'pr1',
    nom: 'prolongation 1',
    description:
      "Démarche appliquée à une autorisation ou un titre minier qui a fait l’objet d’un octroi initial. Elle prolonge sa durée de validité. Une première prolongation est applicable aux permis exclusifs de recherches et aux permis d'exploitation de minéraux et métaux en outre-mer pour une durée de 5 ans maximum. Pour des permis exclusifs de recherches d’hydrocarbures liquides ou gazeux, la première prolongation s’accompagne obligatoirement d’une réduction de 50% de la surface du titre.",
    duree: true,
    points: true,
  },
  pr2: {
    ...defaultOptions,
    id: 'pr2',
    nom: 'prolongation 2',
    description:
      "Démarche appliquée à une autorisation ou un titre minier qui a fait l’objet d’une première prolongation. Elle prolonge sa durée de validité. Une seconde prolongation est applicable aux permis exclusifs de recherches et aux permis d'exploitation de minéraux et métaux en outre-mer pour une durée de 5 ans maximum. Seules deux prolongations successives sont admises pour ces titres. A l’exception des permis exclusifs de recherches d’hydrocarbures liquides ou gazeux qui peuvent faire l’objet d’une prolongation exceptionnelle. Pour ces derniers, la seconde prolongation s’accompagne obligatoirement d’une réduction de 25% de la surface du titre.",
    duree: true,
    points: true,
  },
  pre: {
    ...defaultOptions,
    id: 'pre',
    nom: 'prolongation exceptionnelle',
    description:
      'Démarche appliquée à un permis exclusif de recherches d’hydrocarbures liquides ou gazeux. Elle prolonge sa durée de validité de trois ans maximum. La prolongation exceptionnelle ne peut être mobilisée qu’une fois au cours de la vie du titres et ne s’accompagne pas nécessairement d’une réduction de sa surface.',
    duree: true,
    exception: true,
  },
  pro: {
    ...defaultOptions,
    id: 'pro',
    nom: 'prolongation',
    description:
      "Démarche appliquée à une autorisation ou un titre minier qui a fait l’objet d’un octroi initial. Des prolongations sans limitation sont applicables aux concessions pour des durées maximales successives de 25 ans, aux permis d'exploitation de géothermie pour des durées maximales successives de 15 ans, aux permis exclusifs de carrières pour des durées maximales successives de 10 ans et aux autorisations de recherches de carrières pour des durées maximales successives de 3 ans.\nUne prolongation unique est applicable aux autorisations de recherches et aux autorisations d'exploitation de minéraux et métaux en Guyane pour respectivement 4 mois et 4 ans maximum.",
    duree: true,
    points: true,
    renouvelable: true,
  },
  prr: {
    ...defaultOptions,
    id: 'prr',
    nom: 'prorogation',
    description:
      'Démarche obsolète. Initiée par l’autorité administrative, elle proroge la durée de validité d’un titre d’exploration, de droit et sans formalité, jusqu’à l’intervention d’une décision sur une demande de titre d’exploitation portant sur ce titre d’exploration visé. Le code minier actuel y a substitué le régime de “survie provisoire”.',
    duree: true,
    points: true,
    renouvelable: true,
  },
  ren: {
    ...defaultOptions,
    id: 'ren',
    nom: 'renonciation',
    description:
      'Démarche appliquée à une autorisation ou un titre minier pour anticiper son échéance. Elle peut porter sur tout ou partie du périmètre. Cela est possible sous réserve d’avoir procédé aux mesures de remise en état dont le préfet lui aura a donné acte définitivement. La renonciation a pour effet de replacer le gisement dans la catégorie de ceux ouverts aux recherches.',
    duree: true,
    points: true,
    titulaires: true,
    renouvelable: true,
  },
  res: {
    ...defaultOptions,
    id: 'res',
    nom: "résiliation anticipée d'amodiation",
    description:
      'Démarche co-initiée par le titulaire de certains titres miniers d’exploitation et l’entreprise amodiataire du titre. Elle conduit à une fin anticipée du contrat d’amodiation sur l’accord des deux parties sans affecter le statut du titre minier.',
    titulaires: true,
    renouvelable: true,
  },
  ret: {
    ...defaultOptions,
    id: 'ret',
    nom: 'retrait',
    description:
      'Démarche initiée par l’autorité administrative. Le ministre chargé des mines pour les titres et le préfet pour les autorisations d’exploitation peuvent retirer les autorisations et les titres miniers en cours de validité si l’intéressé ne remplit plus certaines prescriptions légales.\r\nLe retrait a pour effet de replacer le gisement dans la situation de ceux ouverts aux recherches.',
    duree: true,
  },
  vct: {
    ...defaultOptions,
    id: 'vct',
    nom: "demande de titre d'exploitation",
    description:
      'Démarche virtuelle utilisée dans Camino pour lier une demande initiale de concession ou de permis d’exploitation à une autorisation ou un titre miniers d’exploration créateur d’un droit d’inventeur sur un gisement.',
    duree: true,
    points: true,
    substances: true,
    titulaires: true,
    renouvelable: true,
    auto: true,
  },
  vut: {
    ...defaultOptions,
    id: 'vut',
    nom: 'mutation partielle',
    description:
      'Démarche virtuelle d’une démarche de mutation portant sur une partie d’un titre minier. Cette démarche a pour effet de créer un nouveau titre minier sans qu’une démarche d’octroi en soit le fait générateur.',
    duree: true,
    points: true,
    titulaires: true,
    renouvelable: true,
    auto: true,
  },
} as const satisfies { [key in DemarcheTypeId]: DemarcheType<key> }

type FilterSettings<S extends (typeof DemarchesTypes)[keyof typeof DemarchesTypes] = (typeof DemarchesTypes)[keyof typeof DemarchesTypes]> = S extends { travaux: true } ? S['id'] : never

export type TravauxIds = FilterSettings

export const isDemarcheTypeId = (demarcheTypeId: string | undefined | null): demarcheTypeId is DemarcheTypeId => IDS.includes(demarcheTypeId)

export const isDemarcheTypeOctroi = (demarcheTypeId: DemarcheTypeId): boolean => {
  const demarchesTypesOctroi: DemarcheTypeId[] = [DEMARCHES_TYPES_IDS.Octroi, DEMARCHES_TYPES_IDS.MutationPartielle, DEMARCHES_TYPES_IDS.Fusion, DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation]

  return demarchesTypesOctroi.includes(demarcheTypeId)
}

export const isDemarcheTypeWithPhase = (demarcheTypeId: DemarcheTypeId): boolean => {
  if (isDemarcheTypeOctroi(demarcheTypeId)) {
    return true
  }

  return isDemarcheTypeProlongations(demarcheTypeId)
}

export const sortedDemarchesTypes = Object.values(DemarchesTypes).sort((a, b) => a.nom.localeCompare(b.nom))

export const isTravaux = (demarcheTypeId: DemarcheTypeId): boolean => {
  return DemarchesTypes[demarcheTypeId].travaux
}

export const isDemarcheTypeProlongations = (demarcheType: DemarcheTypeId): boolean => {
  return [DEMARCHES_TYPES_IDS.Prolongation, DEMARCHES_TYPES_IDS.Prolongation1, DEMARCHES_TYPES_IDS.Prolongation2, DEMARCHES_TYPES_IDS.ProlongationExceptionnelle].includes(demarcheType)
}

/**
 *  La démarche a un impact potentiel sur le titre (statut, visibilité administrations…)
 */
export const canImpactTitre = (titreDemarcheTypeId: DemarcheTypeId, titreDemarcheStatutId: DemarcheStatutId): boolean =>
  demarcheStatutIdsSuccess.has(titreDemarcheStatutId) || isDemarcheTypeOctroi(titreDemarcheTypeId)
