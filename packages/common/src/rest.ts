/* eslint-disable @typescript-eslint/ban-types */
import { ZodType, z } from 'zod'
import {
  documentIdValidator,
  entrepriseDocumentIdValidator,
  entrepriseDocumentInputValidator,
  etapeEntrepriseDocumentValidator,
  entrepriseDocumentValidator,
  entrepriseIdValidator,
  entrepriseModificationValidator,
  entrepriseTypeValidator,
  sirenValidator,
  entrepriseValidator,
} from './entreprise.js'
import { demarcheIdOrSlugValidator, demarcheIdValidator } from './demarche.js'
import { newsletterAbonnementValidator, qgisTokenValidator, utilisateurToEdit } from './utilisateur.js'
import {
  editableTitreValidator,
  getDemarcheByIdOrSlugValidator,
  titreAdministrationValidator,
  titreGetValidator,
  titreLinksValidator,
  titreOnfValidator,
  utilisateurTitreAbonneValidator,
} from './titres.js'
import { adminUserNotNullValidator, userValidator } from './roles.js'
import { caminoAnneeValidator, caminoDateValidator } from './date.js'
import { etapeIdOrSlugValidator, etapeIdValidator, etapeTypeEtapeStatutWithMainStepValidator } from './etape.js'
import {
  statistiquesDGTMValidator,
  statistiquesDataGouvValidator,
  statistiquesGranulatsMarinsValidator,
  statistiquesGuyaneDataValidator,
  statistiquesMinerauxMetauxMetropoleValidator,
} from './statistiques.js'
import { fiscaliteValidator } from './validators/fiscalite.js'
import { caminoConfigValidator } from './static/config.js'
import { communeValidator } from './static/communes.js'
import { Expect, isFalse, isTrue } from './typescript-tools.js'
import { activiteDocumentIdValidator, activiteEditionValidator, activiteIdOrSlugValidator, activiteValidator } from './activite.js'
import { transformableGeoSystemeIdValidator } from './static/geoSystemes.js'
import { featureCollectionPointsValidator, geojsonImportBodyValidator, geojsonImportPointBodyValidator, geojsonInformationsValidator, perimetreInformationsValidator } from './perimetre.js'
import { titreIdOrSlugValidator, titreIdValidator } from './validators/titres.js'
import { administrationIdValidator } from './static/administrations.js'

type CaminoRoute<T extends string> = (keyof ZodParseUrlParams<T> extends never ? {} : { params: ZodParseUrlParams<T> }) & {
  get?: { output: ZodType }
  post?: { input: ZodType; output: ZodType }
  put?: { input: ZodType; output: ZodType }
  delete?: true
  download?: true
  newDownload?: true
}

const IDS = [
  '/config',
  '/moi',
  '/rest/utilisateurs/:id/newsletter',
  '/rest/utilisateurs/:id/delete',
  '/rest/utilisateurs/:id/permission',
  '/rest/statistiques/minerauxMetauxMetropole',
  '/rest/statistiques/guyane',
  '/rest/statistiques/guyane/:annee',
  '/rest/statistiques/granulatsMarins',
  '/rest/statistiques/granulatsMarins/:annee',
  '/rest/statistiques/datagouv',
  '/rest/titres/:titreId',
  '/rest/titres/:titreId/abonne',
  '/rest/titresONF',
  '/rest/titresAdministrations',
  '/rest/titres/:id/titreLiaisons',
  '/rest/demarches/:demarcheIdOrSlug',
  '/rest/statistiques/dgtm',
  '/rest/entreprises/:entrepriseId/fiscalite/:annee',
  '/rest/entreprises',
  '/rest/entreprises/:entrepriseId',
  '/rest/entreprises/:entrepriseId/documents',
  '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId',
  '/rest/administrations/:administrationId/utilisateurs',
  '/rest/utilisateur/generateQgisToken',
  '/rest/etapesTypes/:demarcheId/:date',
  '/rest/demarches/:demarcheId/geojson',
  '/rest/etapes/:etapeId/geojson',
  '/rest/etapes/:etapeId/entrepriseDocuments',
  '/rest/etapes/:etapeId',
  '/rest/etapes/:etapeId/depot',
  '/rest/activites/:activiteId',
  '/rest/geojson/import/:geoSystemeId',
  '/rest/geojson_points/:geoSystemeId',
  '/rest/geojson_points/import/:geoSystemeId',
  '/rest/communes',
  '/deconnecter',
  '/changerMotDePasse',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
  '/download/fichiers/:documentId',
  '/download/entrepriseDocuments/:documentId',
  '/download/activiteDocuments/:documentId',
  '/fichiers/:documentId',
  '/titres/:id',
  '/titres',
  '/titres_qgis',
  '/demarches',
  '/travaux',
  '/activites',
  '/utilisateurs',
  '/etape/zip/:etapeId',
  '/etape/:etapeId/:fichierNom',
  '/entreprises',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
] as const

