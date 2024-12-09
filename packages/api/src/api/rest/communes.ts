import { Commune } from 'camino-common/src/static/communes'
import { HTTP_STATUS } from 'camino-common/src/http'
import { getCommunes as getCommunesQuery } from '../../database/queries/communes.queries'
import { RestNewGetCall } from '../../server/rest'
import { CaminoApiError } from '../../types'
import { EffectDbQueryAndValidateErrors } from '../../pg-database'
import { Effect, Match } from 'effect'

export const getCommunes: RestNewGetCall<'/rest/communes'> = (rootPipe): Effect.Effect<Commune[], CaminoApiError<EffectDbQueryAndValidateErrors>> =>
  rootPipe.pipe(
    Effect.flatMap(({ searchParams, pool }) => getCommunesQuery(pool, { ids: searchParams.ids })),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.exhaustive
      )
    )
  )
