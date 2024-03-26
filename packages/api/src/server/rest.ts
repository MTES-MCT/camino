/* eslint-disable @typescript-eslint/ban-types */

import { Index } from '../types.js'
import type { Pool } from 'pg'

import express from 'express'
import { join } from 'path'
import { inspect } from 'node:util'

import { activites, demarches, entreprises, titre, titres, travaux } from '../api/rest/index.js'
import { NewDownload, etapeDocumentDownload, etapeFichier, etapeTelecharger, streamLargeObjectInResponse } from '../api/rest/fichiers.js'
import { getTitreLiaisons, postTitreLiaisons, removeTitre, titresAdministrations, titresONF, updateTitre, utilisateurTitreAbonner, getTitre, getUtilisateurTitreAbonner } from '../api/rest/titres.js'
import {
  creerEntreprise,
  fiscalite,
  getEntreprise,
  modifierEntreprise,
  getEntrepriseDocuments,
  postEntrepriseDocument,
  deleteEntrepriseDocument,
  entrepriseDocumentDownload,
  getAllEntreprises,
} from '../api/rest/entreprises.js'
import { deleteUtilisateur, generateQgisToken, isSubscribedToNewsletter, manageNewsletterSubscription, moi, updateUtilisateurPermission, utilisateurs } from '../api/rest/utilisateurs.js'
import { logout, resetPassword } from '../api/rest/keycloak.js'
import { getDGTMStats, getGranulatsMarinsStats, getGuyaneStats, getMinerauxMetauxMetropolesStats } from '../api/rest/statistiques/index.js'
import {
  CaminoRestRoutes,
  DownloadFormat,
  contentTypes,
  GetRestRoutes,
  PostRestRoutes,
  PutRestRoutes,
  DeleteRestRoutes,
  isCaminoRestRoute,
  DownloadRestRoutes,
  CaminoRestRoute,
  NewDownloadRestRoutes,
} from 'camino-common/src/rest.js'
import { CaminoConfig, caminoConfigValidator } from 'camino-common/src/static/config.js'
import { CaminoRequest, CustomResponse } from '../api/rest/express-type.js'
import { User } from 'camino-common/src/roles.js'
import { deleteEtape, deposeEtape, getEtapeDocuments, getEtapeEntrepriseDocuments, getEtapesTypesEtapesStatusWithMainStep } from '../api/rest/etapes.js'
import { z } from 'zod'
import { getCommunes } from '../api/rest/communes.js'
import { SendFileOptions } from 'express-serve-static-core'
import { activiteDocumentDownload, getActivite, updateActivite, deleteActivite } from '../api/rest/activites.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { getDemarcheByIdOrSlug } from '../api/rest/demarches.js'
import { geojsonImport, geojsonImportPoints, convertGeojsonPointsToGeoSystemeId, getPerimetreInfos, geojsonImportForages } from '../api/rest/perimetre.js'
import { getDataGouvStats } from '../api/rest/statistiques/datagouv.js'
import { addAdministrationActiviteTypeEmails, deleteAdministrationActiviteTypeEmails, getAdministrationActiviteTypeEmails, getAdministrationUtilisateurs } from '../api/rest/administrations.js'
import { titreDemandeCreer } from '../api/rest/titre-demande.js'
import { config } from '../config/index.js'

interface IRestResolverResult {
  nom: string
  format: DownloadFormat
  contenu?: string
  filePath?: string
  buffer?: Buffer
}

type IRestResolver = (
  {
    params,
    query,
  }: {
    params: Index<unknown>
    query: Index<unknown>
  },
  user: User
) => Promise<IRestResolverResult | null>

type RestGetCall<Route extends GetRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<(typeof CaminoRestRoutes)[Route]['get']['output']>>) => Promise<void>
type RestPostCall<Route extends PostRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<(typeof CaminoRestRoutes)[Route]['post']['output']>>) => Promise<void>
type RestPutCall<Route extends PutRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<(typeof CaminoRestRoutes)[Route]['put']['output']>>) => Promise<void>
type RestDeleteCall = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<void | Error>) => Promise<void>
type RestDownloadCall = (pool: Pool) => IRestResolver

type Transform<Route> = (Route extends GetRestRoutes ? { get: RestGetCall<Route> } : {}) &
  (Route extends PostRestRoutes ? { post: RestPostCall<Route> } : {}) &
  (Route extends PutRestRoutes ? { put: RestPutCall<Route> } : {}) &
  (Route extends DeleteRestRoutes ? { delete: RestDeleteCall } : {}) &
  (Route extends NewDownloadRestRoutes ? { newDownload: NewDownload } : {}) &
  (Route extends DownloadRestRoutes ? { download: RestDownloadCall } : {})

