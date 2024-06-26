/* eslint-disable @typescript-eslint/ban-types */

import { CaminoApiError, Index } from '../types.js'
import type { Pool } from 'pg'

import TE from 'fp-ts/lib/TaskEither.js'
import express from 'express'
import { join } from 'path'
import { inspect } from 'node:util'

import { activites, demarches, entreprises, titre, titres, travaux } from '../api/rest/index.js'
import { NewDownload, avisDocumentDownload, etapeDocumentDownload, etapeTelecharger, streamLargeObjectInResponse } from '../api/rest/fichiers.js'
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
  NewPostRestRoutes,
} from 'camino-common/src/rest.js'
import { CaminoConfig, caminoConfigValidator } from 'camino-common/src/static/config.js'
import { CaminoRequest, CustomResponse } from '../api/rest/express-type.js'
import { User, UserNotNull } from 'camino-common/src/roles.js'
import {
  createEtape,
  deleteEtape,
  deposeEtape,
  getEtape,
  getEtapeAvis,
  getEtapeDocuments,
  getEtapeEntrepriseDocuments,
  getEtapesTypesEtapesStatusWithMainStep,
  updateEtape,
} from '../api/rest/etapes.js'
import { z } from 'zod'
import { getCommunes } from '../api/rest/communes.js'
import { SendFileOptions } from 'express-serve-static-core'
import { activiteDocumentDownload, getActivite, updateActivite, deleteActivite } from '../api/rest/activites.js'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { getDemarcheByIdOrSlug } from '../api/rest/demarches.js'
import { geojsonImport, geojsonImportPoints, getPerimetreInfos, geojsonImportForages } from '../api/rest/perimetre.js'
import { getDataGouvStats } from '../api/rest/statistiques/datagouv.js'
import { addAdministrationActiviteTypeEmails, deleteAdministrationActiviteTypeEmails, getAdministrationActiviteTypeEmails, getAdministrationUtilisateurs } from '../api/rest/administrations.js'
import { titreDemandeCreer } from '../api/rest/titre-demande.js'
import { config } from '../config/index.js'
import { addLog } from '../api/rest/logs.queries.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { pipe } from 'fp-ts/lib/function.js'
import { zodParseTaskEither } from '../tools/fp-tools.js'

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

type CaminoRestRoutesType = typeof CaminoRestRoutes
type RestGetCall<Route extends GetRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<DeepReadonly<z.infer<CaminoRestRoutesType[Route]['get']['output']>>>) => Promise<void>
type RestNewPostCall<Route extends NewPostRestRoutes> = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<z.infer<CaminoRestRoutesType[Route]['newPost']['input']>>,
  params: DeepReadonly<z.infer<CaminoRestRoutesType[Route]['params']>>
) => TE.TaskEither<CaminoApiError<string>, DeepReadonly<z.infer<CaminoRestRoutesType[Route]['newPost']['output']>>>
type RestPostCall<Route extends PostRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<CaminoRestRoutesType[Route]['post']['output']>>) => Promise<void>
type RestPutCall<Route extends PutRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<CaminoRestRoutesType[Route]['put']['output']>>) => Promise<void>
type RestDeleteCall = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<void | Error>) => Promise<void>
type RestDownloadCall = (pool: Pool) => IRestResolver

type Transform<Route> = (Route extends GetRestRoutes ? { getCall: RestGetCall<Route> } : {}) &
  (Route extends PostRestRoutes ? { postCall: RestPostCall<Route> } : {}) &
  (Route extends NewPostRestRoutes ? { newPostCall: RestNewPostCall<Route> } : {}) &
  (Route extends PutRestRoutes ? { putCall: RestPutCall<Route> } : {}) &
  (Route extends DeleteRestRoutes ? { deleteCall: RestDeleteCall } : {}) &
  (Route extends NewDownloadRestRoutes ? { newDownloadCall: NewDownload } : {}) &
  (Route extends DownloadRestRoutes ? { downloadCall: RestDownloadCall } : {})

const getConfig = (_pool: Pool) => async (_req: CaminoRequest, res: CustomResponse<CaminoConfig>) => {
  const caminoConfig: CaminoConfig = {
    CAMINO_STAGE: config().CAMINO_STAGE,
    API_MATOMO_URL: config().API_MATOMO_URL,
    API_MATOMO_ID: config().API_MATOMO_ID,
  }

  res.json(caminoConfigValidator.parse(caminoConfig))
}

