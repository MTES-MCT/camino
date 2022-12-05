import {
  ITitreEtape,
  IFields,
  IUtilisateur,
  ITitreEtapeJustificatif
} from '../../types.js'
import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import TitresEtapes, { DBTitresEtapes } from '../models/titres-etapes.js'
import TitresEtapesJustificatifs from '../models/titres-etapes-justificatifs.js'
import { titresEtapesQueryModify } from './permissions/titres-etapes.js'
import {
  createJournalCreate,
  patchJournalCreate,
  upsertJournalCreate
} from './journaux.js'

const titresEtapesQueryBuild = (
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fields, 'etapes', fieldsFormat)
    : options.titresEtapes.graph

  const q = TitresEtapes.query().withGraphFetched(graph)

  titresEtapesQueryModify(q, user)

  // console.info(q.toKnexQuery().toString())

  return q
}

// utilisé dans le daily et le resolver des documents uniquement
const titreEtapeGet = async (
  titreEtapeId: string,
  { fields, fetchHeritage }: { fields?: IFields; fetchHeritage?: boolean },
  user: IUtilisateur | null | undefined
) => {
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
    titresDemarchesIds
  }: {
    titresEtapesIds?: string[] | null
    etapesTypesIds?: string[] | null
    titresDemarchesIds?: string[] | null
  } = {},
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
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

const titreEtapeCreate = async (
  titreEtape: Omit<ITitreEtape, 'id'>,
  user: IUtilisateur,
  titreId: string
) => {
  const newValue = await TitresEtapes.query()
    .insertAndFetch(titreEtape)
    .withGraphFetched(options.titresEtapes.graph)

  await createJournalCreate(newValue.id, user.id, titreId)

  return newValue
}

const titreEtapeUpdate = async (
  id: string,
  titreEtape: Partial<DBTitresEtapes>,
  user: IUtilisateur,
  titreId: string
): Promise<TitresEtapes> => {
  return patchJournalCreate<TitresEtapes>(
    id,
    titreEtape,
    TitresEtapes,
    user.id,
    titreId
  )
}

const titreEtapeUpsert = async (
  titreEtape: Partial<Pick<ITitreEtape, 'id'>> & Omit<ITitreEtape, 'id'>,
  user: IUtilisateur,
  titreId: string
) =>
  upsertJournalCreate<TitresEtapes>(
    titreEtape.id,
    titreEtape,
    TitresEtapes,
    options.titresEtapes.update,
    options.titresEtapes.graph,
    user.id,
    titreId
  )

const titresEtapesJustificatifsUpsert = async (
  titresEtapesJustificatifs: ITitreEtapeJustificatif[]
) =>
  TitresEtapesJustificatifs.query().upsertGraph(titresEtapesJustificatifs, {
    insertMissing: true
  })

export {
  titresEtapesGet,
  titreEtapeGet,
  titreEtapeCreate,
  titreEtapeUpdate,
  titreEtapeUpsert,
  titresEtapesJustificatifsUpsert
}