const getConfig = (_pool: Pool) => async (_req: CaminoRequest, res: CustomResponse<CaminoConfig>) => {
  const caminoConfig: CaminoConfig = {
    CAMINO_STAGE: config().CAMINO_STAGE,
    SENTRY_DSN: config().SENTRY_DSN,
    API_MATOMO_URL: config().API_MATOMO_URL,
    API_MATOMO_ID: config().API_MATOMO_ID,
  }

  res.json(caminoConfigValidator.parse(caminoConfig))
}

const restRouteImplementations: Readonly<{ [key in CaminoRestRoute]: Transform<key> }> = {
  // NE PAS TOUCHER A CES ROUTES, ELLES SONT UTILISÉES HORS UI
  '/download/fichiers/:documentId': { newDownload: etapeDocumentDownload },
  '/download/entrepriseDocuments/:documentId': { newDownload: entrepriseDocumentDownload },
  '/download/activiteDocuments/:documentId': { newDownload: activiteDocumentDownload },
  '/fichiers/:documentId': { newDownload: etapeDocumentDownload },
  '/titres/:id': { download: titre },
  '/titres': { download: titres },
  '/titres_qgis': { download: titres },
  '/demarches': { download: demarches },
  '/travaux': { download: travaux },
  '/activites': { download: activites },
  '/utilisateurs': { download: utilisateurs },
  '/etape/zip/:etapeId': { download: etapeTelecharger },
  '/etape/:etapeId/:fichierNom': { download: etapeFichier },
  '/entreprises': { download: entreprises },
  // NE PAS TOUCHER A CES ROUTES, ELLES SONT UTILISÉES HORS UI

  '/moi': { get: moi },
  '/config': { get: getConfig },
  '/rest/titres/:id/titreLiaisons': { get: getTitreLiaisons, post: postTitreLiaisons },
  '/rest/etapesTypes/:demarcheId/:date': { get: getEtapesTypesEtapesStatusWithMainStep },
  '/rest/titres': { post: titreDemandeCreer },
  '/rest/titres/:titreId': { delete: removeTitre, post: updateTitre, get: getTitre },
  '/rest/titres/:titreId/abonne': { post: utilisateurTitreAbonner, get: getUtilisateurTitreAbonner },
  '/rest/titresONF': { get: titresONF },
  '/rest/titresAdministrations': { get: titresAdministrations },
  '/rest/statistiques/minerauxMetauxMetropole': { get: getMinerauxMetauxMetropolesStats }, // UNTESTED YET
  '/rest/statistiques/guyane': { get: getGuyaneStats },
  '/rest/statistiques/guyane/:annee': { get: getGuyaneStats },
  '/rest/statistiques/granulatsMarins': { get: getGranulatsMarinsStats },
  '/rest/statistiques/granulatsMarins/:annee': { get: getGranulatsMarinsStats },
  '/rest/statistiques/dgtm': { get: getDGTMStats },
  '/rest/statistiques/datagouv': { get: getDataGouvStats },
  '/rest/demarches/:demarcheIdOrSlug': { get: getDemarcheByIdOrSlug },
  '/rest/utilisateur/generateQgisToken': { post: generateQgisToken },
  '/rest/utilisateurs/:id/permission': { post: updateUtilisateurPermission },
  '/rest/utilisateurs/:id/delete': { get: deleteUtilisateur },
  '/rest/utilisateurs/:id/newsletter': { get: isSubscribedToNewsletter, post: manageNewsletterSubscription }, // UNTESTED YET
  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { get: fiscalite }, // UNTESTED YET
  '/rest/entreprises/:entrepriseId': { get: getEntreprise, put: modifierEntreprise },
  '/rest/entreprises/:entrepriseId/documents': { get: getEntrepriseDocuments, post: postEntrepriseDocument },
  '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId': { delete: deleteEntrepriseDocument },
  '/rest/entreprises': { post: creerEntreprise, get: getAllEntreprises },
  '/rest/administrations/:administrationId/utilisateurs': { get: getAdministrationUtilisateurs },
  '/rest/administrations/:administrationId/activiteTypeEmails': { get: getAdministrationActiviteTypeEmails, post: addAdministrationActiviteTypeEmails },
  '/rest/administrations/:administrationId/activiteTypeEmails/delete': { post: deleteAdministrationActiviteTypeEmails },
  '/rest/demarches/:demarcheId/geojson': { get: getPerimetreInfos },
  '/rest/etapes/:etapeId/geojson': { get: getPerimetreInfos },
  '/rest/etapes/:etapeId': { delete: deleteEtape },
  '/rest/etapes/:etapeId/depot': { put: deposeEtape },
  '/rest/etapes/:etapeId/entrepriseDocuments': { get: getEtapeEntrepriseDocuments },
  '/rest/etapes/:etapeId/etapeDocuments': { get: getEtapeDocuments },
  '/rest/activites/:activiteId': { get: getActivite, put: updateActivite, delete: deleteActivite },
  '/rest/communes': { get: getCommunes },
  '/rest/geojson/import/:geoSystemeId': { post: geojsonImport },
  '/rest/geojson_points/import/:geoSystemeId': { post: geojsonImportPoints },
  '/rest/geojson_forages/import/:geoSystemeId': { post: geojsonImportForages },
  '/rest/geojson_points/:geoSystemeId': { post: convertGeojsonPointsToGeoSystemeId },
  '/deconnecter': { get: logout },
  '/changerMotDePasse': { get: resetPassword },
} as const

