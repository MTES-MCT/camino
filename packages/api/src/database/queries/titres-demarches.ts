import { QueryBuilder, RawBuilder, raw } from 'objection'

import { DemarcheId } from 'camino-common/src/demarche'
import { ITitreDemarche, ITitreEtapeFiltre, ITitreDemarcheColonneId, IColonne, Index } from '../../types'

import options, { FieldsDemarche } from './_options'
import { fieldsFormat } from './graph/fields-format'
import graphBuild from './graph/build'
import { fieldsTitreAdd } from './graph/fields-add'

import TitresDemarches, { DBTitresDemarches } from '../models/titres-demarches'
import { titresDemarchesQueryModify } from './permissions/titres-demarches'
import { titresFiltersQueryModify } from './_titres-filters'
import TitresEtapes from '../models/titres-etapes'
import { User } from 'camino-common/src/roles'
import { sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

const etapesIncluesExcluesBuild = (q: QueryBuilder<TitresDemarches, TitresDemarches[]>, etapes: ITitreEtapeFiltre[], mode: 'etapesInclues' | 'etapesExclues') => {
  const raw = etapes
    .map(({ statutId, dateDebut, dateFin }) => {
      const statutCond = isNotNullNorUndefinedNorEmpty(statutId) ? 'and etapes.statut_id = ?' : ''
      const dateDebutCond = isNotNullNorUndefinedNorEmpty(dateDebut) ? 'and etapes.date >= ?' : ''
      const dateFinCond = isNotNullNorUndefinedNorEmpty(dateFin) ? 'and etapes.date <= ?' : ''

      const condition = mode === 'etapesInclues' ? '> 0' : '= 0'

      return `count(*) filter (where etapes.archive is not true and etapes.type_id = ? ${statutCond} ${dateDebutCond} ${dateFinCond}) ${condition}`
    })
    .join(') and (')

  q.havingRaw(
    `(${raw})`,
    etapes.flatMap(({ typeId, statutId, dateDebut, dateFin }) => {
      const values = [typeId]

      if (isNotNullNorUndefinedNorEmpty(statutId)) {
        values.push(statutId)
      }
      if (isNotNullNorUndefinedNorEmpty(dateDebut)) {
        values.push(dateDebut)
      }
      if (isNotNullNorUndefinedNorEmpty(dateFin)) {
        values.push(dateFin)
      }

      return values
    })
  )
}

const titresDemarchesFiltersQueryModify = (
  {
    typesIds,
    statutsIds,
    etapesInclues,
    etapesExclues,
    titresDemarchesIds,
    titresDomainesIds,
    titresTypesIds,
    titresStatutsIds,
    titresIds,
    titresEntreprisesIds,
    titresSubstancesIds,
    titresReferences,
    travaux,
  }: {
    typesIds?: string[] | null
    statutsIds?: string[] | null
    etapesInclues?: ITitreEtapeFiltre[] | null
    etapesExclues?: ITitreEtapeFiltre[] | null
    titresDemarchesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresTypesIds?: string[] | null
    titresStatutsIds?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    travaux?: boolean | null
  } = {},
  q: QueryBuilder<TitresDemarches, TitresDemarches[]>
) => {
  if (titresDemarchesIds) {
    q.whereIn('titresDemarches.id', titresDemarchesIds)
  }

  if (isNotNullNorUndefinedNorEmpty(typesIds)) {
    q.whereIn('titresDemarches.typeId', typesIds)
  }

  if (isNotNullNorUndefinedNorEmpty(statutsIds)) {
    q.whereIn('titresDemarches.statutId', statutsIds)
  }

  if (isNotNullNorUndefinedNorEmpty(etapesInclues) || isNotNullNorUndefinedNorEmpty(etapesExclues)) {
    q.leftJoinRelated('etapes').groupBy('titresDemarches.id')

    if (isNotNullNorUndefinedNorEmpty(etapesInclues)) {
      etapesIncluesExcluesBuild(q, etapesInclues, 'etapesInclues')
    }

    if (isNotNullNorUndefinedNorEmpty(etapesExclues)) {
      etapesIncluesExcluesBuild(q, etapesExclues, 'etapesExclues')
    }
  }

  if (travaux === false || travaux === true) {
    const demarcheOrTravauxTypesIds = sortedDemarchesTypes.filter(d => d.travaux === travaux).map(({ id }) => id)
    q.whereIn('titresDemarches.typeId', demarcheOrTravauxTypesIds)
  }

  titresFiltersQueryModify(
    {
      domainesIds: titresDomainesIds,
      typesIds: titresTypesIds,
      statutsIds: titresStatutsIds,
      ids: titresIds,
      entreprisesIds: titresEntreprisesIds,
      substancesIds: titresSubstancesIds,
      references: titresReferences,
    },
    q,
    'titre',
    'titresDemarches'
  )
}

const titresDemarchesQueryBuild = ({ fields }: { fields?: FieldsDemarche }, user: User) => {
  const graph = fields ? graphBuild(fieldsTitreAdd(fields), 'demarches', fieldsFormat) : options.titresDemarches.graph

  const q = TitresDemarches.query().withGraphFetched(graph)

  titresDemarchesQueryModify(q, user)

  return q
}

export const titresDemarchesCount = async (
  {
    typesIds,
    statutsIds,
    etapesInclues,
    etapesExclues,
    titresDemarchesIds,
    titresDomainesIds,
    titresTypesIds,
    titresStatutsIds,
    titresIds,
    titresEntreprisesIds,
    titresSubstancesIds,
    titresReferences,
    travaux,
  }: {
    typesIds?: string[] | null
    statutsIds?: string[] | null
    etapesInclues?: ITitreEtapeFiltre[] | null
    etapesExclues?: ITitreEtapeFiltre[] | null
    titresDemarchesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresTypesIds?: string[] | null
    titresStatutsIds?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    travaux?: boolean | null
  } = {},
  { fields }: { fields?: FieldsDemarche },
  user: User
) => {
  const q = titresDemarchesQueryBuild({ fields }, user)

  titresDemarchesFiltersQueryModify(
    {
      typesIds,
      statutsIds,
      etapesInclues,
      etapesExclues,
      titresDemarchesIds,
      titresDomainesIds,
      titresTypesIds,
      titresStatutsIds,
      titresIds,
      titresEntreprisesIds,
      titresSubstancesIds,
      titresReferences,
      travaux,
    },
    q
  )

  return q.resultSize()
}

const titresDemarchesColonnes = {
  titreNom: { id: 'titre.nom', relation: 'titre' },
  titreDomaine: {
    id: raw(`right( titre.type_id, 1 )`),
    relation: 'titre',
  },
  titreType: { id: raw(`left( titre.type_id, 2 )`), relation: 'titre' },
  titreStatut: { id: 'titre.titreStatutId', relation: 'titre' },
  type: { id: 'titresDemarches.typeId' },
  statut: { id: 'titresDemarches.statutId' },
} as Index<IColonne<string | RawBuilder>>

export const titresDemarchesGet = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    typesIds,
    statutsIds,
    etapesInclues,
    etapesExclues,
    titresDemarchesIds,
    titresDomainesIds,
    titresTypesIds,
    titresStatutsIds,
    titresIds,
    titresEntreprisesIds,
    titresSubstancesIds,
    titresReferences,
    travaux,
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: ITitreDemarcheColonneId | null
    ordre?: 'asc' | 'desc' | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    etapesInclues?: ITitreEtapeFiltre[] | null
    etapesExclues?: ITitreEtapeFiltre[] | null
    titresDemarchesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresTypesIds?: string[] | null
    titresStatutsIds?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    travaux?: boolean | null
  } = {},
  { fields }: { fields?: FieldsDemarche },
  user: User
) => {
  const q = titresDemarchesQueryBuild({ fields }, user)

  titresDemarchesFiltersQueryModify(
    {
      typesIds,
      statutsIds,
      etapesInclues,
      etapesExclues,
      titresDomainesIds,
      titresDemarchesIds,
      titresTypesIds,
      titresStatutsIds,
      titresIds,
      titresEntreprisesIds,
      titresSubstancesIds,
      titresReferences,
      travaux,
    },
    q
  )

  if (colonne) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!titresDemarchesColonnes[colonne]) {
      throw new Error(`Colonne « ${colonne} » inconnue`)
    }

    const groupBy = titresDemarchesColonnes[colonne].groupBy as string[]

    if (isNotNullNorUndefinedNorEmpty(titresDemarchesColonnes[colonne].relation)) {
      q.leftJoinRelated(titresDemarchesColonnes[colonne].relation!)
    }
    q.orderBy(titresDemarchesColonnes[colonne].id, ordre || 'asc')
    q.groupBy('titresDemarches.id')

    if (isNotNullNorUndefinedNorEmpty(groupBy)) {
      groupBy.forEach(gb => {
        q.groupBy(gb as string)
      })
    } else {
      q.groupBy(titresDemarchesColonnes[colonne].id)
    }
  } else {
    q.orderBy('titresDemarches.ordre')
  }

  if (isNotNullNorUndefined(page) && page > 0 && isNotNullNorUndefined(intervalle) && intervalle > 0) {
    q.offset((page - 1) * intervalle)
  }

  if (isNotNullNorUndefined(intervalle) && intervalle > 0) {
    q.limit(intervalle)
  }

  return q
}

