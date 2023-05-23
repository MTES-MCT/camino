// TODO 2022-09-23:
// use ParseUrlParams like here: https://type-level-typescript.com/ to type the url params
// type the Return types of these routes
export const CaminoRestRoutes = {
  config: '/config',
  moi: '/moi',
  newsletter: '/rest/utilisateurs/:id/newsletter',
  utilisateur: '/rest/utilisateurs/:id',
  utilisateurPermission: '/rest/utilisateurs/:id/permission',
  statistiquesMinerauxMetauxMetropole: '/rest/statistiques/minerauxMetauxMetropole',
  statistiquesGuyane: '/rest/statistiques/guyane',
  statistiquesGranulatsMarins: '/rest/statistiques/granulatsMarins',
  titreSections: '/rest/titreSections/:titreId',
  demarche: '/rest/demarches/:demarcheId',
  titre: '/rest/titres/:titreId',
  titreDate: '/rest/titres/:titreId/date',
  titreUtilisateurAbonne: '/rest/titres/:titreId/abonne',
  titresONF: '/rest/titresONF',
  titresPTMG: '/rest/titresPTMG',
  titresDREAL: '/rest/titresDREAL',
  titresLiaisons: '/rest/titres/:id/titreLiaisons',
  statistiquesDGTM: '/rest/statistiques/dgtm',
  fiscaliteEntreprise: '/rest/entreprises/:entrepriseId/fiscalite/:annee',
  entreprises: '/rest/entreprises',
  entreprise: '/rest/entreprises/:entrepriseId',
  entrepriseDocuments: '/rest/entreprises/:entrepriseId/documents',
  entrepriseDocument: '/rest/entreprises/:entrepriseId/documents/:documentId',
  generateQgisToken: '/rest/utilisateur/generateQgisToken',
  etapesTypesEtapesStatusWithMainStep: '/rest/etapesTypes/:demarcheId/:date',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
  downloadDownloadFichier: '/download/fichiers/:documentId',
  downloadFichier: '/fichiers/:documentId',
  downloadTitre: '/titres/:id',
  downloadTitres: '/titres',
  downloadTitres_qgis: '/titres_qgis',
  downloadDemarches: '/demarches',
  downloadActivites: '/activites',
  downloadUtilisateurs: '/utilisateurs',
  downloadEtape: '/etape/zip/:etapeId',
  downloadEtapeFichier: '/etape/:etapeId/:fichierNom',
  downloadEntreprises: '/entreprises',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
} as const

export const DOWNLOAD_FORMATS = {
  Excel: 'xlsx',
  Csv: 'csv',
  Ods: 'ods',
  GeoJSON: 'geojson',
  JSON: 'json',
  PDF: 'pdf',
  Zip: 'zip',
} as const

export type DownloadFormat = (typeof DOWNLOAD_FORMATS)[keyof typeof DOWNLOAD_FORMATS]

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
