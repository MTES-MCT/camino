type MatomoSegment = 'menu-utilisateur' | 'menu-sections' | 'menu'
type MatomoSubsegment = 'menu-utilisateur' | 'menu-section' | 'bouton'
export type MatomoEvent = 'deconnexion' | 'dashboard' | 'titres' | 'demarches' | 'travaux' | 'activites' | 'administrations' | 'entreprises' | 'utilisateurs' | 'metas' | 'utilisateur' | 'statistiques'

const MatomoParams = {
  'menu-utilisateur': {
    'menu-utilisateur': ['deconnexion'],
  },
  'menu-sections': {
    'menu-section': ['dashboard', 'titres', 'demarches', 'travaux', 'activites', 'administrations', 'entreprises', 'utilisateurs', 'metas', 'statistiques'],
  },
  menu: {
    bouton: ['utilisateur'],
  },
} as const satisfies Record<MatomoSegment, { [key in MatomoSubsegment]?: readonly MatomoEvent[] }>

export type MatomoEventParam<T extends MatomoSegment, U extends keyof (typeof MatomoParams)[T]> = Extract<(typeof MatomoParams)[T][U], readonly MatomoEvent[]>[number]
export type MenuSection = MatomoEventParam<'menu-sections', 'menu-section'> | 'journaux'

// TODO 2023-03-16 typer l’instance matomo dans un .d.ts
export type TrackEventFunction = <T extends MatomoSegment, U extends keyof (typeof MatomoParams)[T]>(segment: T, subSegment: U, event: MatomoEventParam<T, U>) => void
