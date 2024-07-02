import { GraphQLResolveInfo } from 'graphql'

import { Context, ITitreColonneId } from '../../../types.js'

import { titresFormat } from '../../_format/titres.js'

import { fieldsBuild } from './_fields-build.js'

import { titresCount, titresGet } from '../../../database/queries/titres.js'

import { DepartementId } from 'camino-common/src/static/departement.js'
import { RegionId } from 'camino-common/src/static/region.js'
import { FacadesMaritimes } from 'camino-common/src/static/facades.js'

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
