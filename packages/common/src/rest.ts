// TODO 2022-09-23:
// use ParseUrlParams like here: https://type-level-typescript.com/ to type the url params
// type the Return types of these routes
export const CaminoRestRoutes = {
  config: '/config',
  moi: '/moi',
  newsletter: '/utilisateurs/:id/newsletter',
  utilisateur: '/utilisateurs/:id',
  utilisateurPermission: '/utilisateurs/:id/permission',
  statistiquesMinerauxMetauxMetropole: '/statistiques/minerauxMetauxMetropole',
  statistiquesGuyane: '/statistiques/guyane',
  statistiquesGranulatsMarins: '/statistiques/granulatsMarins',
  titreSections: '/titreSections/:titreId',
  titre: '/titres/:titreId',
  titreUtilisateurAbonne: '/titres/:titreId/abonne',
  titresONF: '/titresONF',
  titresPTMG: '/titresPTMG',
  titresDREAL: '/titresDREAL',
  titresLiaisons: '/titres/:id/titreLiaisons',
  statistiquesDGTM: '/statistiques/dgtm',
  fiscaliteEntreprise: '/entreprises/:entrepriseId/fiscalite/:annee',
  generateQgisToken: '/utilisateur/generateQgisToken',
} as const

export type CaminoRestRoute = (typeof CaminoRestRoutes)[keyof typeof CaminoRestRoutes]
export const ALL_CAMINO_REST_ROUTES: CaminoRestRoute[] = Object.values(CaminoRestRoutes)

export type ParseUrlParams<url> = url extends `${infer path}(${infer optionalPath})`
  ? ParseUrlParams<path> & Partial<ParseUrlParams<optionalPath>>
  : url extends `${infer start}/${infer rest}`
  ? ParseUrlParams<start> & ParseUrlParams<rest>
  : url extends `:${infer param}`
  ? { [k in param]: string }
  : {} // eslint-disable-line @typescript-eslint/ban-types

const isRestRoute = (route: string): route is CaminoRestRoute => {
  return ALL_CAMINO_REST_ROUTES.includes(route)
}

export const getRestRoute = <T extends CaminoRestRoute>(path: T, params: ParseUrlParams<T>) => {
  if (!isRestRoute(path)) {
    throw new Error(`la route ${path} est inconnue`)
  }
  const url = Object.entries<string>(params).reduce<string>((uiPath, [key, value]) => uiPath.replace(`:${key}`, value), path)
  // clean url

  return url.replace(/(\(|\)|\/?:[^/]+)/g, '')
}