export type CaminoRestRoute = (typeof IDS)[number]

export const CaminoRestRoutes = {
  '/config': { get: { output: caminoConfigValidator } },
  '/moi': { get: { output: userValidator } },
  '/rest/utilisateurs/:id/newsletter': { params: { id: z.string() }, get: { output: z.boolean() }, post: { input: newsletterAbonnementValidator, output: z.boolean() } },
  // On passe par un http get plutot qu'un http delete car nous terminons par une redirection vers la deconnexion de oauth2, qui se traduit mal sur certains navigateurs et essaie de faire un delete sur une route get
  '/rest/utilisateurs/:id/delete': { params: { id: z.string() }, get: { output: z.void() } },
  '/rest/utilisateurs/:id/permission': { params: { id: z.string() }, post: { input: utilisateurToEdit, output: z.void() } },
  '/rest/statistiques/minerauxMetauxMetropole': { get: { output: statistiquesMinerauxMetauxMetropoleValidator } },
  '/rest/statistiques/guyane': { get: { output: statistiquesGuyaneDataValidator } },
  '/rest/statistiques/guyane/:annee': { params: { annee: caminoAnneeValidator }, get: { output: statistiquesGuyaneDataValidator } },
  '/rest/statistiques/granulatsMarins': { get: { output: statistiquesGranulatsMarinsValidator } },
  '/rest/statistiques/granulatsMarins/:annee': { params: { annee: caminoAnneeValidator }, get: { output: statistiquesGranulatsMarinsValidator } },
  '/rest/statistiques/datagouv': { get: { output: z.array(statistiquesDataGouvValidator) } },
  '/rest/titres/:titreId': { params: { titreId: titreIdOrSlugValidator }, get: { output: titreGetValidator }, delete: true, post: { output: z.void(), input: editableTitreValidator } },
  '/rest/titres/:titreId/abonne': { params: { titreId: titreIdValidator }, post: { input: utilisateurTitreAbonneValidator, output: z.void() }, get: { output: z.boolean() } },
  '/rest/titresONF': { get: { output: z.array(titreOnfValidator) } },
  '/rest/titresAdministrations': { get: { output: z.array(titreAdministrationValidator) } },
  '/rest/titres/:id/titreLiaisons': { params: { id: titreIdValidator }, get: { output: titreLinksValidator }, post: { input: z.array(z.string()), output: titreLinksValidator } },
  '/rest/demarches/:demarcheIdOrSlug': { params: { demarcheIdOrSlug: demarcheIdOrSlugValidator }, get: { output: getDemarcheByIdOrSlugValidator } },

  '/rest/statistiques/dgtm': { get: { output: statistiquesDGTMValidator } },

  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { params: { entrepriseId: entrepriseIdValidator, annee: caminoAnneeValidator }, get: { output: fiscaliteValidator } },
  '/rest/entreprises': { post: { input: z.object({ siren: sirenValidator }), output: z.void() }, get: { output: z.array(entrepriseValidator) } },
  '/rest/entreprises/:entrepriseId': {
    params: { entrepriseId: entrepriseIdValidator },
    get: { output: entrepriseTypeValidator },
    put: { input: entrepriseModificationValidator, output: z.void() },
  },
  '/rest/entreprises/:entrepriseId/documents': {
    params: { entrepriseId: entrepriseIdValidator },
    // TODO 2024-01-31 ne pas retourner une erreur, mais thrower une exception et la catcher plutôt ?
    post: { input: entrepriseDocumentInputValidator, output: z.union([entrepriseDocumentIdValidator, z.custom<Error>()]) },
    get: { output: z.array(entrepriseDocumentValidator) },
  },
  '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId': { params: { entrepriseId: entrepriseIdValidator, entrepriseDocumentId: entrepriseDocumentIdValidator }, delete: true },
  '/rest/administrations/:administrationId/utilisateurs': { params: { administrationId: administrationIdValidator }, get: { output: z.array(adminUserNotNullValidator) } },
  '/rest/utilisateur/generateQgisToken': { post: { input: z.void(), output: qgisTokenValidator } },
  '/rest/etapesTypes/:demarcheId/:date': { params: { demarcheId: demarcheIdValidator, date: caminoDateValidator }, get: { output: z.array(etapeTypeEtapeStatutWithMainStepValidator) } },
  '/rest/demarches/:demarcheId/geojson': { params: { demarcheId: demarcheIdOrSlugValidator }, get: { output: perimetreInformationsValidator } },
  '/rest/etapes/:etapeId/geojson': { params: { etapeId: etapeIdOrSlugValidator }, get: { output: perimetreInformationsValidator } },
  '/rest/etapes/:etapeId/entrepriseDocuments': { params: { etapeId: etapeIdValidator }, get: { output: z.array(etapeEntrepriseDocumentValidator) } },
  '/rest/etapes/:etapeId': { params: { etapeId: etapeIdValidator }, delete: true },
  '/rest/etapes/:etapeId/depot': { params: { etapeId: etapeIdValidator }, put: { input: z.void(), output: z.void() } },
  '/rest/activites/:activiteId': { params: { activiteId: activiteIdOrSlugValidator }, get: { output: activiteValidator }, put: { input: activiteEditionValidator, output: z.void() }, delete: true },
  '/rest/communes': { get: { output: z.array(communeValidator) } },
  '/rest/geojson_points/:geoSystemeId': { params: { geoSystemeId: transformableGeoSystemeIdValidator }, post: { input: featureCollectionPointsValidator, output: featureCollectionPointsValidator } },
  '/rest/geojson/import/:geoSystemeId': {
    params: { geoSystemeId: transformableGeoSystemeIdValidator },
    post: { input: geojsonImportBodyValidator, output: geojsonInformationsValidator },
  },
  '/rest/geojson_points/import/:geoSystemeId': {
    params: { geoSystemeId: transformableGeoSystemeIdValidator },
    post: { input: geojsonImportPointBodyValidator, output: featureCollectionPointsValidator },
  },
  '/deconnecter': { get: { output: z.string() } },
  '/changerMotDePasse': { get: { output: z.string() } },
  '/download/fichiers/:documentId': { params: { documentId: z.union([documentIdValidator, entrepriseDocumentIdValidator]) }, download: true },
  '/download/entrepriseDocuments/:documentId': { params: { documentId: entrepriseDocumentIdValidator }, newDownload: true },
  '/download/activiteDocuments/:documentId': { params: { documentId: activiteDocumentIdValidator }, newDownload: true },
  '/fichiers/:documentId': { params: { documentId: z.union([documentIdValidator, entrepriseDocumentIdValidator]) }, download: true },
  '/titres/:id': { params: { id: titreIdValidator }, download: true },
  '/titres': { download: true },
  '/titres_qgis': { download: true },
  '/demarches': { download: true },
  '/travaux': { download: true },
  '/activites': { download: true },
  '/utilisateurs': { download: true },
  '/etape/zip/:etapeId': { params: { etapeId: etapeIdValidator }, download: true },
  '/etape/:etapeId/:fichierNom': { params: { etapeId: etapeIdValidator, fichierNom: z.string() }, download: true },
  '/entreprises': { download: true },
} as const satisfies { [k in CaminoRestRoute]: CaminoRoute<k> }

