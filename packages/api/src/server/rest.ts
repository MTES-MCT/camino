/* eslint-disable @typescript-eslint/ban-types */

import { CaminoApiError, Index } from '../types'
import type { Pool } from 'pg'

import express, { type Router } from 'express'
import { join } from 'path'
import { inspect } from 'node:util'

import { activites, demarches, entreprises, titre, titres, travaux } from '../api/rest/index'
import { NewDownload, avisDocumentDownload, etapeDocumentDownload, etapeTelecharger, streamLargeObjectInResponse } from '../api/rest/fichiers'
import { getTitreLiaisons, postTitreLiaisons, removeTitre, titresAdministrations, titresONF, updateTitre, utilisateurTitreAbonner, getTitre, getUtilisateurTitreAbonner } from '../api/rest/titres'
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
} from '../api/rest/entreprises'
import {
  deleteUtilisateur,
  generateQgisToken,
  isSubscribedToNewsletter,
  manageNewsletterSubscription,
  moi,
  updateUtilisateurPermission,
  utilisateurs,
  registerToNewsletter,
} from '../api/rest/utilisateurs'
import { logout, resetPassword } from '../api/rest/keycloak'
import { getDGTMStats, getGranulatsMarinsStats, getGuyaneStats, getMinerauxMetauxMetropolesStats } from '../api/rest/statistiques/index'
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
  NewGetRestRoutes,
} from 'camino-common/src/rest'
import { CaminoConfig, caminoConfigValidator } from 'camino-common/src/static/config'
import { CaminoRequest, CustomResponse } from '../api/rest/express-type'
import { User, UserNotNull } from 'camino-common/src/roles'
import { createEtape, deleteEtape, deposeEtape, getEtape, getEtapeAvis, getEtapeDocuments, getEtapeEntrepriseDocuments, getEtapesTypesEtapesStatusWithMainStep, updateEtape } from '../api/rest/etapes'
import { ZodType, z } from 'zod'
import { getCommunes } from '../api/rest/communes'
import { SendFileOptions } from 'express-serve-static-core'
import { activiteDocumentDownload, getActivite, updateActivite, deleteActivite } from '../api/rest/activites'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { getDemarcheByIdOrSlug, demarcheSupprimer } from '../api/rest/demarches'
import { geojsonImport, geojsonImportPoints, getPerimetreInfos, geojsonImportForages } from '../api/rest/perimetre'
import { getDataGouvStats } from '../api/rest/statistiques/datagouv'
import { addAdministrationActiviteTypeEmails, deleteAdministrationActiviteTypeEmails, getAdministrationActiviteTypeEmails, getAdministrationUtilisateurs } from '../api/rest/administrations'
import { titreDemandeCreer } from '../api/rest/titre-demande'
import { config } from '../config/index'
import { addLog } from '../api/rest/logs.queries'
import { HTTP_STATUS } from 'camino-common/src/http'
import { zodParseEffect } from '../tools/fp-tools'
import { Cause, Effect, Exit, pipe } from 'effect'

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
export type RestNewPostCall<Route extends NewPostRestRoutes> = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<z.infer<CaminoRestRoutesType[Route]['newPost']['input']>>,
  params: DeepReadonly<z.infer<CaminoRestRoutesType[Route]['params']>>
) => Effect.Effect<DeepReadonly<z.infer<CaminoRestRoutesType[Route]['newPost']['output']>>, CaminoApiError<string>>

type SearchParams<Route extends NewGetRestRoutes> = CaminoRestRoutesType[Route]['newGet'] extends { searchParams: ZodType } ? z.infer<CaminoRestRoutesType[Route]['newGet']['searchParams']> : undefined

export type RestNewGetCall<Route extends NewGetRestRoutes> = (
  pool: Pool,
  user: DeepReadonly<User>,
  params: DeepReadonly<z.infer<CaminoRestRoutesType[Route]['params']>>,
  searchParams: SearchParams<Route>
) => Effect.Effect<DeepReadonly<z.infer<CaminoRestRoutesType[Route]['newGet']['output']>>, CaminoApiError<string>>

type RestPostCall<Route extends PostRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<CaminoRestRoutesType[Route]['post']['output']>>) => Promise<void>
type RestPutCall<Route extends PutRestRoutes> = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<z.infer<CaminoRestRoutesType[Route]['put']['output']>>) => Promise<void>
type RestDeleteCall = (pool: Pool) => (req: CaminoRequest, res: CustomResponse<void | Error>) => Promise<void>
type RestDownloadCall = (pool: Pool) => IRestResolver

