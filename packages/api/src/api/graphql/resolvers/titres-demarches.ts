import { GraphQLResolveInfo } from 'graphql'

import { ITitreDemarche, ITitreEtapeFiltre, ITitreDemarcheColonneId, Context } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'

import { titreDemarcheFormat } from '../../_format/titres-demarches.js'

import { titreDemarcheGet, titresDemarchesCount, titresDemarchesGet, titreDemarcheCreate, titreDemarcheUpdate, titreDemarcheArchive } from '../../../database/queries/titres-demarches.js'

import { titreGet } from '../../../database/queries/titres.js'

import { titreDemarcheUpdate as titreDemarcheUpdateTask } from '../../../business/titre-demarche-update.js'
import { titreDemarcheUpdationValidate } from '../../../business/validations/titre-demarche-updation-validate.js'
import { isDemarcheTypeId, isTravaux } from 'camino-common/src/static/demarchesTypes.js'
import { canCreateTravaux, canCreateOrEditDemarche, canDeleteDemarche } from 'camino-common/src/permissions/titres-demarches.js'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { userSuper } from '../../../database/user-super.js'

export const demarche = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    const titreDemarche = await titreDemarcheGet(id, { fields }, user)

    if (!titreDemarche) {
      throw new Error("la démarche n'existe pas")
    }

    return titreDemarcheFormat(titreDemarche, fields.elements)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const demarches = async (
  {
    page,
    intervalle,
    ordre,
    colonne,
    typesIds,
    travauxTypesIds,
    statutsIds,
    etapesInclues,
    etapesExclues,
    titresTypesIds,
    titresDomainesIds,
    titresStatutsIds,
    titresIds,
    titresEntreprisesIds,
    titresSubstancesIds,
    titresReferences,
    titresTerritoires,
    travaux,
  }: {
    page?: number | null
    intervalle?: number | null
    ordre?: 'asc' | 'desc' | null
    colonne?: ITitreDemarcheColonneId | null
    typesIds?: string[] | null
    travauxTypesIds?: string[] | null
    statutsIds?: string[] | null
    etapesInclues?: ITitreEtapeFiltre[] | null
    etapesExclues?: ITitreEtapeFiltre[] | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresTerritoires?: string | null
    travaux?: boolean | null
  },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    const fields = fieldsBuild(info)

    if (isNullOrUndefined(intervalle)) {
      intervalle = 200
    }

    if (isNullOrUndefined(page)) {
      page = 1
    }

    const [titresDemarches, total] = await Promise.all([
      titresDemarchesGet(
        {
          intervalle,
          page,
          ordre,
          colonne,
          typesIds: [...(typesIds ?? []), ...(travauxTypesIds ?? [])],
          statutsIds,
          etapesInclues,
          etapesExclues,
          titresTypesIds,
          titresDomainesIds,
          titresStatutsIds,
          titresIds,
          titresEntreprisesIds,
          titresSubstancesIds,
          titresReferences,
          travaux,
        },
        { fields: fields.elements },
        user
      ),
      titresDemarchesCount(
        {
          typesIds: [...(typesIds ?? []), ...(travauxTypesIds ?? [])],
          statutsIds,
          etapesInclues,
          etapesExclues,
          titresTypesIds,
          titresDomainesIds,
          titresStatutsIds,
          titresIds,
          titresEntreprisesIds,
          titresSubstancesIds,
          titresReferences,
          travaux,
        },
        { fields: {} },
        user
      ),
    ])

    const demarchesFormatted = titresDemarches.map(titreDemarche => titreDemarcheFormat(titreDemarche, fields.elements))

    return {
      elements: demarchesFormatted,
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

export const demarcheCreer = async ({ demarche }: { demarche: ITitreDemarche }, { user, pool }: Context) => {
  try {
    const titre = await titreGet(demarche.titreId, { fields: { pointsEtape: { id: {} } } }, user)

    if (!titre) throw new Error("le titre n'existe pas")

    if (!isDemarcheTypeId(demarche.typeId)) {
      throw new Error('droits insuffisants')
    }
    if (titre.administrationsLocales === undefined) {
      throw new Error('les administrations locales doivent être chargées')
    }
    if (!titre.titreStatutId) {
      throw new Error('le statut du titre est obligatoire')
    }

    if (isTravaux(demarche.typeId) && !canCreateTravaux(user, titre.typeId, titre.administrationsLocales ?? [])) {
      throw new Error('droits insuffisants')
    }
    if (!isTravaux(demarche.typeId) && !canCreateOrEditDemarche(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales ?? [])) {
      throw new Error('droits insuffisants')
    }

    const demarcheCreated = await titreDemarcheCreate(demarche)

    await titreDemarcheUpdateTask(pool, demarcheCreated.id, demarcheCreated.titreId)

    const demarcheUpdate = await titreDemarcheGet(demarcheCreated.id, { fields: { id: {} } }, user)

    return { slug: demarcheUpdate?.slug }
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const demarcheModifier = async ({ demarche }: { demarche: ITitreDemarche }, { user, pool }: Context) => {
  try {
    if (isNullOrUndefined(user)) throw new Error('droits insuffisants')

    const demarcheOld = await titreDemarcheGet(
      demarche.id,
      {
        fields: { etapes: { id: {} } },
      },
      user
    )

    if (isNullOrUndefined(demarcheOld)) throw new Error('la démarche n’existe pas')
    const titre = await titreGet(demarcheOld.titreId, { fields: { pointsEtape: { id: {} } } }, user)
    if (isNullOrUndefined(titre)) throw new Error("le titre n'existe pas")
    if (isNullOrUndefined(titre.administrationsLocales)) throw new Error('les administrations locales ne sont pas chargées')

    if (!canCreateOrEditDemarche(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales)) throw new Error('droits insuffisants')

    if (demarcheOld.titreId !== demarche.titreId) throw new Error('le titre n’existe pas')

    const rulesErrors = await titreDemarcheUpdationValidate(demarche, demarcheOld)

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    await titreDemarcheUpdate(demarche.id, demarche)

    await titreDemarcheUpdateTask(pool, demarche.id, demarche.titreId)

    const demarcheUpdate = await titreDemarcheGet(demarche.id, { fields: { id: {} } }, user)

    return { slug: demarcheUpdate?.slug }
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const demarcheSupprimer = async ({ id }: { id: string }, { user, pool }: Context) => {
  try {
    const demarcheOld = await titreDemarcheGet(id, { fields: { titre: { pointsEtape: { id: {} } }, etapes: { id: {} } } }, userSuper)

    if (isNullOrUndefined(demarcheOld)) throw new Error("la démarche n'existe pas")
    const etapes = demarcheOld.etapes
    if (isNullOrUndefined(etapes)) throw new Error('les étapes ne sont pas chargées')
    if (isNullOrUndefined(demarcheOld.titre)) throw new Error("le titre n'existe pas")
    if (isNullOrUndefined(demarcheOld.titre.administrationsLocales)) throw new Error('les administrations locales ne sont pas chargées')

    if (!canDeleteDemarche(user, demarcheOld.titre.typeId, demarcheOld.titre.titreStatutId, demarcheOld.titre.administrationsLocales, { etapes })) throw new Error('droits insuffisants')

    await titreDemarcheArchive(id)

    await titreDemarcheUpdateTask(pool, null, demarcheOld.titreId)

    return id
  } catch (e) {
    console.error(e)

    throw e
  }
}
