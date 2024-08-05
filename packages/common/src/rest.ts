/* eslint-disable @typescript-eslint/ban-types */
import { ZodObject, ZodType, ZodTypeAny, z } from 'zod'
import {
  entrepriseDocumentIdValidator,
  entrepriseDocumentInputValidator,
  etapeEntrepriseDocumentValidator,
  entrepriseDocumentValidator,
  entrepriseIdValidator,
  entrepriseModificationValidator,
  entrepriseTypeValidator,
  sirenValidator,
  entrepriseValidator,
} from './entreprise'
import { demarcheIdOrSlugValidator, demarcheIdValidator } from './demarche'
import { newsletterAbonnementValidator, newsletterRegistrationValidator, qgisTokenValidator, utilisateurToEdit, utilisateursSearchParamsValidator, utilisateursTableValidator } from './utilisateur'
import {
  editableTitreValidator,
  getDemarcheByIdOrSlugValidator,
  titreAdministrationValidator,
  titreDemandeOutputValidator,
  titreDemandeValidator,
  titreGetValidator,
  titreLinksValidator,
  utilisateurTitreAbonneValidator,
} from './titres'
import { adminUserNotNullValidator, userValidator, utilisateurIdValidator } from './roles'
import { caminoAnneeValidator, caminoDateValidator } from './date'
import {
  etapeDocumentIdValidator,
  etapeIdOrSlugValidator,
  etapeIdValidator,
  etapeTypeEtapeStatutWithMainStepValidator,
  getEtapeDocumentsByEtapeIdValidator,
  getEtapeAvisByEtapeIdValidator,
  etapeAvisIdValidator,
} from './etape'
import {
  statistiquesDGTMValidator,
  statistiquesDataGouvValidator,
  statistiquesGranulatsMarinsValidator,
  statistiquesGuyaneDataValidator,
  statistiquesMinerauxMetauxMetropoleValidator,
} from './statistiques'
import { fiscaliteValidator } from './validators/fiscalite'
import { caminoConfigValidator } from './static/config'
import { communeValidator } from './static/communes'
import { Expect, isFalse, isTrue } from './typescript-tools'
import { activiteDocumentIdValidator, activiteEditionValidator, activiteIdOrSlugValidator, activiteValidator } from './activite'
import { geoSystemeIdValidator } from './static/geoSystemes'
import {
  geojsonImportBodyValidator,
  geojsonImportForagesBodyValidator,
  geojsonImportForagesResponseValidator,
  geojsonImportPointBodyValidator,
  geojsonImportPointResponseValidator,
  geojsonInformationsValidator,
  perimetreInformationsValidator,
} from './perimetre'
import { titreIdOrSlugValidator, titreIdValidator } from './validators/titres'
import { administrationIdValidator } from './static/administrations'
import { administrationActiviteTypeEmailValidator } from './administrations'
import { flattenEtapeValidator, restEtapeCreationValidator, restEtapeModificationValidator } from './etape-form'

type CaminoRoute<T extends string> = { params: ZodObjectParsUrlParams<T> } & {
  get?: { output: ZodType; searchParams?: ZodType }
  newGet?: { output: ZodType; searchParams?: ZodType }
  post?: { input: ZodType; output: ZodType }
  newPost?: { input: ZodType; output: ZodType }
  put?: { input: ZodType; output: ZodType }
  delete?: true
  download?: true
  newDownload?: true
}

const IDS = [
  '/config',
  '/moi',
  '/rest/utilisateurs/registerToNewsletter',
  '/rest/utilisateurs/:id/newsletter',
  '/rest/utilisateurs/:id/delete',
  '/rest/utilisateurs/:id/permission',
  '/rest/utilisateurs',
  '/rest/statistiques/minerauxMetauxMetropole',
  '/rest/statistiques/guyane',
  '/rest/statistiques/guyane/:annee',
  '/rest/statistiques/granulatsMarins',
  '/rest/statistiques/granulatsMarins/:annee',
  '/rest/statistiques/datagouv',
  '/rest/titres',
  '/rest/titres/:titreId',
  '/rest/titres/:titreId/abonne',
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
  '/rest/administrations/:administrationId/activiteTypeEmails',
  '/rest/administrations/:administrationId/activiteTypeEmails/delete',
  '/rest/utilisateur/generateQgisToken',
  '/rest/etapesTypes/:demarcheId/:date',
  '/rest/demarches/:demarcheId/geojson',
  '/rest/etapes/:etapeId/geojson',
  '/rest/etapes/:etapeId/etapeDocuments',
  '/rest/etapes/:etapeId/etapeAvis',
  '/rest/etapes/:etapeId/entrepriseDocuments',
  '/rest/etapes/:etapeIdOrSlug',
  '/rest/etapes/:etapeId/depot',
  '/rest/etapes',
  '/rest/activites/:activiteId',
  '/rest/geojson/import/:geoSystemeId',
  '/rest/geojson_points/import/:geoSystemeId',
  '/rest/geojson_forages/import/:geoSystemeId',
  '/rest/communes',
  '/deconnecter',
  '/changerMotDePasse',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
  '/download/fichiers/:documentId',
  '/download/entrepriseDocuments/:documentId',
  '/download/avisDocument/:etapeAvisId',
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
  '/entreprises',
  // NE PAS TOUCHER CES ROUTES, UTILISÉES PAR D'AUTRES
] as const

