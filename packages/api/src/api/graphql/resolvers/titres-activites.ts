import { GraphQLResolveInfo } from 'graphql'

import { Context, ITitre, ITitreActiviteColonneId, IUtilisateur } from '../../../types.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'

import { titreActiviteEmailsSend } from './_titre-activite.js'
import { titreActiviteFormat } from '../../_format/titres-activites.js'

import { fieldsBuild } from './_fields-build.js'

import { titreActiviteGet, titreActiviteUpdate as titreActiviteUpdateQuery, titresActivitesCount, titresActivitesGet } from '../../../database/queries/titres-activites.js'
import { utilisateursGet } from '../../../database/queries/utilisateurs.js'

import { userSuper } from '../../../database/user-super.js'
import { titreGet } from '../../../database/queries/titres.js'
import { isBureauDEtudes, isEntreprise } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { memoize, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes.js'
import { getCurrent } from 'camino-common/src/date.js'
import { canReadActivites, isActiviteDeposable } from 'camino-common/src/permissions/activites.js'
import {
  administrationsLocalesByActiviteId,
  entreprisesTitulairesOuAmoditairesByActiviteId,
  getActiviteById,
  getActiviteDocumentsByActiviteId,
  titreTypeIdByActiviteId,
} from '../../rest/activites.queries.js'
import { ActiviteId } from 'camino-common/src/activite.js'
import { getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'

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

export const activites = async (
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

export const activiteDeposer = async ({ id }: { id: ActiviteId }, { user, pool }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!user) throw new Error('droits insuffisants')

    const titreTypeId = memoize(() => titreTypeIdByActiviteId(id, pool))
    const administrationsLocales = memoize(() => administrationsLocalesByActiviteId(id, pool))
    const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByActiviteId(id, pool))

    const activite = await getActiviteById(id, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)

    if (!activite) throw new Error("l'activité n'existe pas")

    const activitesDocuments = await getActiviteDocumentsByActiviteId(id, pool)
    const sectionsWithValue = getSectionsWithValue(activite.sections, activite.contenu)
    if (!(await isActiviteDeposable(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, { ...activite, sections_with_value: sectionsWithValue }, activitesDocuments))) {
      throw new Error('droits insuffisants')
    }

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
