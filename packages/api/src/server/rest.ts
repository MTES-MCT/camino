import { IFormat, Index, IUtilisateur } from '../types.js'

import express from 'express'
import { join } from 'path'

import {
  titre,
  titres,
  demarches,
  activites,
  entreprises
} from '../api/rest/index.js'
import {
  etapeFichier,
  etapeTelecharger,
  fichier
} from '../api/rest/fichiers.js'
import {
  getTitreLiaisons,
  postTitreLiaisons,
  titresDREAL,
  titresONF,
  titresPTMG
} from '../api/rest/titres.js'
import { fiscalite } from '../api/rest/entreprises.js'
import {
  generateQgisToken,
  isSubscribedToNewsletter,
  manageNewsletterSubscription,
  utilisateurs
} from '../api/rest/utilisateurs.js'
import {
  getDGTMStats,
  getGranulatsMarinsStats,
  getGuyaneStats,
  getMinerauxMetauxMetropolesStats
} from '../api/rest/statistiques/index.js'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import { CaminoConfig } from 'camino-common/src/static/config.js'
import { CustomResponse } from '../api/rest/express-type.js'
const contentTypes = {
  csv: 'text/csv',
  geojson: 'application/geojson',
  xlsx: 'application/xlsx',
  pdf: 'application/pdf',
  json: 'application/json'
} as { [id in IFormat]: string }

interface IRestResolverResult {
  nom: string
  format: IFormat
  contenu?: string
  filePath?: string
  buffer?: Buffer
}

type IRestResolver = (
  {
    params,
    query
  }: {
    params: Index<unknown>
    query: Index<unknown>
  },
  userId?: string
) => Promise<IRestResolverResult | null>

export const rest = express.Router()

type ExpressRoute = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>
const restCatcher =
  (expressCall: ExpressRoute) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await expressCall(req, res, next)
    } catch (e) {
      console.error('catching error', e)
      next(e)
    }
  }

const restDownload =
  (resolver: IRestResolver) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const user = req.user as unknown as IUtilisateur | undefined
      const result = await resolver(
        { query: req.query, params: req.params },
        user?.id
      )

      if (!result) {
        throw new Error('erreur: aucun résultat')
      }

      const { nom, format, contenu, filePath, buffer } = result

      res.header(
        'Content-disposition',
        `inline; filename=${encodeURIComponent(nom)}`
      )
      res.header('Content-Type', contentTypes[format])

      if (filePath || buffer) {
        res.header('x-sent', 'true')
        res.header('x-timestamp', Date.now().toString())
        const options = {
          dotfiles: 'deny',
          root: join(process.cwd(), 'files')
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

export const config = async (
  _req: express.Request,
  res: CustomResponse<CaminoConfig>
) => {
  const config: CaminoConfig = {
    sentryDsn: process.env.SENTRY_DSN,
    caminoStage: process.env.CAMINO_STAGE,
    environment: process.env.ENV ?? 'dev',
    uiHost: process.env.UI_HOST,
    matomoHost: process.env.API_MATOMO_URL,
    matomoSiteId: process.env.API_MATOMO_ID
  }

  res.json(config)
}
rest.get('/config', restCatcher(config))
rest.post('/titres/:id/titreLiaisons', restCatcher(postTitreLiaisons))
rest.get('/titres/:id/titreLiaisons', restCatcher(getTitreLiaisons))
rest.get('/titres/:id', restDownload(titre))
rest.get('/titres', restDownload(titres))
rest.get('/titres_qgis', restDownload(titres))
rest.get(CaminoRestRoutes.titresONF, restCatcher(titresONF))
rest.get(CaminoRestRoutes.titresPTMG, restCatcher(titresPTMG))
rest.get(CaminoRestRoutes.titresDREAL, restCatcher(titresDREAL))
rest.get(
  CaminoRestRoutes.statistiquesMinerauxMetauxMetropole,
  restCatcher(getMinerauxMetauxMetropolesStats)
)
rest.get(CaminoRestRoutes.statistiquesGuyane, restCatcher(getGuyaneStats))
rest.get(
  CaminoRestRoutes.statistiquesGranulatsMarins,
  restCatcher(getGranulatsMarinsStats)
)

rest.get(CaminoRestRoutes.statistiquesDGTM, restCatcher(getDGTMStats))
rest.get('/demarches', restDownload(demarches))
rest.get('/activites', restDownload(activites))
rest.post(CaminoRestRoutes.generateQgisToken, restCatcher(generateQgisToken))
rest.post(
  '/utilisateurs/:id/newsletter',
  restCatcher(manageNewsletterSubscription)
)
rest.get('/utilisateurs/:id/newsletter', restCatcher(isSubscribedToNewsletter))
rest.get('/utilisateurs', restDownload(utilisateurs))
rest.get(CaminoRestRoutes.fiscaliteEntreprise, restCatcher(fiscalite))
rest.get('/entreprises', restDownload(entreprises))
rest.get('/fichiers/:documentId', restDownload(fichier))
rest.get('/etape/zip/:etapeId', restDownload(etapeTelecharger))
rest.get('/etape/:etapeId/:fichierNom', restDownload(etapeFichier))

rest.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err) {
      res.status(500)
      res.send({ error: err.message })

      return
    }

    next()
  }
)
