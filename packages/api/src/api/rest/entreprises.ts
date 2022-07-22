import { userGet } from '../../database/queries/utilisateurs'

import express from 'express'
import { IEntreprise, IUser } from '../../types'
import {
  Fiscalite,
  FiscaliteFrance,
  FiscaliteGuyane,
  fiscaliteVisible
} from 'camino-common/src/fiscalite'
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
import { SubstancesFiscales } from 'camino-common/src/substance'
import { Departements } from 'camino-common/src/departement'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/region'

// VisibleForTesting
export const bodyBuilder = (
  activites: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<Titres, 'substances' | 'communes' | 'id'>[],
  annee: number,
  entreprise: Pick<IEntreprise, 'categorie' | 'nom'>
) => {
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

    if (!titre.communes?.length) {
      throw new Error(
        `les communes du titre ${activite.titreId} ne sont pas chargées`
      )
    }

    const titreGuyannais = titre.communes
      .map(({ departementId }) => departementId)
      .filter(isNotNullNorUndefined)
      .some(departementId => {
        return Regions[Departements[departementId].regionId].paysId === 'GF'
      })

    if (!titre.substances) {
      throw new Error(
        `les substances du titre ${activite.titreId} ne sont pas chargées`
      )
    }

    if (titre.substances.length > 0 && activite.contenu) {
      if (!titre.substances[0].legales) {
        throw new Error(
          `les substances légales des substances du titre ${activite.titreId} ne sont pas chargées`
        )
      }

      const substanceLegalesWithFiscales = titre.substances
        .flatMap(s => s.legales)
        .filter(isNotNullNorUndefined)
        .filter(s =>
          SubstancesFiscales.some(
            ({ substanceLegaleId }) => substanceLegaleId === s.id
          )
        )

      if (substanceLegalesWithFiscales.length > 1) {
        // TODO on fait quoi ? On calcule quand même ?
        console.error(
          'BOOM, titre avec plusieurs substances légales possédant plusieurs substances fiscales ',
          titre.id
        )
      }

      const substancesFiscales = substanceLegalesWithFiscales.flatMap(
        ({ id }) =>
          SubstancesFiscales.filter(
            ({ substanceLegaleId }) => substanceLegaleId === id
          )
      )

      for (const substancesFiscale of substancesFiscales) {
        const production =
          activite.contenu.substancesFiscales[substancesFiscale.id]

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
            const articleId = `${titre.id}-${substancesFiscale.id}-${commune.id}`

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
            }

            if (substancesFiscale.id === 'auru' && titreGuyannais) {
              body.articles[articleId].taxe_guyane_brute = { [annee]: null }
              body.articles[articleId].taxe_guyane_deduction = { [annee]: null }
              body.articles[articleId].taxe_guyane = { [annee]: null }
            }

            if (!Object.prototype.hasOwnProperty.call(body.titres, titre.id)) {
              body.titres[titre.id] = {
                commune_principale_exploitation: {
                  [anneePrecedente]: commune.id
                },
                operateur: {
                  [anneePrecedente]: entreprise.nom
                },
                // TODO C'est dans les rapports trimestriels (GRP)
                investissement: {
                  [anneePrecedente]: '10000'
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
  }

  return body
}

type Reduced =
  | { guyane: true; fiscalite: FiscaliteGuyane }
  | { guyane: false; fiscalite: FiscaliteFrance }
// VisibleForTesting
export const responseExtractor = (
  result: OpenfiscaResponse,
  annee: number
): Fiscalite => {
  const redevances: Reduced = Object.values(result.articles).reduce<Reduced>(
    (acc, article) => {
      // TODO Sandra, remplacer redevance_communale_des_mines_aurifere_kg par redevance_communale_des_mines_substance_unite
      acc.fiscalite.redevanceCommunale +=
        article.redevance_communale_des_mines_aurifere_kg?.[annee] ?? 0
      acc.fiscalite.redevanceDepartementale +=
        article.redevance_departementale_des_mines_aurifere_kg?.[annee] ?? 0

      if (!acc.guyane && 'taxe_guyane_brute' in article) {
        acc = {
          guyane: true,
          fiscalite: {
            ...acc.fiscalite,
            guyane: {
              taxeAurifereBrute: 0,
              taxeAurifere: 0,
              totalInvestissementsDeduits: 0
            }
          }
        }
      }
      if (acc.guyane) {
        acc.fiscalite.guyane.taxeAurifereBrute +=
          article.taxe_guyane_brute?.[annee] ?? 0
        acc.fiscalite.guyane.totalInvestissementsDeduits +=
          article.taxe_guyane_deduction?.[annee] ?? 0
        acc.fiscalite.guyane.taxeAurifere += article.taxe_guyane?.[annee] ?? 0
      }

      return acc
    },
    {
      guyane: false,
      fiscalite: { redevanceCommunale: 0, redevanceDepartementale: 0 }
    }
  )

  return redevances.fiscalite
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
      {
        fields: {
          substances: { legales: { id: {} } },
          communes: { id: {} }
        }
      },
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
    console.info(JSON.stringify(body))

    if (Object.keys(body.articles).length > 0) {
      const result = await apiOpenfiscaFetch(body)

      const redevances = responseExtractor(result, annee)

      console.info(JSON.stringify(result))
      console.info('redevanceCommunaleMinesAurifere', redevances)
      res.json(redevances)
    } else {
      res.json({
        redevanceCommunale: 0,
        redevanceDepartementale: 0
      })
    }
  }
}
