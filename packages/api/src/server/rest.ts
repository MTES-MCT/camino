import { IFormat, Index, IUser } from '../types'

import express from 'express'
import { join } from 'path'

import { debug } from '../config/index'
import {
  titre,
  titres,
  demarches,
  activites,
  utilisateurs,
  entreprises
} from '../api/rest/index'
import { etapeFichier, etapeTelecharger, fichier } from '../api/rest/fichiers'
import {
  getTitreLiaisons,
  titresDREAL,
  titresONF,
  titresPTMG
} from '../api/rest/titres'
import { fiscalite } from '../api/rest/entreprises'

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

const rest = express.Router()

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
      const user = req.user as unknown as IUser | undefined
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
      if (debug) {
        console.error(e)
      }

      next(e)
    }
  }

rest.get('/titres/:id/titreLiaisons', restCatcher(getTitreLiaisons))
rest.get('/titres/:id', restDownload(titre))
rest.get('/titres', restDownload(titres))
rest.get('/titresONF', restCatcher(titresONF))
rest.get('/titresPTMG', restCatcher(titresPTMG))
rest.get('/titresDREAL', restCatcher(titresDREAL))
rest.get('/demarches', restDownload(demarches))
rest.get('/activites', restDownload(activites))
rest.get('/utilisateurs', restDownload(utilisateurs))
rest.get('/entreprises/:entrepriseId/fiscalite', restCatcher(fiscalite))
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

export { rest }
