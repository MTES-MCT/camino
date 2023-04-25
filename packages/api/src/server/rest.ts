import { IFormat, Index } from '../types.js'
import type { Pool } from 'pg'
import { pool } from '../pg-database.js'

import express from 'express'
import { join } from 'path'

import { activites, demarches, entreprises, titre, titres } from '../api/rest/index.js'
import { etapeFichier, etapeTelecharger, fichier } from '../api/rest/fichiers.js'
import { getTitreLiaisons, postTitreLiaisons, removeTitre, titresDREAL, titresONF, titresPTMG, updateTitre, utilisateurTitreAbonner, getTitre } from '../api/rest/titres.js'
import { creerEntreprise, fiscalite, modifierEntreprise } from '../api/rest/entreprises.js'
import { deleteUtilisateur, generateQgisToken, isSubscribedToNewsletter, manageNewsletterSubscription, moi, updateUtilisateurPermission, utilisateurs } from '../api/rest/utilisateurs.js'
import { logout, resetPassword } from '../api/rest/keycloak.js'
import { getDGTMStats, getGranulatsMarinsStats, getGuyaneStats, getMinerauxMetauxMetropolesStats } from '../api/rest/statistiques/index.js'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import { CaminoConfig } from 'camino-common/src/static/config.js'
import { CaminoRequest, CustomResponse } from '../api/rest/express-type.js'
import { User } from 'camino-common/src/roles.js'
import { getTitresSections } from '../api/rest/titre-contenu.js'
import { getEtapesTypesEtapesStatusWithMainStep } from '../api/rest/etapes.js'
import { getDemarche } from '../api/rest/demarches.js'
const contentTypes = {
  csv: 'text/csv',
  geojson: 'application/geojson',
  xlsx: 'application/xlsx',
  pdf: 'application/pdf',
  json: 'application/json',
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
    query,
  }: {
    params: Index<unknown>
    query: Index<unknown>
  },
  user: User
) => Promise<IRestResolverResult | null>

export const restWithPool = (dbPool: Pool = pool) => {
  const rest = express.Router()
  rest.get('/download/titres/:id', restDownload(titre))
  rest.get('/download/titres', restDownload(titres))
  rest.get('/download/titres_qgis', restDownload(titres))
  rest.get('/download/demarches', restDownload(demarches))
  rest.get('/download/activites', restDownload(activites))
  rest.get('/download/utilisateurs', restDownload(utilisateurs))
  rest.get('/download/fichiers/:documentId', restDownload(fichier))
  rest.get('/download/etape/zip/:etapeId', restDownload(etapeTelecharger))
  rest.get('/download/etape/:etapeId/:fichierNom', restDownload(etapeFichier))
  rest.get(`/download${CaminoRestRoutes.entreprises}`, restDownload(entreprises))

  rest.get('/config', restCatcher(config))
  rest.post(CaminoRestRoutes.titresLiaisons, restCatcher(postTitreLiaisons))
  rest.get(CaminoRestRoutes.titresLiaisons, restCatcher(getTitreLiaisons))
  rest.get(CaminoRestRoutes.titreSections, restCatcher(getTitresSections))
  rest.get(CaminoRestRoutes.etapesTypesEtapesStatusWithMainStep, restCatcher(getEtapesTypesEtapesStatusWithMainStep))

  rest.get(CaminoRestRoutes.demarche, restCatcher(getDemarche(dbPool)))

  rest.delete(CaminoRestRoutes.titre, restCatcher(removeTitre))
  rest.post(CaminoRestRoutes.titre, restCatcher(updateTitre))
  rest.get(CaminoRestRoutes.titre, restCatcher(getTitre(dbPool)))

  rest.post(CaminoRestRoutes.titreUtilisateurAbonne, restCatcher(utilisateurTitreAbonner))
  rest.get(CaminoRestRoutes.titresONF, restCatcher(titresONF))
  rest.get(CaminoRestRoutes.titresPTMG, restCatcher(titresPTMG))
  rest.get(CaminoRestRoutes.titresDREAL, restCatcher(titresDREAL))
  rest.get(CaminoRestRoutes.statistiquesMinerauxMetauxMetropole, restCatcher(getMinerauxMetauxMetropolesStats))
  rest.get(CaminoRestRoutes.statistiquesGuyane, restCatcher(getGuyaneStats))
  rest.get(CaminoRestRoutes.statistiquesGranulatsMarins, restCatcher(getGranulatsMarinsStats))

  rest.get(CaminoRestRoutes.statistiquesDGTM, restCatcher(getDGTMStats))
  rest.post(CaminoRestRoutes.generateQgisToken, restCatcher(generateQgisToken))
  rest.post(CaminoRestRoutes.newsletter, restCatcher(manageNewsletterSubscription))
  rest.post(CaminoRestRoutes.utilisateurPermission, restCatcher(updateUtilisateurPermission))
  rest.delete(CaminoRestRoutes.utilisateur, restCatcher(deleteUtilisateur))
  rest.get(CaminoRestRoutes.moi, restCatcher(moi))
  rest.get(CaminoRestRoutes.newsletter, restCatcher(isSubscribedToNewsletter))

  rest.get(CaminoRestRoutes.fiscaliteEntreprise, restCatcher(fiscalite))
  rest.put(CaminoRestRoutes.entreprise, restCatcher(modifierEntreprise))
  rest.post(CaminoRestRoutes.entreprises, restCatcher(creerEntreprise))
  rest.get('/deconnecter', restCatcher(logout))
  rest.get('/changerMotDePasse', restCatcher(resetPassword))

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

export const config = async (_req: CaminoRequest, res: CustomResponse<CaminoConfig>) => {
  const config: CaminoConfig = {
    sentryDsn: process.env.SENTRY_DSN,
    caminoStage: process.env.CAMINO_STAGE,
    environment: process.env.ENV ?? 'dev',
    uiHost: process.env.UI_HOST,
    matomoHost: process.env.API_MATOMO_URL,
    matomoSiteId: process.env.API_MATOMO_ID,
  }

  res.json(config)
}
