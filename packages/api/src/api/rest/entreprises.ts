import { userGet } from '../../database/queries/utilisateurs'

import express from 'express'
import { IEntreprise, IUser } from '../../types'
import { Fiscalite, fiscaliteVisible } from 'camino-common/src/fiscalite'
import { constants } from 'http2'
import {
  apiOpenfiscaFetch,
  OpenfiscaRequest,
  OpenfiscaResponse
} from '../../tools/api-openfisca'
import { titresGet } from '../../database/queries/titres'
import { titresActivitesGet } from '../../database/queries/titres-activites'
import { entrepriseGet } from '../../database/queries/entreprises'
import TitresActivites from '../../database/models/titres-activites'
import Titres from '../../database/models/titres'
import { CustomResponse } from './express-type'

// VisibleForTesting
export const bodyBuilder = (
  activites: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<Titres, 'substances' | 'communes' | 'id'>[],
  annee: number,
  entreprise: Pick<IEntreprise, 'categorie' | 'nom'>
) => {
  // console.log('activites', JSON.stringify(activites.map(({titreId, contenu}) => ({titreId, contenu}))))
  // console.log('titres', JSON.stringify(titres.map(({substances, communes, id}) => ({substances, communes, id}))));
  // console.log('entreprise', {categorie: entreprise.categorie, nom: entreprise.nom})
  const anneePrecedente = annee - 1
  const body: OpenfiscaRequest = {
    articles: {},
    titres: {},
    communes: {}
  }

  for (const activite of activites) {
    const titre = titres.find(({ id }) => id === activite.titreId)

    if (!titre) {
      throw new Error(`le titre ${activite.titreId} n’est pas chargé`)
    }

    if (!titre.substances) {
      throw new Error(
        `les substances du titre ${activite.titreId} ne sont pas chargées`
      )
    }

    if (titre.substances.length > 0 && activite.contenu) {
      // TODO Laure, on fait bien les calculs que sur la substance principale ?
      // Pour le titre m-px-saint-pierre-2013 il n'y a pas d'ordre aux substances, il y'a or et substances connexes
      // d'après le code, il y'a un tri par ordre alphabétique, pas terrible non ?
      // plus inquiétant, cette étape à 11 substances non triées : EZtUs2fefrDZUw0wLAUK42p8

      const mainSubstance = titre.substances[0]
      const production = activite.contenu.substancesFiscales[mainSubstance.id]

      if (typeof production === 'number' && production > 0) {
        if (!titre.communes) {
          throw new Error(
            `les communes du titre ${titre.id} ne sont pas chargées`
          )
        }

        const surfaceTotale = titre.communes.reduce(
          (value, commune) => value + (commune.surface ?? 0),
          0
        )

        for (const commune of titre.communes) {
          const articleId = `${titre.id}-${mainSubstance.id}-${commune.id}`

          body.articles[articleId] = {
            surface_communale: { [anneePrecedente]: commune.surface ?? 0 },
            surface_totale: { [anneePrecedente]: surfaceTotale },
            // TODO Sandra, substance
            quantite_aurifere_kg: { [anneePrecedente]: production },
            redevance_communale_des_mines_aurifere_kg: {
              [annee]: null
            },
            redevance_departementale_des_mines_aurifere_kg: {
              [annee]: null
            }
            // TODO taxe guyane
            // TODO Sandra - elle ne fonctionne pas via OPENFISCA
            // TODO Laure - on calcule cette taxe que pour les titres Guyannais ?
          }

          if (!Object.prototype.hasOwnProperty.call(body.titres, titre.id)) {
            body.titres[titre.id] = {
              commune_principale_exploitation: {
                [anneePrecedente]: commune.id
              },
              operateur: {
                // TODO Sandra : ça sert à quoi ?
                [anneePrecedente]: entreprise.nom
              },
              // TODO Sandra, ça vient d’où ?
              investissement: {
                [anneePrecedente]: '1'
              },
              categorie: {
                [anneePrecedente]:
                  entreprise.categorie === 'PME' ? 'pme' : 'autre'
              },
              articles: [articleId]
            }
          } else {
            body.titres[titre.id].articles.push(articleId)
          }

          if (
            !Object.prototype.hasOwnProperty.call(body.communes, commune.id)
          ) {
            body.communes[commune.id] = { articles: [articleId] }
          } else {
            body.communes[commune.id].articles.push(articleId)
          }
        }
      }
    }
  }

  return body
}

// VisibleForTesting
export const responseExtractor = (result: OpenfiscaResponse, annee: number) => {
  const redevances: Fiscalite = Object.values(result.articles).reduce(
    (acc, article) => {
      // TODO Sandra, remplacer redevance_communale_des_mines_aurifere_kg par redevance_communale_des_mines_substance_unite
      acc.redevanceCommunale +=
        article.redevance_communale_des_mines_aurifere_kg?.[annee] ?? 0
      acc.redevanceDepartementale +=
        article.redevance_departementale_des_mines_aurifere_kg?.[annee] ?? 0

      // TODO Sandra, taxeAurifereGuyane et totalInvestissementsDeduits
      return acc
    },
    {
      redevanceCommunale: 0,
      redevanceDepartementale: 0,
      taxeAurifereGuyane: 0,
      totalInvestissementsDeduits: 0
    }
  )

  return redevances
}

export const fiscalite = async (
  req: express.Request<{ entrepriseId?: string }>,
  res: CustomResponse<Fiscalite>
) => {
  const userId = (req.user as unknown as IUser | undefined)?.id

  const user = await userGet(userId)

  const entrepriseId = req.params.entrepriseId

  if (!entrepriseId || !fiscaliteVisible(user, entrepriseId)) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const entreprise = await entrepriseGet(
      entrepriseId,
      { fields: { id: {} } },
      user
    )
    if (!entreprise) {
      throw new Error(`l’entreprise ${entrepriseId} est inconnue`)
    }

    // TODO gérer l’année
    const annee = 2022
    const anneePrecedente = annee - 1

    const titres = await titresGet(
      { entreprisesIds: [entrepriseId] },
      { fields: { substances: { id: {} }, communes: { id: {} } } },
      user
    )

    const activites = await titresActivitesGet(
      // TODO Laure, est-ce qu’il faut faire les WRP ?
      {
        typesIds: ['grx', 'gra', 'wrp'],
        // TODO Laure, que les déposées ? Pas les « en construction » ?
        statutsIds: ['dep'],
        annees: [anneePrecedente],
        titresIds: titres.map(({ id }) => id)
      },
      { fields: { id: {} } },
      user
    )

    const body = bodyBuilder(activites, titres, annee, entreprise)

    if (Object.keys(body.articles).length > 0) {
      const result = await apiOpenfiscaFetch(body)

      const redevances = responseExtractor(result, annee)

      console.log(JSON.stringify(result))
      console.log('redevanceCommunaleMinesAurifere', redevances)
      res.json(redevances)
    } else {
      res.json({
        redevanceCommunale: 0,
        redevanceDepartementale: 0,
        taxeAurifereGuyane: 0,
        totalInvestissementsDeduits: 0
      })
    }
  }
}
