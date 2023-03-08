import { Context, IEntreprise, IEntrepriseColonneId } from '../../../types.js'
import { GraphQLResolveInfo } from 'graphql'

import { entrepriseGet, entreprisesCount, entreprisesGet, entrepriseUpsert, titreDemandeEntreprisesGet } from '../../../database/queries/entreprises.js'
import { titreEtapeGet } from '../../../database/queries/titres-etapes.js'

import { fieldsBuild } from './_fields-build.js'

import { entrepriseFormat } from '../../_format/entreprises.js'
import { emailCheck } from '../../../tools/email-check.js'
import { apiInseeEntrepriseAndEtablissementsGet } from '../../../tools/api-insee/index.js'
import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { canCreateEntreprise } from 'camino-common/src/permissions/utilisateurs.js'
import { canEditEntreprise } from 'camino-common/src/permissions/entreprises.js'

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

const entrepriseCreer = async ({ entreprise }: { entreprise: { legalSiren: string; paysId: string } }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!canCreateEntreprise(user)) throw new Error('droits insuffisants')

    const errors = []

    if (entreprise.paysId !== 'fr') {
      errors.push('impossible de créer une entreprise étrangère')
    }

    const fields = fieldsBuild(info)

    const entrepriseOld = await entrepriseGet(`${entreprise.paysId}-${entreprise.legalSiren}`, { fields }, user)

    if (entrepriseOld) {
      errors.push(`l'entreprise ${entrepriseOld.nom} existe déjà dans Camino`)
    }

    if (errors.length) {
      throw new Error(errors.join(', '))
    }

    const entrepriseInsee = await apiInseeEntrepriseAndEtablissementsGet(entreprise.legalSiren!)

    if (!entrepriseInsee) {
      throw new Error('numéro de siren non reconnu dans la base Insee')
    }

    const entrepriseNew = await entrepriseUpsert(entrepriseInsee)

    return entrepriseNew
  } catch (e) {
    console.error(e)

    throw e
  }
}

const entrepriseModifier = async (
  {
    entreprise,
  }: {
    entreprise: {
      id: EntrepriseId
      url?: string
      telephone?: string
      email?: string
    }
  },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    if (!canEditEntreprise(user, entreprise.id)) throw new Error('droits insuffisants')

    const errors = []

    if (entreprise.email && !emailCheck(entreprise.email)) {
      errors.push('adresse email invalide')
    }

    const fields = fieldsBuild(info)
    const entrepriseOld = await entrepriseGet(entreprise.id, { fields }, user)
    if (!entrepriseOld) {
      errors.push('entreprise inconnue')
    }

    if (errors.length) {
      throw new Error(errors.join(', '))
    }

    const entrepriseUpserted = await entrepriseUpsert({
      ...entrepriseOld,
      ...entreprise,
    })

    return entrepriseGet(entrepriseUpserted.id, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { entreprise, entreprises, entrepriseCreer, entrepriseModifier, entreprisesTitresCreation }
