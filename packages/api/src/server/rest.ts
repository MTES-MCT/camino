/* eslint-disable @typescript-eslint/ban-types */

import { Index } from '../types.js'
import type { Pool } from 'pg'

import express from 'express'
import { join } from 'path'

import { activites, demarches, entreprises, titre, titres } from '../api/rest/index.js'
import { etapeFichier, etapeTelecharger, fichier } from '../api/rest/fichiers.js'
import { getTitreLiaisons, postTitreLiaisons, removeTitre, titresDREAL, titresONF, titresPTMG, updateTitre, utilisateurTitreAbonner, getTitre, getTitreDate } from '../api/rest/titres.js'
import { creerEntreprise, fiscalite, getEntreprise, modifierEntreprise, getEntrepriseDocuments, postEntrepriseDocument, deleteEntrepriseDocument } from '../api/rest/entreprises.js'
import { deleteUtilisateur, generateQgisToken, isSubscribedToNewsletter, manageNewsletterSubscription, moi, updateUtilisateurPermission, utilisateurs } from '../api/rest/utilisateurs.js'
import { logout, resetPassword } from '../api/rest/keycloak.js'
import { getDGTMStats, getGranulatsMarinsStats, getGuyaneStats, getMinerauxMetauxMetropolesStats } from '../api/rest/statistiques/index.js'
import { CaminoRestRoute, CaminoRestRoutes, DownloadFormat, CaminoRestRouteIds, GetRestRoutes, PostRestRoutes, PutRestRoutes, DeleteRestRoutes, isCaminoRestRoute } from 'camino-common/src/rest.js'
import { CaminoConfig, caminoConfigValidator } from 'camino-common/src/static/config.js'
import { CaminoRequest, CustomResponse } from '../api/rest/express-type.js'
import { User } from 'camino-common/src/roles.js'
import { getTitresSections } from '../api/rest/titre-contenu.js'
import { getEtapesTypesEtapesStatusWithMainStep } from '../api/rest/etapes.js'
import { getDemarche } from '../api/rest/demarches.js'
import { z } from 'zod'
const contentTypes: Record<DownloadFormat, string> = {
  csv: 'text/csv',
  geojson: 'application/geo+json',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  json: 'application/json',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  zip: 'application/zip',
}

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

type Transform<Route> = (Route extends GetRestRoutes ? { get: RestGetCall<Route> } : {}) &
  (Route extends PostRestRoutes ? { post: RestPostCall<Route> } : {}) &
  (Route extends PutRestRoutes ? { put: RestPutCall<Route> } : {}) &
  (Route extends DeleteRestRoutes ? { delete: RestDeleteCall } : {})

type RestRouteImplementations<Route, Output = {}> = Route extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? RestRouteImplementations<Rest, { [key in First]: Transform<First> } & Output>
    : Output
  : Output

export const config = (_pool: Pool) => async (_req: CaminoRequest, res: CustomResponse<CaminoConfig>) => {
  const config: CaminoConfig = {
    sentryDsn: process.env.SENTRY_DSN,
    caminoStage: process.env.CAMINO_STAGE,
    environment: process.env.ENV ?? 'dev',
    uiHost: process.env.UI_HOST,
    matomoHost: process.env.API_MATOMO_URL,
    matomoSiteId: process.env.API_MATOMO_ID,
  }

  res.json(caminoConfigValidator.parse(config))
}

