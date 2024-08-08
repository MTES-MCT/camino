import { GraphQLResolveInfo } from 'graphql'

import { ITitreDemarche, ITitreEtapeFiltre, ITitreDemarcheColonneId, Context } from '../../../types'

import { fieldsBuild } from './_fields-build'

import { titreDemarcheFormat } from '../../_format/titres-demarches'

import { titreDemarcheGet, titresDemarchesCount, titresDemarchesGet, titreDemarcheUpdate } from '../../../database/queries/titres-demarches'

import { titreGet } from '../../../database/queries/titres'

import { titreDemarcheUpdateTask } from '../../../business/titre-demarche-update'
import { titreDemarcheUpdationValidate } from '../../../business/validations/titre-demarche-updation-validate'
import { canEditDemarche } from 'camino-common/src/permissions/titres-demarches'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

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

    if (!canEditDemarche(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales)) throw new Error('droits insuffisants')

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