export const titreDemarcheGet = async (titreDemarcheId: string, { fields }: { fields?: FieldsDemarche }, user: User) => {
  const q = titresDemarchesQueryBuild({ fields }, user)

  return q
    .andWhere(b => {
      b.orWhere('titresDemarches.id', titreDemarcheId)
      b.orWhere('titresDemarches.slug', titreDemarcheId)
    })
    .first()
}

/**
 * Crée une nouvelle démarche
 * @param titreDemarche - démarche à créer
 * @returns la nouvelle démarche
 */
export const titreDemarcheCreate = async (titreDemarche: Omit<ITitreDemarche, 'id'>): Promise<ITitreDemarche> => TitresDemarches.query().insertAndFetch(titreDemarche)

export const titreDemarcheUpdate = async (id: DemarcheId, titreDemarche: Partial<DBTitresDemarches>): Promise<TitresDemarches> => {
  return TitresDemarches.query().patchAndFetchById(id, { ...titreDemarche, id })
}

export const titreDemarcheArchive = async (id: string) => {
  // archive la démarche
  await TitresDemarches.query().patch({ archive: true }).where('id', id)

  // archive les étapes de la démarche
  await TitresEtapes.query().patch({ archive: true }).whereIn('titreDemarcheId', TitresDemarches.query().select('id').where('id', id))
}
