import { IFormat, Index } from '../types.js'

import express from 'express'
import { join } from 'path'

import { activites, demarches, entreprises, titre, titres } from '../api/rest/index.js'
import { etapeFichier, etapeTelecharger, fichier } from '../api/rest/fichiers.js'
import { getTitreLiaisons, postTitreLiaisons, removeTitre, titresDREAL, titresONF, titresPTMG, updateTitre, utilisateurTitreAbonner } from '../api/rest/titres.js'
import { fiscalite, modifierEntreprise } from '../api/rest/entreprises.js'
import { deleteUtilisateur, generateQgisToken, isSubscribedToNewsletter, manageNewsletterSubscription, moi, updateUtilisateurPermission, utilisateurs } from '../api/rest/utilisateurs.js'
import { logout, resetPassword } from '../api/rest/keycloak.js'
import { getDGTMStats, getGranulatsMarinsStats, getGuyaneStats, getMinerauxMetauxMetropolesStats } from '../api/rest/statistiques/index.js'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import { CaminoConfig } from 'camino-common/src/static/config.js'
import { CaminoRequest, CustomResponse } from '../api/rest/express-type.js'
import { User } from 'camino-common/src/roles.js'
import { getTitresSections } from '../api/rest/titre-contenu.js'
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

export const rest = express.Router()

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
rest.get('/config', restCatcher(config))
rest.post(CaminoRestRoutes.titresLiaisons, restCatcher(postTitreLiaisons))
rest.get(CaminoRestRoutes.titresLiaisons, restCatcher(getTitreLiaisons))
rest.get('/titres/:id', restDownload(titre))
rest.get('/titres', restDownload(titres))
rest.get('/titres_qgis', restDownload(titres))
rest.get(CaminoRestRoutes.titreSections, restCatcher(getTitresSections))

rest.delete(CaminoRestRoutes.titre, restCatcher(removeTitre))
rest.post(CaminoRestRoutes.titre, restCatcher(updateTitre))

rest.post(CaminoRestRoutes.titreUtilisateurAbonne, restCatcher(utilisateurTitreAbonner))
rest.get(CaminoRestRoutes.titresONF, restCatcher(titresONF))
rest.get(CaminoRestRoutes.titresPTMG, restCatcher(titresPTMG))
rest.get(CaminoRestRoutes.titresDREAL, restCatcher(titresDREAL))
rest.get(CaminoRestRoutes.statistiquesMinerauxMetauxMetropole, restCatcher(getMinerauxMetauxMetropolesStats))
rest.get(CaminoRestRoutes.statistiquesGuyane, restCatcher(getGuyaneStats))
rest.get(CaminoRestRoutes.statistiquesGranulatsMarins, restCatcher(getGranulatsMarinsStats))

rest.get(CaminoRestRoutes.statistiquesDGTM, restCatcher(getDGTMStats))
rest.get('/demarches', restDownload(demarches))
rest.get('/activites', restDownload(activites))
rest.post(CaminoRestRoutes.generateQgisToken, restCatcher(generateQgisToken))
rest.post(CaminoRestRoutes.newsletter, restCatcher(manageNewsletterSubscription))
rest.post(CaminoRestRoutes.utilisateurPermission, restCatcher(updateUtilisateurPermission))
rest.delete(CaminoRestRoutes.utilisateur, restCatcher(deleteUtilisateur))
rest.get(CaminoRestRoutes.moi, restCatcher(moi))
rest.get(CaminoRestRoutes.newsletter, restCatcher(isSubscribedToNewsletter))
rest.get('/utilisateurs', restDownload(utilisateurs))
rest.get(CaminoRestRoutes.fiscaliteEntreprise, restCatcher(fiscalite))
rest.put(CaminoRestRoutes.entreprise, restCatcher(modifierEntreprise))
rest.get(CaminoRestRoutes.entreprises, restDownload(entreprises))
rest.get('/fichiers/:documentId', restDownload(fichier))
rest.get('/etape/zip/:etapeId', restDownload(etapeTelecharger))
rest.get('/etape/:etapeId/:fichierNom', restDownload(etapeFichier))
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
