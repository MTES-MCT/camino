import { ZodType, z } from 'zod'
import { documentIdValidator, entrepriseDocumentInputValidator, entrepriseDocumentValidator, entrepriseModificationValidator, entrepriseTypeValidator, sirenValidator } from './entreprise.js'
import { demarcheGetValidator } from './demarche.js'
import { newsletterAbonnementValidator, qgisTokenValidator, utilisateurToEdit } from './utilisateur.js'
import {
  editableTitreValidator,
  sectionValidator,
  titreDrealValidator,
  titreGetValidator,
  titreLinksValidator,
  titreOnfValidator,
  titrePtmgValidator,
  utilisateurTitreAbonneValidator,
} from './titres.js'
import { userValidator } from './roles.js'
import { caminoDateValidator } from './date.js'
import { etapeTypeEtapeStatutWithMainStepValidator } from './etape.js'
import { statistiquesDGTMValidator, statistiquesGranulatsMarinsValidator, statistiquesGuyaneDataValidator, statistiquesMinerauxMetauxMetropoleValidator } from './statistiques.js'
import { fiscaliteValidator } from './fiscalite.js'
import { caminoConfigValidator } from './static/config.js'

type CaminoRoute = {
  get?: { output: ZodType }
  post?: { input: ZodType; output: ZodType }
  put?: { input: ZodType; output: ZodType }
  delete?: true
  download?: true
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
  '/rest/titres/:titreId/date',
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
  '/rest/etapesTypes/:demarcheId/:date',
  '/deconnecter',
  '/changerMotDePasse',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
  '/download/fichiers/:documentId',
  '/fichiers/:documentId',
  '/titres/:id',
  '/titres',
  '/titres_qgis',
  '/demarches',
  '/activites',
  '/utilisateurs',
  '/etape/zip/:etapeId',
  '/etape/:etapeId/:fichierNom',
  '/entreprises',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
] as const

export type CaminoRestRoute = (typeof IDS)[number]
export type CaminoRestRouteIds = typeof IDS

export const CaminoRestRoutes = {
  '/config': { get: { output: caminoConfigValidator } },
  '/moi': { get: { output: userValidator } },
  '/rest/utilisateurs/:id/newsletter': { get: { output: z.boolean() }, post: { input: newsletterAbonnementValidator, output: z.boolean() } },
  '/rest/utilisateurs/:id': { delete: true },
  '/rest/utilisateurs/:id/permission': { post: { input: utilisateurToEdit, output: z.void() } },
  '/rest/statistiques/minerauxMetauxMetropole': { get: { output: statistiquesMinerauxMetauxMetropoleValidator } },
  '/rest/statistiques/guyane': { get: { output: statistiquesGuyaneDataValidator } },
  '/rest/statistiques/granulatsMarins': { get: { output: statistiquesGranulatsMarinsValidator } },
  '/rest/titreSections/:titreId': { get: { output: z.array(sectionValidator) } },
  '/rest/demarches/:demarcheId': { get: { output: demarcheGetValidator } },
  '/rest/titres/:titreId': { get: { output: titreGetValidator }, delete: true, post: { output: z.void(), input: editableTitreValidator } },
  '/rest/titres/:titreId/abonne': { post: { input: utilisateurTitreAbonneValidator, output: z.void() } },
  '/rest/titres/:titreId/date': { get: { output: caminoDateValidator.nullable() } },
  '/rest/titresONF': { get: { output: z.array(titreOnfValidator) } },
  '/rest/titresPTMG': { get: { output: z.array(titrePtmgValidator) } },
  '/rest/titresDREAL': { get: { output: z.array(titreDrealValidator) } },
  '/rest/titres/:id/titreLiaisons': { get: { output: titreLinksValidator }, post: { input: z.array(z.string()), output: titreLinksValidator } },
  '/rest/statistiques/dgtm': { get: { output: statistiquesDGTMValidator } },

  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { get: { output: fiscaliteValidator } },
  '/rest/entreprises': { post: { input: z.object({ siren: sirenValidator }), output: z.void() } },
  '/rest/entreprises/:entrepriseId': {
    get: { output: entrepriseTypeValidator },
    put: { input: entrepriseModificationValidator, output: z.void() },
  },
  '/rest/entreprises/:entrepriseId/documents': {
    post: { input: entrepriseDocumentInputValidator, output: z.union([documentIdValidator, z.custom<Error>()]) },
    get: { output: z.array(entrepriseDocumentValidator) },
  },
  '/rest/entreprises/:entrepriseId/documents/:documentId': { delete: true },
  '/rest/utilisateur/generateQgisToken': { post: { input: z.void(), output: qgisTokenValidator } },
  '/rest/etapesTypes/:demarcheId/:date': { get: { output: z.array(etapeTypeEtapeStatutWithMainStepValidator) } },
  '/deconnecter': { get: { output: z.string() } },
  '/changerMotDePasse': { get: { output: z.string() } },
  '/download/fichiers/:documentId': { download: true },
  '/fichiers/:documentId': { download: true },
  '/titres/:id': { download: true },
  '/titres': { download: true },
  '/titres_qgis': { download: true },
  '/demarches': { download: true },
  '/activites': { download: true },
  '/utilisateurs': { download: true },
  '/etape/zip/:etapeId': { download: true },
  '/etape/:etapeId/:fichierNom': { download: true },
  '/entreprises': { download: true },
} as const satisfies Record<CaminoRestRoute, CaminoRoute>

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

type can<T, Method extends 'post' | 'get' | 'put' | 'delete' | 'download'> = T extends CaminoRestRoute ? ((typeof CaminoRestRoutes)[T] extends { [m in Method]: any } ? T : never) : never

type CaminoRestRouteList<Route, Method extends 'post' | 'get' | 'put' | 'delete' | 'download'> = Route extends readonly [infer First, ...infer Rest]
  ? First extends can<First, Method>
    ? [First, ...CaminoRestRouteList<Rest, Method>]
    : CaminoRestRouteList<Rest, Method>
  : []

export type GetRestRoutes = CaminoRestRouteList<typeof IDS, 'get'>[number]
export type PostRestRoutes = CaminoRestRouteList<typeof IDS, 'post'>[number]
export type DeleteRestRoutes = CaminoRestRouteList<typeof IDS, 'delete'>[number]
export type DownloadRestRoutes = CaminoRestRouteList<typeof IDS, 'download'>[number]
export type PutRestRoutes = CaminoRestRouteList<typeof IDS, 'put'>[number]

export const getRestRoute = <T extends CaminoRestRoute>(path: T, params: ParseUrlParams<T>) => {
  const url = Object.entries<string>(params).reduce<string>((uiPath, [key, value]) => uiPath.replace(`:${key}`, value), path)
  // clean url

  return url.replace(/(\(|\)|\/?:[^/]+)/g, '')
}

export const isCaminoRestRoute = (route: string): route is CaminoRestRoute => IDS.includes(route)