const restRouteImplementations: Readonly<RestRouteImplementations<CaminoRestRouteIds>> = {
  '/moi': { get: moi },
  '/config': { get: config },
  '/rest/titres/:id/titreLiaisons': { get: getTitreLiaisons, post: postTitreLiaisons },
  '/rest/titreSections/:titreId': { get: getTitresSections },
  '/rest/etapesTypes/:demarcheId/:date': { get: getEtapesTypesEtapesStatusWithMainStep },
  '/rest/demarches/:demarcheId': { get: getDemarche },
  '/rest/titres/:titreId': { delete: removeTitre, post: updateTitre, get: getTitre },
  '/rest/titres/:titreId/date': { get: getTitreDate },
  '/rest/titres/:titreId/abonne': { post: utilisateurTitreAbonner },
  '/rest/titresONF': { get: titresONF },
  '/rest/titresPTMG': { get: titresPTMG },
  '/rest/titresDREAL': { get: titresDREAL },
  '/rest/statistiques/minerauxMetauxMetropole': { get: getMinerauxMetauxMetropolesStats }, // UNTESTED YET
  '/rest/statistiques/guyane': { get: getGuyaneStats },
  '/rest/statistiques/granulatsMarins': { get: getGranulatsMarinsStats },
  '/rest/statistiques/dgtm': { get: getDGTMStats },
  '/rest/utilisateur/generateQgisToken': { post: generateQgisToken },
  '/rest/utilisateurs/:id/permission': { post: updateUtilisateurPermission },
  '/rest/utilisateurs/:id': { delete: deleteUtilisateur },
  '/rest/utilisateurs/:id/newsletter': { get: isSubscribedToNewsletter, post: manageNewsletterSubscription }, // UNTESTED YET
  '/rest/entreprises/:entrepriseId/fiscalite/:annee': { get: fiscalite }, // UNTESTED YET
  '/rest/entreprises/:entrepriseId': { get: getEntreprise, put: modifierEntreprise },
  '/rest/entreprises/:entrepriseId/documents': { get: getEntrepriseDocuments, post: postEntrepriseDocument },
  '/rest/entreprises/:entrepriseId/documents/:documentId': { delete: deleteEntrepriseDocument },
  '/rest/entreprises': { post: creerEntreprise },
  '/deconnecter': { get: logout },
  '/changerMotDePasse': { get: resetPassword },
} as const

export const restWithPool = (dbPool: Pool) => {
  const rest = express.Router()
  // NE PAS TOUCHER A CES ROUTES, ELLES SONT UTILISÉES HORS UI
  // rest.get(CaminoRestRoutes.downloadDownloadFichier, restDownload(fichier))
  // rest.get(CaminoRestRoutes.downloadFichier, restDownload(fichier))

  // rest.get(CaminoRestRoutes.downloadTitre, restDownload(titre))
  // rest.get(CaminoRestRoutes.downloadTitres, restDownload(titres))
  // rest.get(CaminoRestRoutes.downloadTitres_qgis, restDownload(titres))
  // rest.get(CaminoRestRoutes.downloadDemarches, restDownload(demarches))
  // rest.get(CaminoRestRoutes.downloadActivites, restDownload(activites))
  // rest.get(CaminoRestRoutes.downloadUtilisateurs, restDownload(utilisateurs))
  // rest.get(CaminoRestRoutes.downloadEtape, restDownload(etapeTelecharger))
  // rest.get(CaminoRestRoutes.downloadEtapeFichier, restDownload(etapeFichier))
  // rest.get(CaminoRestRoutes.downloadEntreprises, restDownload(entreprises))
  // NE PAS TOUCHER A CES ROUTES, ELLES SONT UTILISÉES HORS UI

  Object.keys(restRouteImplementations)
    .filter(isCaminoRestRoute)
    .forEach(route => {
      const maRoute = restRouteImplementations[route]
      if (maRoute) {
        if ('get' in maRoute) {
          rest.get(route, restCatcher(maRoute.get(dbPool)))
        }
        if ('post' in maRoute) {
          rest.post(route, restCatcher(maRoute.post(dbPool)))
        }
        if ('put' in maRoute) {
          rest.put(route, restCatcher(maRoute.put(dbPool)))
        }

        if ('delete' in maRoute) {
          rest.delete(route, restCatcher(maRoute.delete(dbPool)))
        }
      }
    })

  rest.use((err: Error, _req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
    if (err) {
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

    if (filePath || buffer) {
      res.header('x-sent', 'true')
      res.header('x-timestamp', Date.now().toString())
      const options = {
        dotfiles: 'deny',
        root: join(process.cwd(), 'files'),
      }

      if (filePath) {
        res.sendFile(filePath, options, err => {
          if (err) console.error(`erreur de téléchargement ${err}`)
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
    console.error(e)

    next(e)
  }
}
