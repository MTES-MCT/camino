import { CaminoDate, toCaminoDate } from '../date'
import { FrequenceId } from './frequence'
import { Section, SectionElement } from './titresTypes_demarchesTypes_etapesTypes/sections'
import { DeepReadonly } from '../typescript-tools'
import { z } from 'zod'

const IDS = ['gra', 'grp', 'grx', 'pma', 'pmb', 'pmc', 'pmd', 'wrp'] as const

export const activiteTypeIdValidator = z.enum(IDS)

export type ActivitesTypesId = z.infer<typeof activiteTypeIdValidator>

export const ACTIVITES_TYPES_IDS = {
  "rapport d'exploitation (permis et concessions M)": 'gra',
  "rapport trimestriel d'exploitation d'or en Guyane": 'grp',
  "rapport d'exploitation (autorisations M)": 'grx',
  'rapport d’intensité d’exploration': 'pma',
  "rapport financier d'exploration": 'pmb',
  "rapport environnemental d'exploration": 'pmc',
  "rapport social et économique d'exploration": 'pmd',
  "rapport d'exploitation (permis et concessions W)": 'wrp',
} as const satisfies Record<string, ActivitesTypesId>

export type ActiviteType<T = ActivitesTypesId> = {
  id: T
  nom: string
  frequenceId: FrequenceId
  dateDebut: CaminoDate
  delaiMois: number
  description?: string
  sections: DeepReadonly<ActiviteSection[]>
}

type SubstancesFiscalesSection = { id: 'substancesFiscales'; nom: string }
export const isSubstancesFiscales = (section: DeepReadonly<ActiviteSection>): section is DeepReadonly<SubstancesFiscalesSection> => section.id === 'substancesFiscales'

export type ActiviteSection = (Omit<Section, 'elements'> & { elements: ActiviteSectionElement[] }) | SubstancesFiscalesSection
export type ActiviteSectionElement = SectionElement & { periodeId?: 1 | 2 | 3 | 4 }

