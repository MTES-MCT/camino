import { ITitrePhase } from '../../types.js'

import options from './_options.js'

import TitresPhases from '../models/titres-phases.js'

const titresPhasesGet = async () =>
  TitresPhases.query().withGraphFetched(options.titresDemarchesPhases.graph)

const titrePhasesUpsert = async (titrePhases: ITitrePhase[]) =>
  TitresPhases.query().upsertGraph(titrePhases, {
    insertMissing: true,
    noDelete: true
  })

const titrePhasesDelete = async (titrePhasesIds: string[]) =>
  TitresPhases.query().delete().whereIn('titreDemarcheId', titrePhasesIds)

export { titresPhasesGet, titrePhasesUpsert, titrePhasesDelete }
