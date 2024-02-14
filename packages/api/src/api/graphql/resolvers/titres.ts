import { GraphQLResolveInfo } from 'graphql'

import { Context, ITitre, ITitreColonneId } from '../../../types.js'

import { titreFormat, titresFormat } from '../../_format/titres.js'

import { fieldsBuild } from './_fields-build.js'

import { titreCreate, titreGet, titresCount, titresGet } from '../../../database/queries/titres.js'

import titreUpdateTask from '../../../business/titre-update.js'
import { canCreateTitre } from 'camino-common/src/permissions/titres.js'
import { DepartementId } from 'camino-common/src/static/departement.js'
import { RegionId } from 'camino-common/src/static/region.js'
import { FacadesMaritimes } from 'camino-common/src/static/facades.js'
import { isTitreType } from 'camino-common/src/static/titresTypes.js'

/**
 * TODO 2022-07-12 enlever cette fonction et nettoyer les tests d'intégration
 * @deprecated Not used by frontend anymore, only by integration tests
 */
export const titre = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    const titre = await titreGet(id, { fields, fetchHeritage: true }, user)

    if (!titre) return null

    return titreFormat(titre, fields)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const titres = async (
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
    substancesIds,
    entreprisesIds,
    noms,
    references,
    communes,
    departements,
    regions,
    facadesMaritimes,
    demandeEnCours,
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
    substancesIds: string[]
    entreprisesIds: string[]
    substances: string
    noms: string
    references: string
    communes: string
    departements: DepartementId[]
    regions: RegionId[]
    facadesMaritimes: FacadesMaritimes[]
    demandeEnCours: boolean | null
  },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
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
          substancesIds,
          entreprisesIds,
          noms,
          references,
          communes,
          departements,
          regions,
          facadesMaritimes,
          demandeEnCours,
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
          substancesIds,
          entreprisesIds,
          noms,
          references,
          communes,
          departements,
          regions,
          facadesMaritimes,
          demandeEnCours,
        },
        { fields: {} },
        user
      ),
    ])

    const titresFormatted = titresFormat(titres, fields)

    return {
      elements: titresFormatted,
      page,
      intervalle,
      ordre,
      colonne,
      total,
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

/**
 * TODO 2022-07-12 enlever cette fonction et nettoyer l'ui
 * @deprecated Not used by frontend, titreDemandeCreer is used instead
 */
export const titreCreer = async ({ titre }: { titre: ITitre }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!isTitreType(titre.typeId) || !canCreateTitre(user, titre.typeId)) {
      throw new Error('permissions insuffisantes')
    }

    // insert le titre dans la base
    titre = await titreCreate(titre, { fields: {} })

    await titreUpdateTask(titre.id)

    const fields = fieldsBuild(info)

    const titreUpdated = await titreGet(titre.id, { fields }, user)

    return titreUpdated && titreFormat(titreUpdated)
  } catch (e) {
    console.error(e)

    throw e
  }
}
