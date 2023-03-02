// TODO 2022-09-23:
// use ParseUrlParams like here: https://type-level-typescript.com/ to type the url params
// type the Return types of these routes
export const CaminoRestRoutes = {
  config: '/config',
  moi: '/moi',
  newsletter: '/utilisateurs/:id/newsletter',
  statistiquesMinerauxMetauxMetropole: '/statistiques/minerauxMetauxMetropole',
  statistiquesGuyane: '/statistiques/guyane',
  statistiquesGranulatsMarins: '/statistiques/granulatsMarins',
  titreSections: '/titreSections/:titreId',
  titresONF: '/titresONF',
  titresPTMG: '/titresPTMG',
  titresDREAL: '/titresDREAL',
  statistiquesDGTM: '/statistiques/dgtm',
  fiscaliteEntreprise: '/entreprises/:entrepriseId/fiscalite/:annee',
  generateQgisToken: '/utilisateur/generateQgisToken'
} as const

export type CaminoRestRoute = (typeof CaminoRestRoutes)[keyof typeof CaminoRestRoutes]
export const ALL_CAMINO_REST_ROUTES: CaminoRestRoute[] = Object.values(CaminoRestRoutes)
