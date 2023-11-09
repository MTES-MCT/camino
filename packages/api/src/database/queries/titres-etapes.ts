import { ITitreEtape, IFields } from '../../types.js'
import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import TitresEtapes, { DBTitresEtapes } from '../models/titres-etapes.js'
import { titresEtapesQueryModify } from './permissions/titres-etapes.js'
import { createJournalCreate, patchJournalCreate, upsertJournalCreate } from './journaux.js'
import { User, UserNotNull } from 'camino-common/src/roles'
import { TitreId } from 'camino-common/src/titres.js'
import { EtapeId, EtapeIdOrSlug } from 'camino-common/src/etape.js'

const titresEtapesQueryBuild = ({ fields }: { fields?: IFields }, user: User) => {
  const graph = fields ? graphBuild(fields, 'etapes', fieldsFormat) : options.titresEtapes.graph

  const q = TitresEtapes.query().withGraphFetched(graph)

  titresEtapesQueryModify(q, user)

  // console.info(q.toKnexQuery().toString())

  return q
}

// utilisé dans le daily et le resolver des documents uniquement
const titreEtapeGet = async (titreEtapeId: EtapeIdOrSlug, { fields, fetchHeritage }: { fields?: IFields; fetchHeritage?: boolean }, user: User) => {
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
const titresEtapesGet = async (
  {
    titresEtapesIds,
    etapesTypesIds,
    titresDemarchesIds,
  }: {
    titresEtapesIds?: string[] | null
    etapesTypesIds?: string[] | null
    titresDemarchesIds?: string[] | null
  } = {},
  { fields }: { fields?: IFields },
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

  q.orderBy('ordre')

  return q
}

const titreEtapeCreate = async (titreEtape: Omit<ITitreEtape, 'id'>, user: UserNotNull, titreId: TitreId) => {
  const newValue = await TitresEtapes.query().insertAndFetch(titreEtape).withGraphFetched(options.titresEtapes.graph)

  await createJournalCreate(newValue.id, user.id, titreId)

  return newValue
}

const titreEtapeUpdate = async (id: EtapeId, titreEtape: Partial<DBTitresEtapes>, user: UserNotNull, titreId: TitreId): Promise<TitresEtapes> => {
  return patchJournalCreate(id, titreEtape, user.id, titreId)
}

const titreEtapeUpsert = async (titreEtape: Partial<Pick<ITitreEtape, 'id'>> & Omit<ITitreEtape, 'id'>, user: UserNotNull, titreId: TitreId) =>
  upsertJournalCreate(titreEtape.id, titreEtape, options.titresEtapes.update, options.titresEtapes.graph, user.id, titreId)

export { titresEtapesGet, titreEtapeGet, titreEtapeCreate, titreEtapeUpdate, titreEtapeUpsert }