const DOWNLOAD_FORMATS_IDS = ['xlsx', 'csv', 'ods', 'geojson', 'pdf', 'zip'] as const
export const DOWNLOAD_FORMATS = {
  Excel: 'xlsx',
  Csv: 'csv',
  Ods: 'ods',
  GeoJSON: 'geojson',
  PDF: 'pdf',
  Zip: 'zip',
} as const satisfies Record<string, (typeof DOWNLOAD_FORMATS_IDS)[number]>

const downloadFormatValidator = z.enum(DOWNLOAD_FORMATS_IDS)

export type DownloadFormat = z.infer<typeof downloadFormatValidator>

type ZodParseUrlParams<url> = url extends `${infer start}/${infer rest}` ? ZodParseUrlParams<start> & ZodParseUrlParams<rest> : url extends `:${infer param}` ? { [k in param]: ZodType } : {} // eslint-disable-line @typescript-eslint/ban-types

isTrue<Expect<ZodParseUrlParams<'/titre'>, {}>>
isFalse<Expect<ZodParseUrlParams<'/titre'>, { id: ZodType }>>
isTrue<Expect<ZodParseUrlParams<'/titre/:id'>, { id: ZodType }>>
isFalse<Expect<ZodParseUrlParams<'/titre/:id'>, {}>>
isTrue<Expect<ZodParseUrlParams<'/titre/:titreId/:demarcheId'>, { titreId: ZodType; demarcheId: ZodType }>>

