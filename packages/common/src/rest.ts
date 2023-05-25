import { ZodType, z } from 'zod'
import {
  documentIdValidator,
  entrepriseDocumentInputValidator,
  entrepriseDocumentValidator,
  entrepriseIdValidator,
  entrepriseModificationValidator,
  entrepriseTypeValidator,
  sirenValidator,
} from './entreprise.js'
import { demarcheGetValidator, demarcheIdValidator } from './demarche.js'
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
import { caminoAnneeValidator, caminoDateValidator } from './date.js'
import { etapeTypeEtapeStatutWithMainStepValidator } from './etape.js'
import { statistiquesDGTMValidator, statistiquesGranulatsMarinsValidator, statistiquesGuyaneDataValidator, statistiquesMinerauxMetauxMetropoleValidator } from './statistiques.js'
import { fiscaliteValidator } from './fiscalite.js'
import { caminoConfigValidator } from './static/config.js'

type CaminoRoute<T extends string> = (keyof ZodParseUrlParams<T> extends never ? {} : { params: ZodParseUrlParams<T> }) & {
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
  '/rest/utilisateurs/:id/newsletter': { params: { id: z.string() }, get: { output: z.boolean() }, post: { input: newsletterAbonnementValidator, output: z.boolean() } },
  '/rest/utilisateurs/:id': { params: { id: z.string() }, delete: true },
  '/rest/utilisateurs/:id/permission': { params: { id: z.string() }, post: { input: utilisateurToEdit, output: z.void() } },
  '/rest/statistiques/minerauxMetauxMetropole': { get: { output: statistiquesMinerauxMetauxMetropoleValidator } },
  '/rest/statistiques/guyane': { get: { output: statistiquesGuyaneDataValidator } },
  '/rest/statistiques/granulatsMarins': { get: { output: statistiquesGranulatsMarinsValidator } },
  '/rest/titreSections/:titreId': { params: { titreId: z.string() }, get: { output: z.array(sectionValidator) } },
  '/rest/demarches/:demarcheId': { params: { demarcheId: demarcheIdValidator }, get: { output: demarcheGetValidator } },
  '/rest/titres/:titreId': { params: { titreId: z.string() }, get: { output: titreGetValidator }, delete: true, post: { output: z.void(), input: editableTitreValidator } },
  '/rest/titres/:titreId/abonne': { params: { titreId: z.string() }, post: { input: utilisateurTitreAbonneValidator, output: z.void() } },
  '/rest/titres/:titreId/date': { params: { titreId: z.string() }, get: { output: caminoDateValidator.nullable() } },
  '/rest/titresONF': { get: { output: z.array(titreOnfValidator) } },
  '/rest/titresPTMG': { get: { output: z.array(titrePtmgValidator) } },
  '/rest/titresDREAL': { get: { output: z.array(titreDrealValidator) } },
  '/rest/titres/:id/titreLiaisons': { params: { id: z.string() }, get: { output: titreLinksValidator }, post: { input: z.array(z.string()), output: titreLinksValidator } },
  '/rest/statistiques/dgtm': { get: { output: statistiquesDGTMValidator } },

  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { params: { entrepriseId: entrepriseIdValidator, annee: caminoAnneeValidator }, get: { output: fiscaliteValidator } },
  '/rest/entreprises': { post: { input: z.object({ siren: sirenValidator }), output: z.void() } },
  '/rest/entreprises/:entrepriseId': {
    params: { entrepriseId: entrepriseIdValidator },
    get: { output: entrepriseTypeValidator },
    put: { input: entrepriseModificationValidator, output: z.void() },
  },
  '/rest/entreprises/:entrepriseId/documents': {
    params: { entrepriseId: entrepriseIdValidator },
    post: { input: entrepriseDocumentInputValidator, output: z.union([documentIdValidator, z.custom<Error>()]) },
    get: { output: z.array(entrepriseDocumentValidator) },
  },
  '/rest/entreprises/:entrepriseId/documents/:documentId': { params: { entrepriseId: entrepriseIdValidator, documentId: documentIdValidator }, delete: true },
  '/rest/utilisateur/generateQgisToken': { post: { input: z.void(), output: qgisTokenValidator } },
  '/rest/etapesTypes/:demarcheId/:date': { params: { demarcheId: demarcheIdValidator, date: caminoDateValidator }, get: { output: z.array(etapeTypeEtapeStatutWithMainStepValidator) } },
  '/deconnecter': { get: { output: z.string() } },
  '/changerMotDePasse': { get: { output: z.string() } },
  '/download/fichiers/:documentId': { params: { documentId: documentIdValidator }, download: true },
  '/fichiers/:documentId': { params: { documentId: documentIdValidator }, download: true },
  '/titres/:id': { params: { id: z.string() }, download: true },
  '/titres': { download: true },
  '/titres_qgis': { download: true },
  '/demarches': { download: true },
  '/activites': { download: true },
  '/utilisateurs': { download: true },
  '/etape/zip/:etapeId': { params: { etapeId: z.string() }, download: true },
  '/etape/:etapeId/:fichierNom': { params: { etapeId: z.string(), fichierNom: z.string() }, download: true },
  '/entreprises': { download: true },
} as const satisfies { [k in CaminoRestRoute]: CaminoRoute<k> }

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

type ZodParseUrlParams<url> = url extends `${infer path}(${infer optionalPath})`
  ? ZodParseUrlParams<path> & Partial<ZodParseUrlParams<optionalPath>>
  : url extends `${infer start}/${infer rest}`
  ? ZodParseUrlParams<start> & ZodParseUrlParams<rest>
  : url extends `:${infer param}`
  ? { [k in param]: ZodType }
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

export type CaminoRestParams<Route extends CaminoRestRoute> = (typeof CaminoRestRoutes)[Route] extends { params: any }
  ? { [k in keyof (typeof CaminoRestRoutes)[Route]['params']]: z.infer<(typeof CaminoRestRoutes)[Route]['params'][k]> }
  : {}

export const getRestRoute = <T extends CaminoRestRoute>(path: T, params: CaminoRestParams<T>) => {
  const url = Object.entries<string>(params).reduce<string>((uiPath, [key, value]) => uiPath.replace(`:${key}`, value), path)
  // clean url

  return url.replace(/(\(|\)|\/?:[^/]+)/g, '')
}

export const isCaminoRestRoute = (route: string): route is CaminoRestRoute => IDS.includes(route)
