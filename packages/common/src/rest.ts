import { ZodType, z } from 'zod'
import { documentIdValidator, entrepriseDocumentInputValidator,entrepriseDocumentValidator, entrepriseIdValidator, entrepriseModificationValidator, entrepriseTypeValidator, sirenValidator } from './entreprise'
import { demarcheGetValidator } from './demarche'
import { utilisateurToEdit } from './utilisateur'
import { titreLinksValidator, titreOnfValidator, titrePtmgValidator } from './titres'

export type CaminoRoute = {
  get?: {output: ZodType}
  post?: {input: ZodType, output: ZodType}
  put?: {input: ZodType, output: ZodType}
  delete?: true
}

const IDS = [
'/config',
'/moi',
'/rest/utilisateurs/:id/newsletter',
'/rest/utilisateurs/:id',
'/rest/utilisateurs/:id/permission',
'/rest/statistiques/minerauxMetauxMetropole',
'/rest/statistiques/guyane',
'/rest/statistiques/granulatsMarins',
'/rest/titreSections/:titreId',
'/rest/demarches/:demarcheId',
'/rest/titres/:titreId',
'/rest/titres/:titreId/abonne',
'/rest/titresONF',
'/rest/titresPTMG',
'/rest/titresDREAL',
'/rest/titres/:id/titreLiaisons',
'/rest/statistiques/dgtm',
'/rest/entreprises/:entrepriseId/fiscalite/:annee',
'/rest/entreprises',
'/rest/entreprises/:entrepriseId',
'/rest/entreprises/:entrepriseId/documents',
'/rest/entreprises/:entrepriseId/documents/:documentId',
'/rest/utilisateur/generateQgisToken',
'/rest/etapesTypes/:demarcheId/:date',] as const 

export type CaminoRestRoute = typeof IDS[number]
export type CaminoRestRouteIds = typeof IDS

// TODO 2022-09-23:
// use ParseUrlParams like here: https://type-level-typescript.com/ to type the url params
// type the Return types of these routes
export const CaminoRestRoutes = {
  '/config': { get: {output: z.void()}},
  '/moi': { get: {output: z.void()} },
  '/rest/utilisateurs/:id/newsletter': { get: {output: z.void()} },
  '/rest/utilisateurs/:id': { delete: true},
  '/rest/utilisateurs/:id/permission': { post: {input: utilisateurToEdit, output: z.void()}},
  '/rest/statistiques/minerauxMetauxMetropole': { get: {output: z.void()}},
  '/rest/statistiques/guyane': { get: {output: z.void()}},
  '/rest/statistiques/granulatsMarins': { get: {output: z.void()}},
  '/rest/titreSections/:titreId': { get: {output: z.void()}},
  '/rest/demarches/:demarcheId': { get: {output: demarcheGetValidator}},
  '/rest/titres/:titreId': { get: {output: z.void()}},
  '/rest/titres/:titreId/abonne': { get: {output: z.void()}},
  '/rest/titresONF': { get: {output: z.array(titreOnfValidator)}},
  '/rest/titresPTMG': { get: {output: z.array(titrePtmgValidator)}},
  '/rest/titresDREAL': { get: {output: z.void()}},
  '/rest/titres/:id/titreLiaisons': { get: {output: titreLinksValidator}},
  '/rest/statistiques/dgtm': { get: {output: z.void()}},

  // titreDate: '/rest/titres/:titreId/date',
  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { get: {output: z.void()}},
  '/rest/entreprises': { post: {input: z.object({siren: sirenValidator}), output: z.object({id: entrepriseIdValidator})}},
  '/rest/entreprises/:entrepriseId': { 
    get: {output: entrepriseTypeValidator},
    put: {input: entrepriseModificationValidator, output: z.void()}
  },
  '/rest/entreprises/:entrepriseId/documents': { 
    post: {input: entrepriseDocumentInputValidator, output: z.union([documentIdValidator, z.custom<Error>()])},
    get: {output: z.array(entrepriseDocumentValidator)}
  },
  '/rest/entreprises/:entrepriseId/documents/:documentId': { delete: true },
  '/rest/utilisateur/generateQgisToken': { get: {output: z.void()}},
  '/rest/etapesTypes/:demarcheId/:date': { get: {output: z.void()}},

} as const satisfies Record<CaminoRestRoute, CaminoRoute>

//FIXME à faire
//  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
// downloadDownloadFichier: { route: '/download/fichiers/:documentId', input: z.void()},
// downloadFichier: { route: '/fichiers/:documentId', input: z.void()},
// downloadTitre: { route: '/titres/:id', input: z.void()},
// downloadTitres: { route: '/titres', input: z.void()},
// downloadTitres_qgis: { route: '/titres_qgis', input: z.void()},
// downloadDemarches: { route: '/demarches', input: z.void()},
// downloadActivites: { route: '/activites', input: z.void()},
// downloadUtilisateurs: { route: '/utilisateurs', input: z.void()},
// downloadEtape: { route: '/etape/zip/:etapeId', input: z.void()},
// downloadEtapeFichier: { route: '/etape/:etapeId/:fichierNom', input: z.void()},
// downloadEntreprises: { route: '/entreprises', input: z.void()},
// NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES

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


export type ParseUrlParams<url> = url extends `${infer path}(${infer optionalPath})`
  ? ParseUrlParams<path> & Partial<ParseUrlParams<optionalPath>>
  : url extends `${infer start}/${infer rest}`
  ? ParseUrlParams<start> & ParseUrlParams<rest>
  : url extends `:${infer param}`
  ? { [k in param]: string }
  : {} // eslint-disable-line @typescript-eslint/ban-types


type can<T, Method extends 'post' | 'get' | 'put' | 'delete'> = T extends CaminoRestRoute ? typeof CaminoRestRoutes[T] extends {[m in Method]: any} ? T : never : never

type CaminoRestRouteList<Route, Method extends 'post' | 'get' | 'put' | 'delete' > =
  Route extends readonly [infer First, ...infer Rest]
    ? First extends can<First, Method>
      ? [First, ...CaminoRestRouteList<Rest, Method>]
      : CaminoRestRouteList<Rest, Method>
    : [];

export type GetRestRoutes = CaminoRestRouteList<typeof IDS, 'get'>[number]
export type PostRestRoutes = CaminoRestRouteList<typeof IDS, 'post'>[number]
export type DeleteRestRoutes = CaminoRestRouteList<typeof IDS, 'delete'>[number]
export type PutRestRoutes = CaminoRestRouteList<typeof IDS, 'put'>[number]

export const getRestRoute = <T extends CaminoRestRoute>(path: T, params: ParseUrlParams<T>) => {

  const url = Object.entries<string>(params).reduce<string>((uiPath, [key, value]) => uiPath.replace(`:${key}`, value), path)
  // clean url

  return url.replace(/(\(|\)|\/?:[^/]+)/g, '')
}

export const isCaminoRestRoute = (route: string): route is CaminoRestRoute => IDS.includes(route)