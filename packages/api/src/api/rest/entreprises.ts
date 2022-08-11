import { userGet } from '../../database/queries/utilisateurs'

import express from 'express'
import { ICommune, IContenuValeur, IEntreprise, IUser } from '../../types'
import {
  Fiscalite,
  FiscaliteFrance,
  FiscaliteGuyane,
  fiscaliteVisible,
  isFiscaliteGuyane
} from 'camino-common/src/fiscalite'
import { constants } from 'http2'
import {
  apiOpenfiscaCalculate,
  OpenfiscaRequest,
  OpenfiscaResponse,
  redevanceCommunale,
  redevanceDepartementale,
  substanceFiscaleToInput,
  substanceFiscaleToPair
} from '../../tools/api-openfisca'
import { titresGet } from '../../database/queries/titres'
import { titresActivitesGet } from '../../database/queries/titres-activites'
import { entrepriseGet } from '../../database/queries/entreprises'
import TitresActivites from '../../database/models/titres-activites'
import Titres from '../../database/models/titres'
import { CustomResponse } from './express-type'
import {
  SubstanceFiscale,
  SubstancesFiscales
} from 'camino-common/src/static/substancesFiscales'
import { Departements } from 'camino-common/src/static/departement'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Regions } from 'camino-common/src/static/region'