type can<T, Method extends 'post' | 'get' | 'put' | 'delete' | 'download' | 'newDownload'> = T extends CaminoRestRoute
  ? (typeof CaminoRestRoutes)[T] extends { [m in Method]: any }
    ? T
    : never
  : never

type CaminoRestRouteList<Route, Method extends 'post' | 'get' | 'put' | 'delete' | 'download' | 'newDownload'> = Route extends readonly [infer First, ...infer Rest]
  ? First extends can<First, Method>
    ? [First, ...CaminoRestRouteList<Rest, Method>]
    : CaminoRestRouteList<Rest, Method>
  : []

export type GetRestRoutes = CaminoRestRouteList<typeof IDS, 'get'>[number]
export type PostRestRoutes = CaminoRestRouteList<typeof IDS, 'post'>[number]
export type DeleteRestRoutes = CaminoRestRouteList<typeof IDS, 'delete'>[number]
export type DownloadRestRoutes = CaminoRestRouteList<typeof IDS, 'download'>[number]
export type NewDownloadRestRoutes = CaminoRestRouteList<typeof IDS, 'newDownload'>[number]
export type PutRestRoutes = CaminoRestRouteList<typeof IDS, 'put'>[number]

export type CaminoRestParams<Route extends CaminoRestRoute> = (typeof CaminoRestRoutes)[Route] extends { params: any }
  ? { [k in keyof (typeof CaminoRestRoutes)[Route]['params']]: z.infer<(typeof CaminoRestRoutes)[Route]['params'][k]> }
  : {}

export const getRestRoute = <T extends CaminoRestRoute>(path: T, params: CaminoRestParams<T>, searchParams: Record<string, string | string[]> = {}) => {
  const urlParams = new URLSearchParams()
  Object.keys(searchParams).forEach(key => {
    const params = searchParams[key]
    if (typeof params === 'string') {
      urlParams.append(key, params)
    } else {
      for (const param of params) {
        urlParams.append(`${key}[]`, param)
      }
    }
  })

  const url = Object.entries<string>(params).reduce<string>((uiPath, [key, value]) => uiPath.replace(`:${key}`, value), path)
  // clean url

  return `${url.replace(/(\(|\)|\/?:[^/]+)/g, '')}${Object.keys(searchParams).length !== 0 ? `?${urlParams}` : ''}`
}

export const isCaminoRestRoute = (route: string): route is CaminoRestRoute => IDS.includes(route)

export const contentTypes: Record<DownloadFormat, string> = {
  csv: 'text/csv',
  geojson: 'application/geo+json',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  zip: 'application/zip',
}