export type CaminoRestRoute = (typeof IDS)[number]
const noParamsValidator = z.object({})
const utilisateurIdParamsValidator = z.object({ id: utilisateurIdValidator })
const entrepriseIdParamsValidator = z.object({ entrepriseId: entrepriseIdValidator })
const etapeIdParamsValidator = z.object({ etapeId: etapeIdValidator })
const administrationIdParamsValidator = z.object({ administrationId: administrationIdValidator })
const geoSystemIdParamsValidator = z.object({ geoSystemeId: geoSystemeIdValidator })
export const CaminoRestRoutes = {
  '/config': { params: noParamsValidator, get: { output: caminoConfigValidator } },
  '/moi': { params: noParamsValidator, get: { output: userValidator } },
  '/rest/utilisateurs/:id/newsletter': { params: utilisateurIdParamsValidator, get: { output: z.boolean() }, post: { input: newsletterAbonnementValidator, output: z.boolean() } },
  '/rest/utilisateurs/registerToNewsletter': { params: noParamsValidator, newGet: { output: z.boolean(), searchParams: newsletterRegistrationValidator } },
  // On passe par un http get plutot qu'un http delete car nous terminons par une redirection vers la deconnexion de oauth2, qui se traduit mal sur certains navigateurs et essaie de faire un delete sur une route get
  '/rest/utilisateurs/:id/delete': { params: utilisateurIdParamsValidator, get: { output: z.void() } },
  '/rest/utilisateurs/:id/permission': { params: utilisateurIdParamsValidator, post: { input: utilisateurToEdit, output: z.void() } },
  '/rest/utilisateurs': { params: noParamsValidator, newGet: { output: utilisateursTableValidator, searchParams: utilisateursSearchParamsValidator} },
  '/rest/statistiques/minerauxMetauxMetropole': { params: noParamsValidator, get: { output: statistiquesMinerauxMetauxMetropoleValidator } },
  '/rest/statistiques/guyane': { params: noParamsValidator, get: { output: statistiquesGuyaneDataValidator } },
  '/rest/statistiques/guyane/:annee': { params: z.object({ annee: caminoAnneeValidator }), get: { output: statistiquesGuyaneDataValidator } },
  '/rest/statistiques/granulatsMarins': { params: noParamsValidator, get: { output: statistiquesGranulatsMarinsValidator } },
  '/rest/statistiques/granulatsMarins/:annee': { params: z.object({ annee: caminoAnneeValidator }), get: { output: statistiquesGranulatsMarinsValidator } },
  '/rest/statistiques/datagouv': { params: noParamsValidator, get: { output: z.array(statistiquesDataGouvValidator) } },
  '/rest/titres': { params: noParamsValidator, newPost: { input: titreDemandeValidator, output: titreDemandeOutputValidator } },
  '/rest/titres/:titreId': { params: z.object({ titreId: titreIdOrSlugValidator }), get: { output: titreGetValidator }, delete: true, post: { output: z.void(), input: editableTitreValidator } },
  '/rest/titres/:titreId/abonne': { params: z.object({ titreId: titreIdValidator }), post: { input: utilisateurTitreAbonneValidator, output: z.void() }, get: { output: z.boolean() } },
  '/rest/titresAdministrations': { params: noParamsValidator, get: { output: z.array(titreAdministrationValidator) } },
  '/rest/titres/:id/titreLiaisons': { params: z.object({ id: titreIdValidator }), get: { output: titreLinksValidator }, post: { input: z.array(z.string()), output: titreLinksValidator } },
  '/rest/demarches/:demarcheIdOrSlug': { params: z.object({ demarcheIdOrSlug: demarcheIdOrSlugValidator }), get: { output: getDemarcheByIdOrSlugValidator }, delete: true },
  '/rest/statistiques/dgtm': { params: noParamsValidator, get: { output: statistiquesDGTMValidator } },

  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { params: z.object({ entrepriseId: entrepriseIdValidator, annee: caminoAnneeValidator }), get: { output: fiscaliteValidator } },
  '/rest/entreprises': { params: noParamsValidator, post: { input: z.object({ siren: sirenValidator }), output: z.void() }, get: { output: z.array(entrepriseValidator) } },
  '/rest/entreprises/:entrepriseId': {
    params: entrepriseIdParamsValidator,
    get: { output: entrepriseTypeValidator },
    put: { input: entrepriseModificationValidator, output: z.void() },
  },
  '/rest/entreprises/:entrepriseId/documents': {
    params: entrepriseIdParamsValidator,
    // TODO 2024-01-31 ne pas retourner une erreur, mais thrower une exception et la catcher plutôt ?
    post: { input: entrepriseDocumentInputValidator, output: z.union([entrepriseDocumentIdValidator, z.custom<Error>()]) },
    get: { output: z.array(entrepriseDocumentValidator) },
  },
  '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId': { params: z.object({ entrepriseId: entrepriseIdValidator, entrepriseDocumentId: entrepriseDocumentIdValidator }), delete: true },
  '/rest/administrations/:administrationId/utilisateurs': { params: administrationIdParamsValidator, get: { output: z.array(adminUserNotNullValidator) } },
  '/rest/administrations/:administrationId/activiteTypeEmails': {
    params: administrationIdParamsValidator,
    get: { output: z.array(administrationActiviteTypeEmailValidator) },
    newPost: { input: administrationActiviteTypeEmailValidator, output: z.boolean() },
  },
  '/rest/administrations/:administrationId/activiteTypeEmails/delete': {
    params: administrationIdParamsValidator,
    newPost: { input: administrationActiviteTypeEmailValidator, output: z.boolean() },
  },
  '/rest/utilisateur/generateQgisToken': { params: noParamsValidator, post: { input: z.void(), output: qgisTokenValidator } },
  '/rest/etapesTypes/:demarcheId/:date': {
    params: z.object({ demarcheId: demarcheIdValidator, date: caminoDateValidator }),
    get: { output: z.array(etapeTypeEtapeStatutWithMainStepValidator), searchParams: z.object({ etapeId: etapeIdValidator.optional() }) },
  },
  '/rest/demarches/:demarcheId/geojson': { params: z.object({ demarcheId: demarcheIdOrSlugValidator }), get: { output: perimetreInformationsValidator } },
  '/rest/etapes/:etapeId/geojson': { params: z.object({ etapeId: etapeIdOrSlugValidator }), get: { output: perimetreInformationsValidator } },
  '/rest/etapes/:etapeId/etapeDocuments': { params: etapeIdParamsValidator, get: { output: getEtapeDocumentsByEtapeIdValidator } },
  '/rest/etapes/:etapeId/etapeAvis': { params: etapeIdParamsValidator, get: { output: getEtapeAvisByEtapeIdValidator } },
  '/rest/etapes/:etapeId/entrepriseDocuments': { params: etapeIdParamsValidator, get: { output: z.array(etapeEntrepriseDocumentValidator) } },
  '/rest/etapes/:etapeIdOrSlug': { params: z.object({ etapeIdOrSlug: etapeIdOrSlugValidator }), delete: true, get: { output: flattenEtapeValidator } },
  '/rest/etapes/:etapeId/depot': { params: etapeIdParamsValidator, put: { input: z.void(), output: z.void() } },
  '/rest/etapes': { params: noParamsValidator, post: { input: restEtapeCreationValidator, output: etapeIdValidator }, put: { input: restEtapeModificationValidator, output: etapeIdValidator } },
  '/rest/activites/:activiteId': {
    params: z.object({ activiteId: activiteIdOrSlugValidator }),
    get: { output: activiteValidator },
    put: { input: activiteEditionValidator, output: z.void() },
    delete: true,
  },
  '/rest/communes': { params: noParamsValidator, get: { output: z.array(communeValidator) } },
  '/rest/geojson/import/:geoSystemeId': {
    params: geoSystemIdParamsValidator,
    newPost: { input: geojsonImportBodyValidator, output: geojsonInformationsValidator },
  },
  '/rest/geojson_points/import/:geoSystemeId': {
    params: geoSystemIdParamsValidator,
    newPost: { input: geojsonImportPointBodyValidator, output: geojsonImportPointResponseValidator },
  },
  '/rest/geojson_forages/import/:geoSystemeId': {
    params: geoSystemIdParamsValidator,
    newPost: { input: geojsonImportForagesBodyValidator, output: geojsonImportForagesResponseValidator },
  },
  '/deconnecter': { params: noParamsValidator, get: { output: z.string() } },
  '/changerMotDePasse': { params: noParamsValidator, get: { output: z.string() } },
  '/download/fichiers/:documentId': { params: z.object({ documentId: etapeDocumentIdValidator }), newDownload: true },
  '/download/avisDocument/:etapeAvisId': { params: z.object({ etapeAvisId: etapeAvisIdValidator }), newDownload: true },
  '/download/entrepriseDocuments/:documentId': { params: z.object({ documentId: entrepriseDocumentIdValidator }), newDownload: true },
  '/download/activiteDocuments/:documentId': { params: z.object({ documentId: activiteDocumentIdValidator }), newDownload: true },
  '/fichiers/:documentId': { params: z.object({ documentId: etapeDocumentIdValidator }), newDownload: true },
  '/titres/:id': { params: z.object({ id: titreIdValidator }), download: true },
  '/titres': { params: noParamsValidator, download: true },
  '/titres_qgis': { params: noParamsValidator, download: true },
  '/demarches': { params: noParamsValidator, download: true },
  '/travaux': { params: noParamsValidator, download: true },
  '/activites': { params: noParamsValidator, download: true },
  '/utilisateurs': { params: noParamsValidator, download: true },
  '/etape/zip/:etapeId': { params: etapeIdParamsValidator, download: true },
  '/entreprises': { params: noParamsValidator, download: true },
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

type ZodObjectParsUrlParams<url> = ZodObject<ZodParseUrlParams<url>>

type ZodParseUrlParams<url> = url extends `${infer start}/${infer rest}` ? ZodParseUrlParams<start> & ZodParseUrlParams<rest> : url extends `:${infer param}` ? { [k in param]: ZodTypeAny } : {} // eslint-disable-line @typescript-eslint/ban-types

isTrue<Expect<ZodParseUrlParams<'/titre'>, {}>>
isFalse<Expect<ZodParseUrlParams<'/titre'>, { id: ZodType }>>
isTrue<Expect<ZodParseUrlParams<'/titre/:id'>, { id: ZodType }>>
isFalse<Expect<ZodParseUrlParams<'/titre/:id'>, {}>>
isTrue<Expect<ZodParseUrlParams<'/titre/:titreId/:demarcheId'>, { titreId: ZodType; demarcheId: ZodType }>>

type MethodVerb = Exclude<keyof CaminoRoute<string>, 'params'>
type can<T, Method extends MethodVerb> = T extends CaminoRestRoute ? ((typeof CaminoRestRoutes)[T] extends { [m in Method]: any } ? T : never) : never

type CaminoRestRouteList<Route, Method extends MethodVerb> = Route extends readonly [infer First, ...infer Remaining]
  ? First extends can<First, Method>
    ? [First, ...CaminoRestRouteList<Remaining, Method>]
    : CaminoRestRouteList<Remaining, Method>
  : []

export type GetRestRoutes = CaminoRestRouteList<typeof IDS, 'get'>[number]
export type NewGetRestRoutes = CaminoRestRouteList<typeof IDS, 'newGet'>[number]
export type PostRestRoutes = CaminoRestRouteList<typeof IDS, 'post'>[number]
export type NewPostRestRoutes = CaminoRestRouteList<typeof IDS, 'newPost'>[number]
export type DeleteRestRoutes = CaminoRestRouteList<typeof IDS, 'delete'>[number]
export type DownloadRestRoutes = CaminoRestRouteList<typeof IDS, 'download'>[number]
export type NewDownloadRestRoutes = CaminoRestRouteList<typeof IDS, 'newDownload'>[number]
export type PutRestRoutes = CaminoRestRouteList<typeof IDS, 'put'>[number]

export type CaminoRestParams<Route extends CaminoRestRoute> = z.infer<(typeof CaminoRestRoutes)[Route]['params']>

export const getRestRoute = <T extends CaminoRestRoute>(path: T, params: CaminoRestParams<T>, searchParams: Record<string, string | string[]> = {}): string => {
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
