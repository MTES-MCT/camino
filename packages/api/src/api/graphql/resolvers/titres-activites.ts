import { GraphQLResolveInfo } from 'graphql'

import { Context, ITitre, ITitreActivite, ITitreActiviteColonneId, IUtilisateur } from '../../../types.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'

import { titreActiviteEmailsSend } from './_titre-activite.js'
import { titreActiviteContenuFormat, titreActiviteFormat } from '../../_format/titres-activites.js'

import { fieldsBuild } from './_fields-build.js'

import { titreActiviteDelete, titreActiviteGet, titreActiviteUpdate as titreActiviteUpdateQuery, titresActivitesCount, titresActivitesGet } from '../../../database/queries/titres-activites.js'
import { utilisateursGet } from '../../../database/queries/utilisateurs.js'

import { titreActiviteInputValidate } from '../../../business/validations/titre-activite-input-validate.js'
import { titreActiviteDeletionValidate } from '../../../business/validations/titre-activite-deletion-validate.js'
import { userSuper } from '../../../database/user-super.js'
import { fichiersRepertoireDelete } from './_titre-document.js'
import { documentsLier } from './documents.js'
import { titreGet } from '../../../database/queries/titres.js'
import { isBureauDEtudes, isEntreprise } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes.js'
import { getCurrent } from 'camino-common/src/date.js'
import { canReadActivites } from 'camino-common/src/permissions/activites.js'

/**
 * Retourne une activité
 *
 * @param id - id de l'activité
 * @param context - contexte utilisateur
 * @param info - objet contenant les propriétés de la requête graphQl
 * @returns une activité
 *
 */

const activite = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!canReadActivites(user)) {
      return null
    }
    const fields = fieldsBuild(info)

    const titreActivite = await titreActiviteGet(id, { fields }, user)

    if (!titreActivite) return null

    return titreActivite && titreActiviteFormat(titreActivite)
  } catch (e) {
    console.error(e)

    throw e
  }
}

/**
 * Retourne les activités
 *
 * @param page - numéro de page
 * @param intervalle - nombre d'éléments par page
 * @param ordre - ordre de tri
 * @param colonne - colonne de tri
 * @param typesIds - tableau de type(s) d'activité
 * @param statutsIds - tableau de statut(s) d'activité
 * @param annees - année de l'activité
 * @param titresIds - chaîne de nom(s) de titre
 * @param titresEntreprisesIds - chaîne de nom(s) d'entreprise titulaire ou amodiataire d'un titre
 * @param titresSubstances - chaîne de substance(s) se rapportant à un titre
 * @param titresReferences - chaîne de référence(s) se rapportant à un titre
 * @param titresTerritoires - chaîne de territoire(s) se rapportant à un titre
 * @param titresTypesIds - tableau de type(s) de titre
 * @param titresDomainesIds - tableau de domaine(s)
 * @param titresStatutsIds - tableau de statut(s) de titre
 * @param context - contexte utilisateur
 * @param info - objet contenant les propriétés de la requête graphQl
 * @returns une liste d'activités
 *
 */