type Transform<Route> = (Route extends GetRestRoutes ? { getCall: RestGetCall<Route> } : {}) &
  (Route extends NewGetRestRoutes ? { newGetCall: RestNewGetCall<Route> } : {}) &
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
  '/rest/titres': { newPostCall: titreDemandeCreer, ...CaminoRestRoutes['/rest/titres'] },
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
  '/rest/demarches/:demarcheIdOrSlug': { getCall: getDemarcheByIdOrSlug, deleteCall: demarcheSupprimer, ...CaminoRestRoutes['/rest/demarches/:demarcheIdOrSlug'] },
  '/rest/utilisateurs/registerToNewsletter': { newGetCall: registerToNewsletter, ...CaminoRestRoutes['/rest/utilisateurs/registerToNewsletter'] },
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
export const restWithPool = (dbPool: Pool): Router => {
  const rest = express.Router()

  Object.keys(restRouteImplementations)
    .filter(isCaminoRestRoute)
    .forEach(route => {
      const maRoute = restRouteImplementations[route]
      if ('getCall' in maRoute) {
        console.info(`GET ${route}`)
        rest.get(route, restCatcher(maRoute.getCall(dbPool)))
      }
      if ('newGetCall' in maRoute) {
        console.info(`GET ${route}`)
        rest.get(route, async (req: CaminoRequest, res: express.Response, _next: express.NextFunction) => {
          try {
            const call = Effect.Do.pipe(
              Effect.bind('searchParams', () => {
                if ('searchParams' in maRoute.newGet) {
                  return zodParseEffect(maRoute.newGet.searchParams, req.query)
                }

                return Effect.succeed(undefined)
              }),
              Effect.bind('params', () => zodParseEffect(maRoute.params, req.params)),
              Effect.mapError(caminoError => {
                return { ...caminoError, status: HTTP_STATUS.BAD_REQUEST }
              }),
              // TODO 2024-06-26 ici, si on ne met pas les params et les searchParams à any, on se retrouve avec une typescript union hell qui fait tout planter
              Effect.bind<'result', { searchParams: any; params: any }, DeepReadonly<z.infer<(typeof maRoute)['newGet']['output']>>, CaminoApiError<string>, never>(
                'result',
                ({ searchParams, params }) => {
                  return maRoute.newGetCall(dbPool, req.auth, params, searchParams)
                }
              ),
              Effect.bind('parsedResult', ({ result }) =>
                pipe(
                  zodParseEffect(maRoute.newGet.output, result),
                  Effect.mapError(caminoError => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
                )
              ),
              Effect.mapBoth({
                onFailure: caminoError => {
                  console.warn(`problem with route ${route}: ${caminoError.message}`)
                  res.status(caminoError.status).json(caminoError)
                },
                onSuccess: ({ parsedResult }) => {
                  res.json(parsedResult)
                },
              }),
              Effect.runPromiseExit
            )

            const pipeline = await call
            if (Exit.isFailure(pipeline)) {
              if (!Cause.isFailType(pipeline.cause)) {
                console.error('catching error on newPost route', route, pipeline.cause, req.body)
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "une erreur inattendue s'est produite", extra: pipeline.cause })
              }
            }
          } catch (e) {
            console.error('catching error on newPost route', route, e, req.body)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "une erreur inattendue s'est produite", extra: e })
          }
        })
      }
      if ('postCall' in maRoute) {
        console.info(`POST ${route}`)
        rest.post(route, restCatcherWithMutation('post', maRoute.postCall(dbPool), dbPool))
      }

      if ('newPostCall' in maRoute) {
        console.info(`POST ${route}`)
        rest.post(route, async (req: CaminoRequest, res: express.Response, _next: express.NextFunction) => {
          try {
            const call = Effect.Do.pipe(
              Effect.bind('user', () => {
                if (isNotNullNorUndefined(req.auth)) {
                  return Effect.succeed(req.auth as UserNotNull)
                } else {
                  return Effect.fail({ message: 'Accès interdit', status: HTTP_STATUS.FORBIDDEN })
                }
              }),
              Effect.bind('body', () => zodParseEffect(maRoute.newPost.input, req.body)),
              Effect.bind('params', () => zodParseEffect(maRoute.params, req.params)),
              Effect.mapError(caminoError => {
                if (!('status' in caminoError)) {
                  return { ...caminoError, status: HTTP_STATUS.BAD_REQUEST }
                }

                return caminoError
              }),
              // TODO 2024-06-26 ici, si on ne met pas le body et params à any, on se retrouve avec une typescript union hell qui fait tout planter
              Effect.bind<'result', { body: any; user: UserNotNull; params: any }, DeepReadonly<z.infer<(typeof maRoute)['newPost']['output']>>, CaminoApiError<string>, never>(
                'result',
                ({ user, body, params }) => maRoute.newPostCall(dbPool, user, body, params)
              ),
              Effect.bind('parsedResult', ({ result }) =>
                pipe(
                  zodParseEffect(maRoute.newPost.output, result),
                  Effect.mapError(caminoError => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
                )
              ),
              Effect.mapBoth({
                onFailure: caminoError => {
                  console.warn(`problem with route ${route}: ${caminoError.message}`)
                  res.status(caminoError.status).json(caminoError)
                },
                onSuccess: ({ parsedResult, user }) => {
                  res.json(parsedResult)

                  return addLog(dbPool, user.id, 'post', req.url, req.body)
                },
              }),
              Effect.runPromiseExit
            )

            const pipeline = await call
            if (Exit.isFailure(pipeline)) {
              if (!Cause.isFailType(pipeline.cause)) {
                console.error('catching error on newPost route', route, pipeline.cause, req.body)
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "une erreur inattendue s'est produite", extra: pipeline.cause })
              }
            }
          } catch (e) {
            console.error('catching error on newPost route', route, e, req.body)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "une erreur inattendue s'est produite", extra: e })
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
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      await expressCall(req, res, next)
      await pipe(addLog(pool, user.id, method, req.url, req.body), Effect.runPromise)
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
