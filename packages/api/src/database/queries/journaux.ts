import Journaux from '../models/journaux.js'
import { create } from 'jsondiffpatch'
import { Model, PartialModelGraph, RelationExpression, UpsertGraphOptions } from 'objection'
import { journauxQueryModify } from './permissions/journaux.js'
import { ITitreEtape } from '../../types.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'
import options, { FieldId } from './_options.js'
import { User } from 'camino-common/src/roles'
import { TitreId } from 'camino-common/src/validators/titres.js'
import { JournauxQueryParams } from 'camino-common/src/journaux.js'
import TitresEtapes from '../models/titres-etapes.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools.js'

const diffPatcher = create({
  // on filtre certaines proprietés qu’on ne souhaite pas voir apparaitre dans les journaux
  propertyFilter: (name: string) => !['slug', 'ordre', 'demarche', 'heritageProps'].includes(name),
})

export const journauxGet = async (params: JournauxQueryParams, { fields }: { fields?: FieldId }, user: User) => {
  const graph = fields ? graphBuild(fields, 'journaux', fieldsFormat) : options.journaux.graph

  const q = Journaux.query().withGraphFetched(graph)
  q.modify(journauxQueryModify, user)

  if (isNotNullNorUndefined(params.recherche)) {
    q.leftJoinRelated('titre as titreRecherche')
    q.whereRaw(`lower(??) like ?`, ['titreRecherche.nom', `%${params.recherche.toLowerCase()}%`])
  }

  if (isNotNullNorUndefinedNorEmpty(params.titresIds)) {
    q.whereIn('titreId', params.titresIds)
  }

  q.orderBy('date', 'desc')

  return q.page(params.page - 1, 10)
}

export const createJournalCreate = async (id: string, userId: string, titreId: TitreId) => {
  await Journaux.query().insert({
    elementId: id,
    operation: 'create',
    utilisateurId: userId,
    titreId,
  })
}

export const patchJournalCreate = async (id: EtapeId, partialEntity: Partial<ITitreEtape>, userId: string, titreId: TitreId): Promise<TitresEtapes> => {
  const oldValue = await TitresEtapes.query().findById(id)

  const oldPartialValue = (Object.keys(partialEntity) as Array<keyof Model>).reduce((result, key) => {
    result[key] = oldValue![key]

    return result
  }, {} as any)

  const result = await TitresEtapes.query().patchAndFetchById(id, {
    ...partialEntity,
    id,
  })

  const differences = diffPatcher.diff(oldPartialValue, partialEntity)

  if (differences) {
    await Journaux.query().insert({
      elementId: id,
      utilisateurId: userId,
      operation: 'update',
      differences,
      titreId,
    })
  }

  return result
}

export const upsertJournalCreate = async (
  id: string | undefined,
  entity: PartialModelGraph<ITitreEtape>,
  options: UpsertGraphOptions,
  relations: RelationExpression<TitresEtapes>,
  userId: string,
  titreId: TitreId
): Promise<ITitreEtape> => {
  const oldValue = isNotNullNorUndefined(id) ? await TitresEtapes.query().findById(id).withGraphFetched(relations).returning('*') : undefined

  // on ne peut pas utiliser returning('*'),
  // car certains attributs de entity restent présents alors qu’ils sont enlevés avant l’enregistrement
  const newModel = await TitresEtapes.query().upsertGraph(entity, options).returning('id')

  const newValue = await TitresEtapes.query().findById(newModel.id).withGraphFetched(relations).returning('*')

  let differences: any
  let operation: 'create' | 'update' = 'create'

  if (oldValue) {
    differences = diffPatcher.diff(oldValue, newValue)

    // si il n’y a pas de différences, alors on ne journal plus cette modification
    if (isNullOrUndefined(differences) || isNullOrUndefinedOrEmpty(Object.keys(differences))) {
      return newValue
    }
    operation = 'update'
  }

  await Journaux.query().insert({
    elementId: newValue.id,
    utilisateurId: userId,
    operation,
    differences,
    titreId,
  })

  return newValue
}