const activites = async (
  {
    page,
    intervalle,
    ordre,
    colonne,
    typesIds,
    statutsIds,
    annees,
    titresIds,
    titresEntreprisesIds,
    titresSubstancesIds,
    titresReferences,
    titresTerritoires,
    titresTypesIds,
    titresDomainesIds,
    titresStatutsIds,
  }: {
    page?: number | null
    intervalle?: number | null
    ordre?: 'asc' | 'desc' | null
    colonne?: ITitreActiviteColonneId | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresTerritoires?: string | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
  },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    if (!canReadActivites(user)) {
      return []
    }

    const fields = fieldsBuild(info)

    if (!intervalle) {
      intervalle = 200
    }

    if (!page) {
      page = 1
    }

    const [titresActivites, total] = await Promise.all([
      titresActivitesGet(
        {
          intervalle,
          page,
          ordre,
          colonne,
          typesIds,
          annees,
          titresIds,
          titresEntreprisesIds,
          titresSubstancesIds,
          titresReferences,
          titresTerritoires,
          statutsIds,
          titresTypesIds,
          titresDomainesIds,
          titresStatutsIds,
        },
        { fields: fields.elements },
        user
      ),
      titresActivitesCount(
        {
          typesIds,
          annees,
          titresIds,
          titresEntreprisesIds,
          titresSubstancesIds,
          titresReferences,
          titresTerritoires,
          statutsIds,
          titresTypesIds,
          titresDomainesIds,
          titresStatutsIds,
        },
        { fields: {} },
        user
      ),
    ])

    if (!titresActivites.length) return { elements: [], total: 0 }

    return {
      elements: titresActivites.map(ta => titreActiviteFormat(ta)),
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

const activiteDeposer = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!user) throw new Error('droits insuffisants')

    const activite = await titreActiviteGet(
      id,
      {
        fields: {
          documents: { id: {} },
          type: { documentsTypes: { id: {} } },
        },
      },
      user
    )

    if (!activite) throw new Error("l'activité n'existe pas")

    if (!titreActiviteFormat(activite).deposable) throw new Error('droits insuffisants')

    await titreActiviteUpdateQuery(activite.id, {
      activiteStatutId: ACTIVITES_STATUTS_IDS.DEPOSE,
      utilisateurId: user.id,
      dateSaisie: getCurrent(),
    })
    const fields = fieldsBuild(info)
    const activiteRes = await titreActiviteGet(activite.id, { fields }, user)

    if (!activiteRes) throw new Error("l'activité n'existe pas")
    const activiteFormated = titreActiviteFormat(activiteRes)

    const titre = (await titreGet(
      activiteRes.titreId,
      {
        fields: {
          titulaires: { id: {} },
          amodiataires: { id: {} },
          pointsEtape: { id: {} },
        },
      },
      userSuper
    )) as ITitre

    const userEntreprisesId = isEntreprise(user) || isBureauDEtudes(user) ? user.entreprises.map(e => e.id) : []
    const isAmodiataire = titre.amodiataires?.some(t => userEntreprisesId.some(id => id === t.id))

    const entreprisesIds = isAmodiataire ? titre.amodiataires?.map(t => t.id) : titre.titulaires?.map(t => t.id)

    let utilisateurs: IUtilisateur[] = []
    if (entreprisesIds?.length) {
      utilisateurs = await utilisateursGet(
        {
          entreprisesIds,
        },
        { fields: {} },
        userSuper
      )
    }

    const administrations: AdministrationId[] = getGestionnairesByTitreTypeId(titre.typeId).map(({ administrationId }) => administrationId)

    if (titre.administrationsLocales?.length) {
      administrations.push(...titre.administrationsLocales)
    }

    await titreActiviteEmailsSend(activiteFormated, activiteFormated.titre!.nom, user, utilisateurs, administrations.filter(onlyUnique))

    return activiteFormated
  } catch (e) {
    console.error(e)

    throw e
  }
}

const activiteModifier = async ({ activite }: { activite: ITitreActivite & { documentIds?: string[] } }, context: Context, info: GraphQLResolveInfo) => {
  try {
    const user = context.user
    if (!user) throw new Error('droits insuffisants')

    const oldTitreActivite = await titreActiviteGet(
      activite.id,
      {
        fields: {
          documents: { id: {} },
          type: { documentsTypes: { id: {} } },
        },
      },
      user
    )

    if (!oldTitreActivite) throw new Error("l'activité n'existe pas")

    if (!oldTitreActivite.modification) throw new Error('droits insuffisants')

    const inputErrors = titreActiviteInputValidate(activite, oldTitreActivite.sections)

    if (inputErrors.length) {
      throw new Error(inputErrors.join(', '))
    }

    activite.utilisateurId = user.id
    activite.dateSaisie = getCurrent()
    activite.activiteStatutId = ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION

    if (activite.contenu) {
      activite.contenu = titreActiviteContenuFormat(oldTitreActivite.sections, activite.contenu, 'write')
    }

    const fields = fieldsBuild(info)

    const documentIds = activite.documentIds || []
    await documentsLier(context, documentIds, { parentId: activite.id, propParentId: 'titreActiviteId' }, oldTitreActivite)
    delete activite.documentIds

    await titreActiviteUpdateQuery(activite.id, activite)
    const activiteRes = await titreActiviteGet(activite.id, { fields }, user)

    if (!activiteRes) throw new Error("l'activité n'existe pas")

    return titreActiviteFormat(activiteRes)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const activiteSupprimer = async ({ id }: { id: string }, { user }: Context) => {
  try {
    const oldTitreActivite = await titreActiviteGet(id, { fields: {} }, user)

    if (!oldTitreActivite) throw new Error("l'activité n'existe pas")

    if (!oldTitreActivite.suppression) throw new Error('droits insuffisants')

    const rulesErrors = titreActiviteDeletionValidate(oldTitreActivite)

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    const activite = titreActiviteDelete(id, {})

    await fichiersRepertoireDelete(id, 'activites')

    return activite
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { activite, activites, activiteModifier, activiteSupprimer, activiteDeposer }