export const ActivitesTypes: {
  [key in ActivitesTypesId]: ActiviteType<key>
} = {
  gra: {
    id: 'gra',
    nom: "rapport d'exploitation (permis et concessions M)",
    sections: [
      {
        id: 'substancesFiscales',
        nom: 'Production annuelle',
      },
      {
        id: 'complement',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'texte',
            type: 'textarea',
            dateDebut: toCaminoDate('2018-01-01'),
            optionnel: true,
            description: 'Toute information utile à la compréhension de la production déclarée.',
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2020-01-01'),
    delaiMois: 11,
    description:
      '<p>La production annuelle est requise en vertu des <a href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006179968" target="_blank" title="Page de l’article - site externe">article 1519</a>, <a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663002" target="_blank" title="Page de l’article - site externe">article 1587</a> et <a href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006162672?init=true&page=1&query=1588&searchField=ALL&tab_selection=all&anchor=LEGIARTI000006306371#LEGIARTI000006306371" target="_blank" title="Page de l’article - site externe">article 1588</a> du code général des impôts relatifs au calcul de la redevance départementale et communale des mines (RDCM).</p><p>Le rapport annuel d\'exploitation est requis en vertu de l\'<a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000023505020/2021-04-14/" target="_blank" title="Page de l’article - site externe">article L. 172-1</a> du code minier et <a href="https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000033196097" target="_blank" title="Page de l’article - site externe">article 35</a> du décret 2006/649 du 2 juin 2006.</p>',
  },
  grp: {
    id: 'grp',
    nom: "rapport trimestriel d'exploitation d'or en Guyane",
    sections: [
      {
        id: 'renseignements',
        elements: [
          {
            id: 'orBrut',
            nom: 'Or brut extrait (g)',
            type: 'number',
            dateDebut: toCaminoDate('2018-01-01'),
            description: 'Masse d’or brut en sortie de mine extrait au cours du trimestre (exemple : masse sous la forme de concentré gravimétrique).',
            optionnel: false,
          },
          {
            id: 'orExtrait',
            nom: 'Or extrait (g)',
            type: 'number',
            dateFin: toCaminoDate('2018-01-01'),
            description: "Masse d'or brut en sortie de mine, ou nette obtenue  après traitement métallurgique, extrait au cours du trimestre.",
            optionnel: false,
          },
          {
            id: 'volumeMinerai',
            nom: 'Minerai extrait (m3)',
            type: 'number',
            dateFin: toCaminoDate('2018-01-01'),
            description: 'Volume en mètre cube de minerai extrait au cours du trimestre.',
            optionnel: false,
          },
          {
            id: 'mercure',
            nom: 'Mercure récupéré (g)',
            type: 'number',
            description: 'Masse en gramme de l’ensemble des produits contaminés envoyés en traitement au cours du trimestre.',
            optionnel: false,
          },
          {
            id: 'carburantDetaxe',
            nom: 'Carburant détaxé (l)',
            type: 'number',
            dateDebut: toCaminoDate('2018-01-01'),
            description: 'Volume total en litre de carburant détaxé consommé au cours du trimestre par les travaux réalisés sur le chantier.',
            optionnel: false,
          },
          {
            id: 'carburantConventionnel',
            nom: 'Carburant conventionnel (l)',
            type: 'number',
            description: 'Volume total en litre de carburant conventionnel consommé au cours du trimestre par les travaux réalisés sur le chantier.',
            optionnel: false,
          },
          {
            id: 'pompes',
            nom: 'Pompes actives',
            type: 'number',
            dateDebut: toCaminoDate('2018-01-01'),
            description: 'Nombre moyen de pompes actives au cours du trimestre utilisées sur le chantier (pompe à gravier, pompe de relevage…).',
            optionnel: false,
          },
          {
            id: 'pelles',
            nom: 'Pelles actives',
            type: 'number',
            dateDebut: toCaminoDate('2018-01-01'),
            description: 'Nombre moyen de pelles actives au cours du trimestre utilisées sur le chantier (aménagement, exploitation, réhabilitation).',
            optionnel: false,
          },
          {
            id: 'effectifs',
            nom: 'Effectifs',
            type: 'number',
            description: 'Nombre moyen de salariés sur le chantier au cours du trimestre.',
            optionnel: false,
          },
          {
            id: 'depensesTotales',
            nom: 'Dépenses totales (euros)',
            type: 'number',
            dateFin: toCaminoDate('2018-01-01'),
            description: "Montant en euros des dépenses sur l'exploitation.",
            optionnel: false,
          },
          {
            id: 'environnement',
            nom: 'Dépenses relatives à la protection de l’environnement (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2018-01-01'),
            description:
              'Montant en euros des investissements consentis au cours du trimestre listés à l’<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000021850940&cidTexte=LEGITEXT000006069569" target="_blank" title="Page de l’article - site externe" rel="noopener noreferrer">article 318 C de l’annexe II du code général des impôts</a>. Afin de bénéficier des déductions fiscales afférentes, les justificatifs attestant de la réalisation effective des investissements sont susceptibles de vous êtres demandés par l’administration.',
            optionnel: false,
          },
        ],
      },
      {
        id: 'travaux',
        nom: 'Statut des travaux',
        elements: [
          {
            id: '1',
            nom: 'Janvier',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 1,
            optionnel: false,
          },
          {
            id: '2',
            nom: 'Février',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 1,
            optionnel: false,
          },
          {
            id: '3',
            nom: 'Mars',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 1,
            optionnel: false,
          },
          {
            id: '4',
            nom: 'Avril',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 2,
            optionnel: false,
          },
          {
            id: '5',
            nom: 'Mai',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 2,
            optionnel: false,
          },
          {
            id: '6',
            nom: 'Juin',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 2,
            optionnel: false,
          },
          {
            id: '7',
            nom: 'Juillet',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 3,
            optionnel: false,
          },
          {
            id: '8',
            nom: 'Août',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 3,
            optionnel: false,
          },
          {
            id: '9',
            nom: 'Septembre',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 3,
            optionnel: false,
          },
          {
            id: '10',
            nom: 'Octobre',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 4,
            optionnel: false,
          },
          {
            id: '11',
            nom: 'Novembre',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 4,
            optionnel: false,
          },
          {
            id: '12',
            nom: 'Décembre',
            type: 'checkboxes',
            options: [
              {
                id: 'nonDebutes',
                nom: 'non débutés',
              },
              {
                id: 'exploitationEnCours',
                nom: 'exploitation en cours',
              },
              {
                id: 'arretTemporaire',
                nom: 'arrêt temporaire',
              },
              {
                id: 'rehabilitation',
                nom: 'réhabilitation',
              },
              {
                id: 'arretDefinitif',
                nom: 'arrêt définitif (après réhabilitation)',
              },
            ],
            dateDebut: toCaminoDate('2018-01-01'),
            periodeId: 4,
            optionnel: false,
          },
        ],
      },
      {
        id: 'complement',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'texte',
            type: 'textarea',
            dateDebut: toCaminoDate('2018-01-01'),
            optionnel: true,
            description:
              'Toute information sur les événements marquants du trimestre (accident, incident, arrêt ou suspension d’activité en précisant les raisons, évolution de l’exploitation, difficultés rencontrées, etc.).',
          },
        ],
      },
    ],
    frequenceId: 'tri',
    dateDebut: toCaminoDate('2018-01-01'),
    delaiMois: 19,
  },
  grx: {
    id: 'grx',
    nom: "rapport d'exploitation (autorisations M)",
    sections: [
      {
        id: 'substancesFiscales',
        nom: 'Production annuelle',
      },
      {
        id: 'complement',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'texte',
            type: 'textarea',
            dateDebut: toCaminoDate('2018-01-01'),
            optionnel: true,
            description: "Toute information utile à la compréhension de la production d'or net.",
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2018-01-01'),
    delaiMois: 11,
    description:
      '<p>La production annuelle est requise en vertu des <a href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006179968" target="_blank" title="Page de l’article - site externe">article 1519</a>, <a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663002" target="_blank" title="Page de l’article - site externe">article 1587</a> et <a href="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006162672?init=true&page=1&query=1588&searchField=ALL&tab_selection=all&anchor=LEGIARTI000006306371#LEGIARTI000006306371" target="_blank" title="Page de l’article - site externe">article 1588</a> du code général des impôts relatifs au calcul de la redevance départementale et communale des mines (RDCM).</p><p>Le rapport annuel d\'exploitation est requis en vertu de l\'<a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000023505020/2021-04-14/" target="_blank" title="Page de l’article - site externe">article L. 172-1</a> du code minier et <a href="https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000033196097" target="_blank" title="Page de l’article - site externe">article 35</a> du décret 2006/649 du 2 juin 2006.</p>',
  },
  pma: {
    id: 'pma',
    nom: 'rapport d’intensité d’exploration',
    sections: [
      {
        id: 'levesTopographiques',
        nom: 'Levés topographiques',
        elements: [
          {
            id: 'typeLevesTopo',
            nom: 'Types de levés ',
            type: 'text',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Exemples : LIDAR, géomètre…',
          },
          {
            id: 'surfaceLevesTopo',
            nom: 'Surface des levés(km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre couverte par des levés topographiques',
          },
          {
            id: 'complementLevesTopo',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les levés topographiques',
          },
        ],
      },
      {
        id: 'cartographieGeologique',
        nom: 'Cartographie géologique',
        elements: [
          {
            id: 'surfaceCartographieGeologique',
            nom: 'Surface cartographiée (km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Surface du titre dont la cartographie géologique a été effectuée au cours de l'année",
          },
          {
            id: 'complementCartographie',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les activités de cartographie',
          },
        ],
      },
      {
        id: 'levesGeochimiques',
        nom: 'Levés géochimiques',
        elements: [
          {
            id: 'surfaceLevesGeochimie',
            nom: 'Surface des levés(km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre couverte par des levés géochimiques',
          },
          {
            id: 'lineaireLevesGeochimie',
            nom: 'Longueur de levés (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de layon couverte par des levés géochimiques',
          },
          {
            id: 'complementLevesGeochimie',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les levés géochimiques',
          },
        ],
      },
      {
        id: 'levesGeophysiques',
        nom: 'Levés géophysiques',
        elements: [
          {
            id: 'surfaceLevesMagnetisme',
            nom: 'Surface des levés de magnétisme (km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre en kilomètre carré couverte par des levés de magnétisme ',
          },
          {
            id: 'lineaireLevesMagnetisme',
            nom: 'Longueur des levés de magnétisme (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de layon en kilomètre couverte par des levés de magnétisme',
          },
          {
            id: 'typeLevesMagnetisme',
            nom: 'Type de levés de magnétisme',
            type: 'checkboxes',
            options: [
              {
                id: 'auSol',
                nom: 'au sol',
              },
              {
                id: 'aeroporte',
                nom: 'aéroporté',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: false,
          },
          {
            id: 'surfaceLevesSpectrometrie',
            nom: 'Surface des levés de spectrométrie (km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre en kilomètre carré couverte par des levés de spectrométrie',
          },
          {
            id: 'lineaireLevesSpectrometrie',
            nom: 'Longueur des levés de spectrométrie (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de layon en kilomètre couverte par des levés de spectrométrie',
          },
          {
            id: 'typeLevesSpectrometrie',
            nom: 'Type de levés de spectrométrie ',
            type: 'checkboxes',
            options: [
              {
                id: 'auSol',
                nom: 'au sol',
              },
              {
                id: 'aeroporte',
                nom: 'aéroporté',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: false,
          },
          {
            id: 'surfaceLevesPolarisationProvoquee',
            nom: 'Surface des levés de polarisation provoquée (km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre en kilomètre carré couverte par des levés de polarisation provoquée',
          },
          {
            id: 'lineaireLevesPolarisationProvoquee',
            nom: 'Longueur des levés de polarisation provoquée (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de layon en kilomètre couverte par des levés de polarisation provoquée',
          },
          {
            id: 'typeLevesPolarisationProvoquee',
            nom: 'Type de levés de polarisation provoquée ',
            type: 'checkboxes',
            options: [
              {
                id: 'auSol',
                nom: 'au sol',
              },
              {
                id: 'aeroporte',
                nom: 'aéroporté',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: false,
          },
          {
            id: 'surfaceLevesSismiques',
            nom: 'Surface des levés sismiques (km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre en kilomètre carré couverte par des levés sismiques',
          },
          {
            id: 'lineaireLevesSismiques',
            nom: 'Longueur des levés sismiques (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de layon en kilomètre couverte par des levés sismiques',
          },
          {
            id: 'typeLevesSismiques',
            nom: 'Type de levés sismiques',
            type: 'checkboxes',
            options: [
              {
                id: 'auSol',
                nom: 'au sol',
              },
              {
                id: 'aeroporte',
                nom: 'aéroporté',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: false,
          },
          {
            id: 'surfaceLevesConductivite',
            nom: 'Surface des levés de conductivité (km²)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Surface du titre en kilomètre carré couverte par des levés de conductivité',
          },
          {
            id: 'lineaireLevesConductivite',
            nom: 'Longueur des levés de conductivité (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de layon en kilomètre couverte par des levés de conductivité',
          },
          {
            id: 'typeLevesConductivite',
            nom: 'Type de levés de conductivité',
            type: 'checkboxes',
            options: [
              {
                id: 'auSol',
                nom: 'au sol',
              },
              {
                id: 'aeroporte',
                nom: 'aéroporté',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: false,
          },
          {
            id: 'surfaceLevesAutre',
            nom: "Surface des levés par d'autres méthodes (km²)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Surface du titre en kilomètre carré couverte par des levés par d'autres méthodes",
          },
          {
            id: 'lineaireLevesAutre',
            nom: "Longueur des levés par d'autres méthodes (km)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Longueur de layon en kilomètre couverte par des levés par d'autres méthodes",
          },
          {
            id: 'typeLevesAutre',
            nom: "Type de levés par d'autres méthodes",
            type: 'checkboxes',
            options: [
              {
                id: 'auSol',
                nom: 'au sol',
              },
              {
                id: 'aeroporte',
                nom: 'aéroporté',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: false,
          },
          {
            id: 'complementLevesGeochimie',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les levés géophysique',
          },
        ],
      },
      {
        id: 'trancheesPuits',
        nom: 'Tranchées et puits',
        elements: [
          {
            id: 'puits',
            nom: 'Nombre de puits',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Nombre de puits forés',
          },
          {
            id: 'lineaireTranchees',
            nom: 'Longueur de tranchée (km)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur de tranchée de prospection ouverte',
          },
          {
            id: 'complementTrancheesPuits',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les tranchées et puits',
          },
        ],
      },
      {
        id: 'sondages',
        nom: 'Sondages',
        elements: [
          {
            id: 'nombreSondagesTariere',
            nom: 'Nombre de sondages tarière',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Nombre de sondages effectués à l'aide d'une tarière",
          },
          {
            id: 'profondeurMaxSondagesTariere',
            nom: 'Profondeur maximale des sondages tarière (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Profondeur maximale atteinte par les sondages tarière',
          },
          {
            id: 'profondeurMoySondagesTariere',
            nom: 'Profondeur moyenne de sondages tarière (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Profondeur moyenne atteinte par les sondages tarière',
          },
          {
            id: 'lineaireSondagesTarieres',
            nom: 'Longueur sondages tarière (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur du linéaire de sondages tarière',
          },
          {
            id: 'nombreSondagesDestructifs',
            nom: 'Nombre de sondages destructifs',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Nombre de sondages effectués à l'aide d'une destructifs",
          },
          {
            id: 'profondeurMaxSondagesDestructifs',
            nom: 'Profondeur maximale des sondages destructifs (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Profondeur maximale atteinte par les sondages destructifs',
          },
          {
            id: 'profondeurMoySondagesDestructifs',
            nom: 'Profondeur moyenne de sondages destructifs (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Profondeur moyenne atteinte par les sondages destructifs',
          },
          {
            id: 'lineaireSondagesDestructifss',
            nom: 'Longueur sondages destructifs (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur du linéaire de sondages destructifs',
          },
          {
            id: 'nombreSondagesCarottes',
            nom: 'Nombre de sondages carottés',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Nombre de sondages effectués à l'aide d'une carottés",
          },
          {
            id: 'profondeurMaxSondagesCarottes',
            nom: 'Profondeur maximale des sondages carottés (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Profondeur maximale atteinte par les sondages carottés',
          },
          {
            id: 'profondeurMoySondagesCarottes',
            nom: 'Profondeur moyenne de sondages carottés (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Profondeur moyenne atteinte par les sondages carottés',
          },
          {
            id: 'lineaireSondagesCarottes',
            nom: 'Longueur sondages carottés (m)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Longueur du linéaire de sondages carottés',
          },
          {
            id: 'complementSondages',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les sondages',
          },
        ],
      },
      {
        id: 'Analyses',
        nom: 'Analyses',
        elements: [
          {
            id: 'nombreAnalysesMultiElements',
            nom: "Nombre d'analyses multi-éléments",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Nombre d'analyses multi-éléments",
          },
          {
            id: 'listeAnalysesMultiElements',
            nom: 'Liste des éléments analysés',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Précisions sur les éléments analysés et méthodes analytiques utilisées',
          },
          {
            id: 'listeTraitementMineralurgiques',
            nom: 'Nature des traitements minéralurgiques',
            type: 'checkboxes',
            options: [
              {
                id: 'analyseGranulometrie',
                nom: 'analyse granulométrique',
              },
              {
                id: 'concassage',
                nom: 'concassage',
              },
              {
                id: 'broyage',
                nom: 'broyage',
              },
              {
                id: 'separationGravimetrique',
                nom: 'séparation gravimétrique',
              },
              {
                id: 'flottation',
                nom: 'flottation',
              },
              {
                id: 'cyanuration',
                nom: 'cyanuration',
              },
              {
                id: 'testLixiviation',
                nom: 'test de lixiviation',
              },
              {
                id: 'autre',
                nom: 'autres',
              },
            ],
            optionnel: false,
          },
          {
            id: 'complementAnalyses',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les analyses (volumes traités, nombre de tests...)',
          },
        ],
      },
      {
        id: 'etudes',
        nom: 'Etudes',
        elements: [
          {
            id: 'listeEtudes',
            nom: 'Nature des études effectués',
            type: 'checkboxes',
            options: [
              {
                id: 'environnementale',
                nom: 'environnementale',
              },
              {
                id: 'economiquePreliminaire',
                nom: 'économique préliminaire',
              },
              {
                id: 'economiquePreFaisabilite',
                nom: 'économique pré-faisabilité',
              },
              {
                id: 'economiqueFaisabilité',
                nom: 'économique faisabilité',
              },
              {
                id: 'sociale',
                nom: 'sociale',
              },
              {
                id: 'autre',
                nom: 'autres',
              },
            ],
            dateDebut: toCaminoDate('2019-01-01'),
            description: 'Nature des études effectuées',
            optionnel: false,
          },
          {
            id: 'complementEtudes',
            nom: 'Informations complémentaires',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: 'Toute information complémentaire sur les études effectuées',
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2019-01-01'),
    delaiMois: 24,
  },
  pmb: {
    id: 'pmb',
    nom: "rapport financier d'exploration",
    sections: [
      {
        id: 'indicateursFinanciersDepensesTotales',
        nom: 'Indicateur financier global',
        elements: [
          {
            id: 'depensesTotales',
            nom: 'Dépenses totales de prospection',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros de l'ensemble des dépenses effectuées au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersLevesTopographiques',
        nom: 'Levés topographiques',
        elements: [
          {
            id: 'depensesLevesTopographiques',
            nom: 'Dépenses de levés topographiques (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de levés topographiques au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersCartographieGeologique',
        nom: 'Cartographie géologique',
        elements: [
          {
            id: 'depensesCartographie',
            nom: 'Dépenses de cartographie géologique (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de cartographie géologique au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersLevesGeochimie',
        nom: 'Levés géochimiques',
        elements: [
          {
            id: 'depensesLevesGeochimie',
            nom: 'Dépenses de levés géochimiques (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de levés géochimiques au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersLevesGeophysique',
        nom: 'Levés géophysique',
        elements: [
          {
            id: 'depensesLevesGeophysique',
            nom: 'Dépenses de levés géophysique (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de levés géophysique au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersLevesTrancheesPuits',
        nom: 'Tranchées et puits',
        elements: [
          {
            id: 'depensesLevesTrancheesPuits',
            nom: 'Dépenses de tranchées et puits (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de tranchées et puits au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersSondages',
        nom: 'Sondages',
        elements: [
          {
            id: 'depensesLevesSondagesTarieres',
            nom: 'Dépenses de sondages tarières (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de sondages tarières au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesLevesSondagesDestructifs',
            nom: 'Dépenses de sondages destructifs (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de sondages destructifs au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesLevesSondagesCarottés',
            nom: 'Dépenses de sondages carottés (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de sondages carottés au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersAnalysesMultiElements',
        nom: 'Analyses',
        elements: [
          {
            id: 'depensesAnalysesMultiElements',
            nom: "Dépenses d'analyses multi-éléments (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'analyses multi-éléments au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesTraitementMineralurgiques',
            nom: 'Dépenses de traitements minéralurgiques (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de traitements minéralurgiques au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersEtudes',
        nom: 'Etudes',
        elements: [
          {
            id: 'depensesEtudeEnvironnementale',
            nom: "Dépenses d'étude environnementale (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'études environnementales au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesEtudeEconomiquePreliminaire',
            nom: "Dépenses d'étude économique préliminaire (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'étude économique préliminaire au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesEtudeEconomiquePreFaisabilite',
            nom: "Dépenses d'étude économique pré-faisabilité (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'étude économique pré-faisabilité au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesEtudeEconomiqueFaisabilité',
            nom: "Dépenses d'étude économique faisabilité (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'étude économique faisabilité au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesEtudeSociale',
            nom: "Dépenses d'étude sociale (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'étude environnementales au cours de l'année",
            optionnel: false,
          },
          {
            id: 'depensesEtudessautres',
            nom: "Dépenses d'études autres (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses d'études autres au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersEnvironnement',
        nom: 'Environnement',
        elements: [
          {
            id: 'environnement',
            nom: 'Dépenses relatives à la protection de l’environnement (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description:
              'Montant en euros des investissements consentis au cours de l\'année listés à l’<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=LEGIARTI000021850940&cidTexte=LEGITEXT000006069569" target="_blank" title="Page de l’article - site externe" rel="noopener noreferrer">article 318 C de l’annexe II du code général des impôts</a>. Afin de bénéficier des déductions fiscales afférentes, les justificatifs attestant de la réalisation effective des investissements sont susceptibles de vous être demandés par l’administration.',
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursFinanciersCommunication',
        nom: 'Communication',
        elements: [
          {
            id: 'depensesCommunication',
            nom: "Dépenses de communication et d'information du public (euros)",
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des dépenses de communication et frais d'organisation de réunions publiques au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'complementFinancier',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'depensesAutres',
            nom: 'Autres dépenses (euros)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Montant en euros des autres dépenses au cours de l'année",
            optionnel: false,
          },
          {
            id: 'texte',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Toute information sur les événements financiers marquants de l'année.",
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2019-01-01'),
    delaiMois: 24,
  },
  pmc: {
    id: 'pmc',
    nom: "rapport environnemental d'exploration",
    sections: [
      {
        id: 'indicateursEnvironnement',
        nom: 'Indicateurs environnementaux',
        elements: [
          {
            id: 'carburantDetaxe',
            nom: 'Carburant détaxé (l)',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Volume total en litre de carburant détaxé consommé au cours de l'année par les travaux réalisés sur le chantier.",
            optionnel: false,
          },
          {
            id: 'carburantConventionnel',
            nom: 'Carburant conventionnel (l)',
            type: 'number',
            description: "Volume total en litre de carburant conventionnel consommé au cours de l'année par les travaux réalisés sur le chantier.",
            optionnel: false,
          },
          {
            id: 'pompes',
            nom: 'Pompes actives',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "<b>Dans le cas d'un chantier alluvionnaire</b>, nombre d'heure de fonctionnement de pompes au cours de l'année sur le chantier (pompe à gravier, pompe de relevage…).",
            optionnel: false,
          },
          {
            id: 'pelles',
            nom: 'Pelles actives',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description:
              "<b>Dans le cas d'un chantier alluvionnaire</b>, nombre d'heure de fonctionnement de pelles mécaniques au cours de l'année sur le chantier (aménagement, exploitation, réhabilitation).",
            optionnel: false,
          },
          {
            id: 'mercure',
            nom: 'Mercure récupéré (g)',
            type: 'number',
            description: "<b>En Guyane</b>, masse en gramme de l’ensemble des produits contaminés au mercure envoyés en traitement au cours de l'année.",
            optionnel: false,
          },
          {
            id: 'surfaceDeforestee',
            nom: 'Surface déforestée (km²)',
            type: 'number',
            description: "Surface déforestée en kilomètre carré au cours de l'année.",
            optionnel: false,
          },
        ],
      },
      {
        id: 'complementEnvironnement',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'texte',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description:
              "Toute information sur les événements marquants l'année en matière de protection de l'environnement dont les actions entreprises pour réduire l'empreinte environnementale du projet.",
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2019-01-01'),
    delaiMois: 24,
  },
  pmd: {
    id: 'pmd',
    nom: "rapport social et économique d'exploration",
    sections: [
      {
        id: 'indicateursSocialEconomiqueDirect',
        nom: 'Indicateurs sociaux et économiques sur les emplois directs',
        elements: [
          {
            id: 'emploisDirectsTotal',
            nom: 'Emplois directs salariés',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre total de salariés de l'entreprise affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'etpDirectsTotal',
            nom: 'Equivalents temps plein salariés',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre total d'équivalents temps plein salariés de l'entreprise affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'emploisDirectsResidents',
            nom: 'Emplois directs salariés occupés par des résidents du département',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre de salariés de l'entreprise, <b>français ou étrangers, résidant fiscalement dans le département</b>, affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'etpDirectsResidents',
            nom: 'Equivalents temps plein salariés occupés par des résidents du département',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description:
              "Nombre d'équivalents temps plein salariés de l'entreprise, occupés par des <b>français ou étrangers, résidant fiscalement dans le département</b>, affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'emploisDirectsFr',
            nom: 'Emplois directs salariés de nationalité française',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre d'employés de <b>nationalité française</b> salariés de l'entreprise affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'etpDirectsFr',
            nom: 'Equivalents temps plein salariés de nationalité française',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre d'équivalents temps plein salariés de l'entreprise occupés par des personnes de <b>nationalité française</b> affectés aux activités sur le titre minier.",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursSocialEconomiqueInirects',
        nom: 'Indicateurs sociaux et économiques sur la sous-traitance',
        elements: [
          {
            id: 'emploisIndirectsTotal',
            nom: 'Emplois salariés des sous-traitants',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre total d'emplois salariés des sous-traitants et prestataires affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'etpIndirectsTotal',
            nom: 'Equivalents temps plein salariés des sous-traitants',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre total d'équivalents temps plein salariés des sous-traitants et prestataires, affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'emploisIndirectsResidents',
            nom: 'Emplois salariés résidents du département des sous-traitants',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: 'Nombre de salariés des sous-traitants et prestataires, <b>résidant fiscalement dans le département</b>, affectés aux activités sur le titre minier.',
            optionnel: false,
          },
          {
            id: 'etpIndirectsResidents',
            nom: 'Equivalents temps plein des salariés des sous-traitants résidents du département',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre d'équivalents temps plein des sous-traitants et prestataires, <b>résidant fiscalement dans le département</b>, affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'emploisIndirectsFr',
            nom: 'Emplois salariés de nationalité française des sous-traitants',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre d'employés de <b>nationalité française</b> salariés des sous-traitants et prestataires de l'entreprise, affectés aux activités sur le titre minier.",
            optionnel: false,
          },
          {
            id: 'etpIndirectsFr',
            nom: 'Equivalents temps plein salariés de nationalité française des sous-traitants',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description:
              "Nombre d'équivalents temps plein occupés par des personnes de <b>nationalité française</b> salariées des sous-traitants et prestataires de l'entreprise, affectées aux activités sur le titre minier.",
            optionnel: false,
          },
        ],
      },
      {
        id: 'indicateursConcertationAcceptabilite',
        nom: "Indicateurs de concertation et d'acceptabilité du projet",
        elements: [
          {
            id: 'reunionPublique',
            nom: 'Réunions publiques',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre de réunions publiques consacrées aux projets sur le titre minier organisées au cours de l'année",
            optionnel: false,
          },
          {
            id: 'priseContact',
            nom: 'Rendez-vous',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre de rendez-vous avec les parties prenantes concernées par le titre minier organisés au cours de l'année",
            optionnel: false,
          },
          {
            id: 'communicationLocale',
            nom: 'Actions de communication à destination du public',
            type: 'number',
            dateDebut: toCaminoDate('2019-01-01'),
            description: "Nombre d'actions de communication menées par le titulaire du titre à destination du public (hors publication et communication à destination des marchés) au cours de l'année",
            optionnel: false,
          },
        ],
      },
      {
        id: 'complementSocialEconomique',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'texte',
            type: 'textarea',
            dateDebut: toCaminoDate('2019-01-01'),
            optionnel: true,
            description: "Toute information sur les événements marquants de nature sociale ou économique de l'année.",
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2019-01-01'),
    delaiMois: 24,
  },
  wrp: {
    id: 'wrp',
    nom: "rapport d'exploitation (permis et concessions W)",
    sections: [
      {
        id: 'renseignementsProduction',
        nom: 'Production annuelle',
        elements: [
          {
            id: 'volumeGranulatsExtrait',
            nom: 'Volume de granulats marins extrait (m3)',
            type: 'number',
            description: "Volume de granulats marins extrait, en mètre cube, au cours de l'année.",
            optionnel: false,
          },
        ],
      },
      {
        id: 'complementInformation',
        nom: 'Informations complémentaires',
        elements: [
          {
            id: 'texte',
            type: 'textarea',
            optionnel: true,
            description:
              "Toute information sur les événements marquants de l'année (arrêt ou suspension d’activité en précisant les raisons, évolution de l’exploitation, difficultés rencontrées, accident, incident, etc.).",
          },
        ],
      },
    ],
    frequenceId: 'ann',
    dateDebut: toCaminoDate('2010-01-01'),
    delaiMois: 12,
    description:
      '<p>La production annuelle est requise en vertu des <a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663105" target="_blank" title="Page de l’article - site externe">article 1519</a>, <a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663002" target="_blank" title="Page de l’article - site externe">article 1587</a> et <a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000006306371" target="_blank" title="Page de l’article - site externe">article 1588</a> du code général des impôts relatifs au calcul de la redevance départementale et communale des mines (RDCM).</p><p><a href="https://www.legifrance.gouv.fr/codes/id/LEGIARTI000021822128" target="_blank" title="Page de l’article - site externe">article 47</a> du décret 2006-798 du 6 juillet 2006.</p>',
  },
}

export const sortedActivitesTypes = Object.values(ActivitesTypes).sort((a, b) => a.nom.localeCompare(b.nom))
