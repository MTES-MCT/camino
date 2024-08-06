import { GraphQLResolveInfo } from 'graphql'

import { Context, ITitre, ITitreActiviteColonneId } from '../../../types'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'

import { titreActiviteEmailsSend } from './_titre-activite'

import { fieldsBuild } from './_fields-build'

import { titreActiviteGet, titreActiviteUpdate as titreActiviteUpdateQuery, titresActivitesCount, titresActivitesGet } from '../../../database/queries/titres-activites'

import { userSuper } from '../../../database/user-super'
import { titreGet } from '../../../database/queries/titres'
import { isBureauDEtudes, isEntreprise } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { isNonEmptyArray, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, memoize, onlyUnique } from 'camino-common/src/typescript-tools'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes'
import { getCurrent } from 'camino-common/src/date'
import { canReadActivites, isActiviteDeposable } from 'camino-common/src/permissions/activites'
import {
  administrationsLocalesByActiviteId,
  entreprisesTitulairesOuAmoditairesByActiviteId,
  getActiviteById,
  getActiviteDocumentsByActiviteId,
  titreTypeIdByActiviteId,
} from '../../rest/activites.queries'
import { ActiviteId } from 'camino-common/src/activite'
import { getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import TitresActivites from '../../../database/models/titres-activites'
import { getUtilisateursEmailsByEntrepriseIds } from '../../../database/queries/utilisateurs.queries'

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
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
  },
  { user }: Context,
  info: GraphQLResolveInfo
): Promise<{ elements: TitresActivites[]; page?: number; intervalle?: number; ordre?: 'asc' | 'desc' | null | undefined; colonne?: ITitreActiviteColonneId | null | undefined; total: number }> => {
  try {
    if (!canReadActivites(user)) {
      return { elements: [], total: 0 }
    }

    const fields = fieldsBuild(info)

    if (isNullOrUndefined(intervalle) || intervalle === 0) {
      intervalle = 200
    }

    if (isNullOrUndefined(page) || page === 0) {
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
      elements: titresActivites,
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

export const activiteDeposer = async ({ id }: { id: ActiviteId }, { user, pool }: Context, info: GraphQLResolveInfo): Promise<TitresActivites> => {
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

    const titre = (await titreGet(
      activiteRes.titreId,
      {
        fields: {
          titulairesEtape: { id: {} },
          amodiatairesEtape: { id: {} },
          pointsEtape: { id: {} },
        },
      },
      userSuper
    )) as ITitre

    if (isNullOrUndefined(titre.titulaireIds) || isNullOrUndefined(titre.amodiataireIds)) {
      throw new Error('Le titre n’est pas complètement chargé')
    }

    const userEntreprisesId = isEntreprise(user) || isBureauDEtudes(user) ? user.entreprises.map(e => e.id) : []
    const isAmodiataire = titre.amodiataireIds?.some(amodiataireId => userEntreprisesId.some(id => id === amodiataireId))

    const entreprisesIds = isAmodiataire ? titre.amodiataireIds : titre.titulaireIds

    let utilisateursEmails: string[] = []
    if (entreprisesIds?.length) {
      utilisateursEmails = await getUtilisateursEmailsByEntrepriseIds(pool, entreprisesIds)
    }

    const administrations: AdministrationId[] = getGestionnairesByTitreTypeId(titre.typeId).map(({ administrationId }) => administrationId)

    if (isNotNullNorUndefinedNorEmpty(titre.administrationsLocales)) {
      administrations.push(...titre.administrationsLocales)
    }

    const filteredAdministrationId = administrations.filter(onlyUnique)
    if (isNonEmptyArray(filteredAdministrationId)) {
      await titreActiviteEmailsSend(activiteRes, activiteRes.titre!.nom, user, utilisateursEmails, filteredAdministrationId, pool)
    }

    return activiteRes
  } catch (e) {
    console.error(e)

    throw e
  }
}
