import { Context, IEntreprise, IEntrepriseColonneId } from '../../../types.js'
import { GraphQLResolveInfo } from 'graphql'

import { entrepriseGet, entreprisesCount, entreprisesGet, titreDemandeEntreprisesGet } from '../../../database/queries/entreprises.js'
import { titreEtapeGet } from '../../../database/queries/titres-etapes.js'

import { fieldsBuild } from './_fields-build.js'

import { entrepriseFormat } from '../../_format/entreprises.js'

const entreprise = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    const entreprise = await entrepriseGet(id, { fields }, user)

    if (!entreprise) return null

    return entrepriseFormat(entreprise)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const entreprisesTitresCreation = async (_: never, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    const entreprises = await titreDemandeEntreprisesGet({ fields }, user)

    return entreprises.map(entrepriseFormat)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const entreprises = async (
  {
    etapeId,
    page,
    intervalle,
    ordre,
    colonne,
    noms,
    archive,
    etapeUniquement,
  }: {
    etapeId?: string | null
    page?: number | null
    intervalle?: number | null
    ordre?: 'asc' | 'desc' | null
    colonne?: IEntrepriseColonneId | null
    noms?: string | null
    archive?: boolean | null
    etapeUniquement?: boolean | null
  },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    const fields = fieldsBuild(info)

    let entreprises = [] as IEntreprise[]
    let total = 0

    if (!etapeUniquement) {
      ;[entreprises, total] = await Promise.all([
        entreprisesGet(
          {
            page,
            intervalle,
            ordre,
            colonne,
            noms,
            archive,
          },
          { fields: fields.elements },
          user
        ),
        entreprisesCount({ noms, archive }, { fields: {} }, user),
      ])
    }

    if (etapeId) {
      const titreEtape = await titreEtapeGet(
        etapeId,
        {
          fields: { titulaires: fields.elements, amodiataires: fields.elements },
        },
        user
      )

      if (titreEtape?.titulaires?.length) {
        titreEtape.titulaires.forEach(t => {
          if (!entreprises.find(e => e.id === t.id)) {
            entreprises.push(t)
            total++
          }
        })
      }

      if (titreEtape?.amodiataires?.length) {
        titreEtape.amodiataires.forEach(a => {
          if (!entreprises.find(e => e.id === a.id)) {
            entreprises.push(a)
            total++
          }
        })
      }
    }

    if (!entreprises.length) return { elements: [], total: 0 }

    return {
      elements: entreprises.map(entrepriseFormat),
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

export { entreprise, entreprises, entreprisesTitresCreation }