const conversion = (
  substanceFiscale: SubstanceFiscale,
  quantite: IContenuValeur
): number => {
  if (typeof quantite !== 'number') {
    return 0
  }
  const { unite } = substanceFiscaleToPair(substanceFiscale)

  return quantite / (unite.referenceUniteRatio ?? 1)
}
// VisibleForTesting
export const bodyBuilder = (
  activitesAnnuelles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  activitesTrimestrielles: Pick<TitresActivites, 'titreId' | 'contenu'>[],
  titres: Pick<
    Titres,
    'titulaires' | 'amodiataires' | 'substances' | 'communes' | 'id'
  >[],
  annee: number,
  entreprises: Pick<IEntreprise, 'id' | 'categorie' | 'nom'>[]
) => {
  const anneePrecedente = annee - 1
  const body: OpenfiscaRequest = {
    articles: {},
    titres: {},
    communes: {}
  }

  for (const activite of activitesAnnuelles) {
    const titre = titres.find(({ id }) => id === activite.titreId)
    const activiteTrimestresTitre = activitesTrimestrielles.filter(
      ({ titreId }) => titreId === activite.titreId
    )

    if (!titre) {
      throw new Error(`le titre ${activite.titreId} n’est pas chargé`)
    }

    if (!titre.communes?.length) {
      throw new Error(
        `les communes du titre ${activite.titreId} ne sont pas chargées`
      )
    }
    if (!titre.titulaires?.length) {
      throw new Error(
        `les titulaires du titre ${activite.titreId} ne sont pas chargées`
      )
    }
    if (!titre.amodiataires) {
      throw new Error(
        `les amodiataires du titre ${activite.titreId} ne sont pas chargés`
      )
    }

    if (titre.titulaires.length + titre.amodiataires.length > 1) {
      throw new Error(
        `plusieurs entreprises liées au titre ${activite.titreId}, cas non géré`
      )
    }

    const entreprise = entreprises.find(
      ({ id }) =>
        titre.amodiataires?.[0]?.id === id || titre.titulaires?.[0]?.id === id
    )

    if (!entreprise) {
      throw new Error(
        `pas d'entreprise trouvée pour le titre ${activite.titreId}`
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
        // TODO 2022-07-25 on fait quoi ? On calcule quand même ?
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
        const production = conversion(
          substancesFiscale,
          activite.contenu.substancesFiscales[substancesFiscale.id]
        )

        if (production > 0) {
          if (!titre.communes) {
            throw new Error(
              `les communes du titre ${titre.id} ne sont pas chargées`
            )
          }

          const surfaceTotale = titre.communes.reduce(
            (value, commune) => value + (commune.surface ?? 0),
            0
          )

          let communePrincipale: ICommune | null = null
          for (const commune of titre.communes) {
            if (communePrincipale === null) {
              communePrincipale = commune
            } else if (
              (communePrincipale?.surface ?? 0) < (commune?.surface ?? 0)
            ) {
              communePrincipale = commune
            }
          }
          if (communePrincipale === null) {
            throw new Error(
              `Impossible de trouver une commune principale pour le titre ${titre.id}`
            )
          }
          for (const commune of titre.communes) {
            const articleId = `${titre.id}-${substancesFiscale.id}-${commune.id}`

            body.articles[articleId] = {
              surface_communale: { [anneePrecedente]: commune.surface ?? 0 },
              surface_communale_proportionnee: { [anneePrecedente]: null },
              [substanceFiscaleToInput(substancesFiscale)]: {
                [anneePrecedente]: production
              },
              [redevanceCommunale(substancesFiscale)]: {
                [annee]: null
              },
              [redevanceDepartementale(substancesFiscale)]: {
                [annee]: null
              }
            }

            if (substancesFiscale.id === 'auru' && titreGuyannais) {
              body.articles[articleId].taxe_guyane_brute = { [annee]: null }
              body.articles[articleId].taxe_guyane_deduction = { [annee]: null }
              body.articles[articleId].taxe_guyane = { [annee]: null }
            }

            if (!Object.prototype.hasOwnProperty.call(body.titres, titre.id)) {
              const investissement = activiteTrimestresTitre.reduce(
                (investissement, activite) => {
                  let newInvestissement = 0
                  if (
                    typeof activite?.contenu?.renseignements?.environnement ===
                    'number'
                  ) {
                    newInvestissement =
                      activite?.contenu?.renseignements?.environnement
                  }

                  return investissement + newInvestissement
                },
                0
              )
              body.titres[titre.id] = {
                commune_principale_exploitation: {
                  [anneePrecedente]: communePrincipale.id
                },
                surface_totale: { [anneePrecedente]: surfaceTotale },
                operateur: {
                  [anneePrecedente]: entreprise.nom
                },
                investissement: {
                  [anneePrecedente]: investissement.toString(10)
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

export const toFiscalite = (
  result: Pick<OpenfiscaResponse, 'articles'>,
  articleId: string,
  annee: number
): Fiscalite => {
  const article = result.articles[articleId]
  const fiscalite: Fiscalite = {
    redevanceCommunale: 0,
    redevanceDepartementale: 0
  }
  const communes = Object.keys(article).filter(key =>
    key.startsWith('redevance_communale')
  )
  const departements = Object.keys(article).filter(key =>
    key.startsWith('redevance_departementale')
  )
  // TODO 2022_07_25 gérer les substances autre que l'or -> redevance_communale_des_mines_substance_unite
  for (const commune of communes) {
    fiscalite.redevanceCommunale += article[commune]?.[annee] ?? 0
  }
  for (const departement of departements) {
    fiscalite.redevanceDepartementale += article[departement]?.[annee] ?? 0
  }

  if ('taxe_guyane_brute' in article) {
    return {
      ...fiscalite,
      guyane: {
        taxeAurifereBrute: article.taxe_guyane_brute?.[annee] ?? 0,
        taxeAurifere: article.taxe_guyane?.[annee] ?? 0,
        totalInvestissementsDeduits: article.taxe_guyane_deduction?.[annee] ?? 0
      }
    }
  }

  return fiscalite
}
type Reduced =
  | { guyane: true; fiscalite: FiscaliteGuyane }
  | { guyane: false; fiscalite: FiscaliteFrance }
// VisibleForTesting
export const responseExtractor = (
  result: Pick<OpenfiscaResponse, 'articles'>,
  annee: number
): Fiscalite => {
  const redevances: Reduced = Object.keys(result.articles)
    .map(articleId => toFiscalite(result, articleId, annee))
    .reduce<Reduced>(
      (acc, fiscalite) => {
        acc.fiscalite.redevanceCommunale += fiscalite.redevanceCommunale
        acc.fiscalite.redevanceDepartementale +=
          fiscalite.redevanceDepartementale

        if (!acc.guyane && isFiscaliteGuyane(fiscalite)) {
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
        if (acc.guyane && isFiscaliteGuyane(fiscalite)) {
          acc.fiscalite.guyane.taxeAurifereBrute +=
            fiscalite.guyane.taxeAurifereBrute
          acc.fiscalite.guyane.totalInvestissementsDeduits +=
            fiscalite.guyane.totalInvestissementsDeduits
          acc.fiscalite.guyane.taxeAurifere += fiscalite.guyane.taxeAurifere
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

    // TODO 2022-07-25 gérer l’année
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
      // TODO 2022-07-25 Laure, est-ce qu’il faut faire les WRP ?
      {
        typesIds: ['grx', 'gra', 'wrp'],
        // TODO 2022-07-25 Laure, que les déposées ? Pas les « en construction » ?
        statutsIds: ['dep'],
        annees: [anneePrecedente],
        titresIds: titres.map(({ id }) => id)
      },
      { fields: { id: {} } },
      user
    )
    const activitesTrimestrielles = await titresActivitesGet(
      {
        typesIds: ['grp'],
        statutsIds: ['dep'],
        annees: [anneePrecedente],
        titresIds: titres.map(({ id }) => id)
      },
      { fields: { id: {} } },
      user
    )

    const body = bodyBuilder(
      activites,
      activitesTrimestrielles,
      titres,
      annee,
      [entreprise]
    )
    console.info('body', JSON.stringify(body))
    if (Object.keys(body.articles).length > 0) {
      const result = await apiOpenfiscaCalculate(body)
      console.info('result', JSON.stringify(result))

      const redevances = responseExtractor(result, annee)

      res.json(redevances)
    } else {
      res.json({
        redevanceCommunale: 0,
        redevanceDepartementale: 0
      })
    }
  }
}