const restRouteImplementations: Readonly<{ [key in CaminoRestRoute]: Transform<key> & CaminoRestRoutesType[key] }> = {
  // NE PAS TOUCHER A CES ROUTES, ELLES SONT UTILISÉES HORS UI
  '/download/fichiers/:documentId': { newDownloadCall: etapeDocumentDownload, ...CaminoRestRoutes['/download/fichiers/:documentId'] },
  '/download/entrepriseDocuments/:documentId': { newDownloadCall: entrepriseDocumentDownload, ...CaminoRestRoutes['/download/entrepriseDocuments/:documentId'] },
  '/download/activiteDocuments/:documentId': { newDownloadCall: activiteDocumentDownload, ...CaminoRestRoutes['/download/activiteDocuments/:documentId'] },
  '/download/avisDocument/:etapeAvisId': { newDownloadCall: avisDocumentDownload, ...CaminoRestRoutes['/download/avisDocument/:etapeAvisId'] },
  '/fichiers/:documentId': { newDownloadCall: etapeDocumentDownload, ...CaminoRestRoutes['/fichiers/:documentId'] },
  '/titres/:id': { downloadCall: titre, ...CaminoRestRoutes['/titres/:id'] },
  '/titres': { downloadCall: titres, ...CaminoRestRoutes['/titres'] },
  '/titres_qgis': { downloadCall: titres, ...CaminoRestRoutes['/titres_qgis'] },
  '/demarches': { downloadCall: demarches, ...CaminoRestRoutes['/demarches'] },
  '/travaux': { downloadCall: travaux, ...CaminoRestRoutes['/travaux'] },
  '/activites': { downloadCall: activites, ...CaminoRestRoutes['/activites'] },
  '/utilisateurs': { downloadCall: utilisateurs, ...CaminoRestRoutes['/utilisateurs'] },
  '/etape/zip/:etapeId': { downloadCall: etapeTelecharger, ...CaminoRestRoutes['/etape/zip/:etapeId'] },
  '/entreprises': { downloadCall: entreprises, ...CaminoRestRoutes['/entreprises'] },
  // NE PAS TOUCHER A CES ROUTES, ELLES SONT UTILISÉES HORS UI

  '/moi': { getCall: moi, ...CaminoRestRoutes['/moi'] },
  '/config': { getCall: getConfig, ...CaminoRestRoutes['/config'] },
  '/rest/titres/:id/titreLiaisons': { getCall: getTitreLiaisons, postCall: postTitreLiaisons, ...CaminoRestRoutes['/rest/titres/:id/titreLiaisons'] },
  '/rest/etapesTypes/:demarcheId/:date': { getCall: getEtapesTypesEtapesStatusWithMainStep, ...CaminoRestRoutes['/rest/etapesTypes/:demarcheId/:date'] },
  '/rest/titres': { postCall: titreDemandeCreer, ...CaminoRestRoutes['/rest/titres'] },
  '/rest/titres/:titreId': { deleteCall: removeTitre, postCall: updateTitre, getCall: getTitre, ...CaminoRestRoutes['/rest/titres/:titreId'] },
  '/rest/titres/:titreId/abonne': { postCall: utilisateurTitreAbonner, getCall: getUtilisateurTitreAbonner, ...CaminoRestRoutes['/rest/titres/:titreId/abonne'] },
  '/rest/titresONF': { getCall: titresONF, ...CaminoRestRoutes['/rest/titresONF'] },
  '/rest/titresAdministrations': { getCall: titresAdministrations, ...CaminoRestRoutes['/rest/titresAdministrations'] },
  '/rest/statistiques/minerauxMetauxMetropole': { getCall: getMinerauxMetauxMetropolesStats, ...CaminoRestRoutes['/rest/statistiques/minerauxMetauxMetropole'] }, // UNTESTED YET
  '/rest/statistiques/guyane': { getCall: getGuyaneStats, ...CaminoRestRoutes['/rest/statistiques/guyane'] },
  '/rest/statistiques/guyane/:annee': { getCall: getGuyaneStats, ...CaminoRestRoutes['/rest/statistiques/guyane/:annee'] },
  '/rest/statistiques/granulatsMarins': { getCall: getGranulatsMarinsStats, ...CaminoRestRoutes['/rest/statistiques/granulatsMarins'] },
  '/rest/statistiques/granulatsMarins/:annee': { getCall: getGranulatsMarinsStats, ...CaminoRestRoutes['/rest/statistiques/granulatsMarins/:annee'] },
  '/rest/statistiques/dgtm': { getCall: getDGTMStats, ...CaminoRestRoutes['/rest/statistiques/dgtm'] },
  '/rest/statistiques/datagouv': { getCall: getDataGouvStats, ...CaminoRestRoutes['/rest/statistiques/datagouv'] },
  '/rest/demarches/:demarcheIdOrSlug': { getCall: getDemarcheByIdOrSlug, ...CaminoRestRoutes['/rest/demarches/:demarcheIdOrSlug'] },
  '/rest/utilisateur/generateQgisToken': { postCall: generateQgisToken, ...CaminoRestRoutes['/rest/utilisateur/generateQgisToken'] },
  '/rest/utilisateurs/:id/permission': { postCall: updateUtilisateurPermission, ...CaminoRestRoutes['/rest/utilisateurs/:id/permission'] },
  '/rest/utilisateurs/:id/delete': { getCall: deleteUtilisateur, ...CaminoRestRoutes['/rest/utilisateurs/:id/delete'] },
  '/rest/utilisateurs/:id/newsletter': { getCall: isSubscribedToNewsletter, postCall: manageNewsletterSubscription, ...CaminoRestRoutes['/rest/utilisateurs/:id/newsletter'] }, // UNTESTED YET
  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { getCall: fiscalite, ...CaminoRestRoutes['/rest/entreprises/:entrepriseId/fiscalite/:annee'] }, // UNTESTED YET
  '/rest/entreprises/:entrepriseId': { getCall: getEntreprise, putCall: modifierEntreprise, ...CaminoRestRoutes['/rest/entreprises/:entrepriseId'] },
  '/rest/entreprises/:entrepriseId/documents': { getCall: getEntrepriseDocuments, postCall: postEntrepriseDocument, ...CaminoRestRoutes['/rest/entreprises/:entrepriseId/documents'] },
  '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId': { deleteCall: deleteEntrepriseDocument, ...CaminoRestRoutes['/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId'] },
  '/rest/entreprises': { postCall: creerEntreprise, getCall: getAllEntreprises, ...CaminoRestRoutes['/rest/entreprises'] },
  '/rest/administrations/:administrationId/utilisateurs': { getCall: getAdministrationUtilisateurs, ...CaminoRestRoutes['/rest/administrations/:administrationId/utilisateurs'] },
  '/rest/administrations/:administrationId/activiteTypeEmails': {
    getCall: getAdministrationActiviteTypeEmails,
    newPostCall: addAdministrationActiviteTypeEmails,
    ...CaminoRestRoutes['/rest/administrations/:administrationId/activiteTypeEmails'],
  },
  '/rest/administrations/:administrationId/activiteTypeEmails/delete': {
    newPostCall: deleteAdministrationActiviteTypeEmails,
    ...CaminoRestRoutes['/rest/administrations/:administrationId/activiteTypeEmails/delete'],
  },
  '/rest/demarches/:demarcheId/geojson': { getCall: getPerimetreInfos, ...CaminoRestRoutes['/rest/demarches/:demarcheId/geojson'] },
  '/rest/etapes/:etapeId/geojson': { getCall: getPerimetreInfos, ...CaminoRestRoutes['/rest/etapes/:etapeId/geojson'] },
  '/rest/etapes/:etapeIdOrSlug': { deleteCall: deleteEtape, getCall: getEtape, ...CaminoRestRoutes['/rest/etapes/:etapeIdOrSlug'] },
  '/rest/etapes': { postCall: createEtape, putCall: updateEtape, ...CaminoRestRoutes['/rest/etapes'] },
  '/rest/etapes/:etapeId/depot': { putCall: deposeEtape, ...CaminoRestRoutes['/rest/etapes/:etapeId/depot'] },
  '/rest/etapes/:etapeId/entrepriseDocuments': { getCall: getEtapeEntrepriseDocuments, ...CaminoRestRoutes['/rest/etapes/:etapeId/entrepriseDocuments'] },
  '/rest/etapes/:etapeId/etapeDocuments': { getCall: getEtapeDocuments, ...CaminoRestRoutes['/rest/etapes/:etapeId/etapeDocuments'] },
  '/rest/etapes/:etapeId/etapeAvis': { getCall: getEtapeAvis, ...CaminoRestRoutes['/rest/etapes/:etapeId/etapeAvis'] },
  '/rest/activites/:activiteId': { getCall: getActivite, putCall: updateActivite, deleteCall: deleteActivite, ...CaminoRestRoutes['/rest/activites/:activiteId'] },
  '/rest/communes': { getCall: getCommunes, ...CaminoRestRoutes['/rest/communes'] },
  '/rest/geojson/import/:geoSystemeId': { newPostCall: geojsonImport, ...CaminoRestRoutes['/rest/geojson/import/:geoSystemeId'] },
  '/rest/geojson_points/import/:geoSystemeId': { newPostCall: geojsonImportPoints, ...CaminoRestRoutes['/rest/geojson_points/import/:geoSystemeId'] },
  '/rest/geojson_forages/import/:geoSystemeId': { newPostCall: geojsonImportForages, ...CaminoRestRoutes['/rest/geojson_forages/import/:geoSystemeId'] },
  '/deconnecter': { getCall: logout, ...CaminoRestRoutes['/deconnecter'] },
  '/changerMotDePasse': { getCall: resetPassword, ...CaminoRestRoutes['/changerMotDePasse'] },
} as const
export const restWithPool = (dbPool: Pool) => {
  const rest = express.Router()

  Object.keys(restRouteImplementations)
    .filter(isCaminoRestRoute)
    .forEach(route => {
      const maRoute = restRouteImplementations[route]
      if ('getCall' in maRoute) {
        console.info(`GET ${route}`)
        rest.get(route, restCatcher(maRoute.getCall(dbPool)))
      }
      if ('postCall' in maRoute) {
        console.info(`POST ${route}`)
        rest.post(route, restCatcherWithMutation('post', maRoute.postCall(dbPool), dbPool))
      }

      if ('newPostCall' in maRoute) {
        console.info(`POST ${route}`)
        rest.post(route, async (req: CaminoRequest, res: express.Response, _next: express.NextFunction) => {
          try {
            const call = pipe(
              TE.Do,
              TE.bindW('user', () => {
                if (isNotNullNorUndefined(req.auth)) {
                  return TE.right(req.auth as UserNotNull)
                } else {
                  return TE.left({ message: 'Accès interdit', status: HTTP_STATUS.HTTP_STATUS_FORBIDDEN })
                }
              }),
              TE.bindW('body', () => zodParseTaskEither(maRoute.newPost.input, req.body)),
              TE.bindW('params', () => zodParseTaskEither(maRoute.params, req.params)),
              TE.mapLeft(caminoError => {
                if (!('status' in caminoError)) {
                  return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST }
                }

                return caminoError
              }),
              // TODO 2024-06-26 ici, si on ne met pas le body et params à any, on se retrouve avec une typescript union hell qui fait tout planter
              TE.bindW<'result', { body: any; user: UserNotNull; params: any }, CaminoApiError<string>, DeepReadonly<z.infer<(typeof maRoute)['newPost']['output']>>>(
                'result',
                ({ user, body, params }) => maRoute.newPostCall(dbPool, user, body, params)
              ),
              TE.bindW('parsedResult', ({ result }) =>
                pipe(
                  zodParseTaskEither(maRoute.newPost.output, result),
                  TE.mapLeft(caminoError => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR }))
                )
              ),
              TE.mapBoth(
                caminoError => {
                  console.warn(`problem with route ${route}: ${caminoError.message}`)
                  res.status(caminoError.status).json(caminoError)
                },
                ({ parsedResult, user }) => {
                  res.json(parsedResult)

                  return addLog(dbPool, user.id, 'post', req.url, req.body)
                }
              )
            )

            await call()
          } catch (e) {
            console.error('catching error on newPost route', route, e, req.body)
            res.status(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "une erreur inattendue s'est produite", extra: e })
          }
        })
      }

      if ('putCall' in maRoute) {
        console.info(`PUT ${route}`)
        rest.put(route, restCatcherWithMutation('put', maRoute.putCall(dbPool), dbPool))
      }

      if ('deleteCall' in maRoute) {
        console.info(`delete ${route}`)
        rest.delete(route, restCatcherWithMutation('delete', maRoute.deleteCall(dbPool), dbPool))
      }

      if ('downloadCall' in maRoute) {
        console.info(`download ${route}`)
        rest.get(route, restDownload(maRoute.downloadCall(dbPool)))
      }

      if ('newDownloadCall' in maRoute) {
        console.info(`newDownload ${route}`)
        rest.get(route, restNewDownload(dbPool, maRoute.newDownloadCall))
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
const restCatcherWithMutation = (method: string, expressCall: ExpressRoute, pool: Pool) => async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
  const user = req.auth
  try {
    if (!user) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else {
      await expressCall(req, res, next)
      await addLog(pool, user.id, method, req.url, req.body)()
    }
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