export const restWithPool = (dbPool: Pool) => {
  const rest = express.Router()

  Object.keys(restRouteImplementations)
    .filter(isCaminoRestRoute)
    .forEach(route => {
      const maRoute = restRouteImplementations[route]
      if ('get' in maRoute) {
        console.info(`GET ${route}`)
        rest.get(route, restCatcher(maRoute.get(dbPool)))
      }
      if ('post' in maRoute) {
        console.info(`POST ${route}`)
        rest.post(route, restCatcher(maRoute.post(dbPool)))
      }
      if ('put' in maRoute) {
        console.info(`PUT ${route}`)
        rest.put(route, restCatcher(maRoute.put(dbPool)))
      }

      if ('delete' in maRoute) {
        console.info(`delete ${route}`)
        rest.delete(route, restCatcher(maRoute.delete(dbPool)))
      }

      if ('download' in maRoute) {
        console.info(`download ${route}`)
        rest.get(route, restDownload(maRoute.download(dbPool)))
      }

      if ('newDownload' in maRoute) {
        console.info(`newDownload ${route}`)
        rest.get(route, restNewDownload(dbPool, maRoute.newDownload))
      }
    })

  rest.use((err: Error | null, _req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
    if (isNotNullNorUndefined(err)) {
      res.status(500)
      res.send({ error: err.message })

      return
    }

    next()
  })

  return rest
}

type ExpressRoute = (req: CaminoRequest, res: express.Response, next: express.NextFunction) => Promise<void>

const restCatcher = (expressCall: ExpressRoute) => async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
  try {
    await expressCall(req, res, next)
  } catch (e) {
    console.error('catching error', e)
    next(e)
  }
}

const restNewDownload = (pool: Pool, resolver: NewDownload) => async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.auth

    const result = await resolver(req.params, user, pool)

    await streamLargeObjectInResponse(pool, res, result.loid, result.fileName)
  } catch (e) {
    console.error(inspect(e, { depth: null }))

    next(e)
  }
}

const restDownload = (resolver: IRestResolver) => async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.auth

    const result = await resolver({ query: req.query, params: req.params }, user)

    if (!result) {
      throw new Error('erreur: aucun résultat')
    }

    const { nom, format, contenu, filePath, buffer } = result

    res.header('Content-disposition', `inline; filename=${encodeURIComponent(nom)}`)
    res.header('Content-Type', contentTypes[format])

    if (isNotNullNorUndefined(filePath) || isNotNullNorUndefined(buffer)) {
      res.header('x-sent', 'true')
      res.header('x-timestamp', Date.now().toString())
      const options: SendFileOptions = {
        dotfiles: 'deny',
        root: join(process.cwd(), 'files'),
      }

      if (isNotNullNorUndefined(filePath)) {
        res.sendFile(filePath, options, err => {
          if (isNotNullNorUndefined(err)) {
            console.error(`erreur de téléchargement ${err}`)
          }
          res.status(404).end()
        })
      }
      if (buffer) {
        res.header('Content-Length', `${buffer.length}`)
        res.send(buffer)
      }
    } else {
      res.send(contenu)
    }
  } catch (e) {
    console.error(inspect(e, { depth: null }))

    next(e)
  }
}
