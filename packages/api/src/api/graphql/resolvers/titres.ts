import { GraphQLResolveInfo } from 'graphql'

import { ITitre, ITitreColonneId, ITitreDemarche, IToken } from '../../../types'

import { debug } from '../../../config/index'
import {
  titreAdministrationsGet,
  titreFormat,
  titresFormat
} from '../../_format/titres'

import { fieldsBuild } from './_fields-build'

import {
  titreCreate,
  titreGet,
  titresCount,
  titresGet,
  titreUpsert,
  titreArchive
} from '../../../database/queries/titres'
import { userGet } from '../../../database/queries/utilisateurs'

import titreUpdateTask from '../../../business/titre-update'

import { titreUpdationValidate } from '../../../business/validations/titre-updation-validate'
import { domaineGet } from '../../../database/queries/metas'
import {
  canLinkTitres,
  getLinkConfig
} from 'camino-common/src/permissions/titres'
import { linkTitres } from '../../../database/queries/titres-titres'

const titre = async (
  { id }: { id: string },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    const titre = await titreGet(id, { fields, fetchHeritage: true }, user)

    if (!titre) return null

    return titreFormat(titre, fields)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const titres = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    ids,
    perimetre,
    typesIds,
    domainesIds,
    statutsIds,
    substancesLegalesIds,
    entreprisesIds,
    substances,
    noms,
    entreprises,
    references,
    territoires,
    demandeEnCours
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: ITitreColonneId | null
    ordre?: 'asc' | 'desc' | null
    ids: string[]
    perimetre?: number[] | null
    typesIds: string[]
    domainesIds: string[]
    statutsIds: string[]
    substancesLegalesIds: string[]
    entreprisesIds: string[]
    substances: string
    noms: string
    entreprises: string
    references: string
    territoires: string
    demandeEnCours: boolean | null
  },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info).elements

    const [titres, total] = await Promise.all([
      titresGet(
        {
          intervalle,
          page,
          colonne,
          ordre,
          ids,
          perimetre,
          typesIds,
          domainesIds,
          statutsIds,
          substancesLegalesIds,
          entreprisesIds,
          substances,
          noms,
          entreprises,
          references,
          territoires,
          demandeEnCours
        },
        { fields },
        user
      ),
      titresCount(
        {
          ids,
          typesIds,
          domainesIds,
          statutsIds,
          substancesLegalesIds,
          entreprisesIds,
          substances,
          noms,
          entreprises,
          references,
          territoires,
          demandeEnCours
        },
        { fields: {} },
        user
      )
    ])

    const titresFormatted = titres && titresFormat(titres, fields)

    return {
      elements: titresFormatted,
      page,
      intervalle,
      ordre,
      colonne,
      total
    }
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

/**
 * TODO 2022-07-12 enlever cette fonction et nettoyer l'ui
 * @deprecated Not used by frontend, titreDemandeCreer is used instead
 */
const titreCreer = async (
  { titre }: { titre: ITitre },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const domaine = await domaineGet(
      titre.domaineId,
      { fields: { titresTypes: { id: {} } } },
      user
    )
    const titreType = domaine?.titresTypes.find(tt => tt.id === titre.typeId)

    if (!user || !titreType || !titreType.titresCreation)
      throw new Error('droits insuffisants')

    // insert le titre dans la base
    titre = await titreCreate(titre, { fields: {} })

    await titreUpdateTask(titre.id)

    const fields = fieldsBuild(info)

    const titreUpdated = await titreGet(titre.id, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

// TODO 2022-07-19 à mettre en REST mais il faut documenter les routes
export const titreLiaisonsModifier = async (
  { titreId, titreFromIds }: { titreId: string; titreFromIds: string[] },
  context: IToken
): Promise<boolean> => {
  try {
    const user = await userGet(context.user?.id)

    const titre = await titreGet(
      titreId,
      {
        fields: {
          administrationsGestionnaires: { id: {} },
          administrationsLocales: { id: {} },
          demarches: { id: {} }
        }
      },
      user
    )

    if (!titre) throw new Error("le titre n'existe pas")

    if (!titre.administrationsGestionnaires || !titre.administrationsLocales) {
      throw new Error('les administrations ne sont pas chargées')
    }

    const administrations = titreAdministrationsGet(titre)
    if (
      !canLinkTitres(
        user,
        administrations.map(({ id }) => id)
      )
    )
      throw new Error('droits insuffisants')

    if (!titre.demarches) {
      throw new Error('les démarches ne sont pas chargées')
    }

    const titresFrom = await titresGet(
      { ids: titreFromIds },
      { fields: { id: {} } },
      user
    )

    checkTitreLinks(titre, titreFromIds, titresFrom, titre.demarches)

    await linkTitres({ linkTo: titreId, linkFrom: titreFromIds })

    return true
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export const checkTitreLinks = (
  titre: Pick<ITitre, 'typeId'>,
  titreFromIds: string[],
  titresFrom: ITitre[],
  demarches: ITitreDemarche[]
) => {
  const linkConfig = getLinkConfig(titre.typeId, demarches)
  if (!linkConfig) {
    throw new Error('ce titre ne peut pas être lié à d’autres titres')
  }

  if (linkConfig.count === 'single' && titreFromIds.length > 1) {
    throw new Error('ce titre peut avoir un seul titre lié')
  }

  if (titresFrom.length !== titreFromIds.length) {
    throw new Error('droit insuffisant')
  }

  if (linkConfig) {
    if (titresFrom.some(({ typeId }) => typeId !== linkConfig.typeId)) {
      throw new Error(
        `un titre de type ${titre.typeId} ne peut-être lié qu’à un titre de type ${linkConfig.typeId}`
      )
    }
  }
}

const titreModifier = async (
  { titre }: { titre: ITitre },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    const titreOld = await titreGet(
      titre.id,
      { fields: { titresAdministrations: { id: {} } } },
      user
    )

    if (!titreOld) throw new Error("le titre n'existe pas")

    if (!titreOld.modification) throw new Error('droits insuffisants')

    const rulesErrors = await titreUpdationValidate(titre, titreOld, user)

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    const fields = fieldsBuild(info)

    // on doit utiliser upsert (plutôt qu'un simple update)
    // car le titre contient des références (tableau d'objet)
    await titreUpsert(titre, { fields })

    await titreUpdateTask(titre.id)

    const titreUpdated = await titreGet(titre.id, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const titreSupprimer = async ({ id }: { id: string }, context: IToken) => {
  const user = await userGet(context.user?.id)

  const titreOld = await titreGet(
    id,
    {
      fields: {
        demarches: { etapes: { id: {} } },
        activites: { id: {} }
      }
    },
    user
  )

  if (!titreOld) throw new Error("le titre n'existe pas")

  if (!titreOld.suppression) throw new Error('droits insuffisants')

  await titreArchive(id)

  return titreOld.slug
}

export { titre, titres, titreCreer, titreModifier, titreSupprimer }
