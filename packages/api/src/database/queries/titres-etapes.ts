import { ITitreEtape } from '../../types'
import options, { FieldsEtape } from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import TitresEtapes, { DBTitresEtapes } from '../models/titres-etapes'
import { titresEtapesQueryModify } from './permissions/titres-etapes'
import { createJournalCreate, patchJournalCreate, upsertJournalCreate } from './journaux'
import { User, UserNotNull } from 'camino-common/src/roles'
import { TitreId } from 'camino-common/src/validators/titres'
import { EtapeId, EtapeIdOrSlug } from 'camino-common/src/etape'

const titresEtapesQueryBuild = ({ fields }: { fields?: FieldsEtape }, user: User) => {
  const graph = fields ? graphBuild(fields, 'etapes', fieldsFormat) : '[]'

  const q = TitresEtapes.query().withGraphFetched(graph)

  titresEtapesQueryModify(q, user)

  return q
}

// utilisé dans le daily et le resolver des documents uniquement
export const titreEtapeGet = async (titreEtapeId: EtapeIdOrSlug, { fields, fetchHeritage }: { fields?: FieldsEtape; fetchHeritage?: boolean }, user: User) => {
  const q = titresEtapesQueryBuild({ fields }, user)

  q.context({ fetchHeritage })

  return (await q
    .andWhere(b => {
      b.orWhere('titresEtapes.id', titreEtapeId)
      b.orWhere('titresEtapes.slug', titreEtapeId)
    })
    .first()) as ITitreEtape
}

// utilisé dans le daily uniquement
export const titresEtapesGet = async (
  {
    titresEtapesIds,
    etapesTypesIds,
    titresDemarchesIds,
  }: {
    titresEtapesIds?: string[] | null
    etapesTypesIds?: string[] | null
    titresDemarchesIds?: string[] | null
  } = {},
  { fields }: { fields?: FieldsEtape },
  user: User
): Promise<ITitreEtape[]> => {
  const q = titresEtapesQueryBuild({ fields }, user)

  if (titresEtapesIds) {
    q.whereIn('titresEtapes.id', titresEtapesIds)
  }

  if (etapesTypesIds) {
    q.whereIn('titresEtapes.typeId', etapesTypesIds)
  }

  if (titresDemarchesIds) {
    q.whereIn('titresEtapes.titreDemarcheId', titresDemarchesIds)
  }

  q.orderBy(['ordre', 'id'])

  return q
}

export const titreEtapeCreate = async (titreEtape: Omit<ITitreEtape, 'id'>, user: UserNotNull, titreId: TitreId) => {
  const newValue = await TitresEtapes.query().insertAndFetch(titreEtape).withGraphFetched('[]')

  await createJournalCreate(newValue.id, user.id, titreId)

  return newValue
}

export const titreEtapeUpdate = async (id: EtapeId, titreEtape: Partial<DBTitresEtapes>, user: UserNotNull, titreId: TitreId): Promise<TitresEtapes> => {
  return patchJournalCreate(id, titreEtape, user.id, titreId)
}

export const titreEtapeUpsert = async (titreEtape: Partial<Pick<ITitreEtape, 'id'>> & Omit<ITitreEtape, 'id'>, user: UserNotNull, titreId: TitreId) =>
  upsertJournalCreate(titreEtape.id, titreEtape, options.titresEtapes.update, '[]', user.id, titreId)
