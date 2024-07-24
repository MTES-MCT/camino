import { titresGet } from '../../database/queries/titres'

import { titreUpdateTask } from '../../business/titre-update'
import { UserNotNull, isEntrepriseOrBureauDEtude } from 'camino-common/src/roles'
import { linkTitres } from '../../database/queries/titres-titres.queries'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { checkTitreLinks } from '../../business/validations/titre-links-validate'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { createAutomaticallyEtapeWhenCreatingTitre, TitreDemande, TitreDemandeOutput } from 'camino-common/src/titres'
import { HTTP_STATUS } from 'camino-common/src/http'
import { Pool } from 'pg'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'
import { Effect, pipe, Match } from 'effect'
import { capitalize } from 'effect/String'
import { titreDemarcheUpdateTask } from '../../business/titre-demarche-update'
import { ZodUnparseable } from '../../tools/fp-tools'
import { CaminoApiError, ITitreEtape } from '../../types'
import { CreateTitreErrors, CreateDemarcheErrors, createTitre, createDemarche } from './titre-demande.queries'
import { titreEtapeUpsert } from '../../database/queries/titres-etapes'
import { getCurrent } from 'camino-common/src/date'
import { titreEtapeUpdateTask } from '../../business/titre-etape-update'
import { utilisateurTitreCreate } from '../../database/queries/utilisateurs'

type TitreDemandeCreerErrors =
  | 'Accès interdit'
  | 'Permissions insuffisantes'
  | 'Problème lors du lien des titres'
  | ZodUnparseable
  | CreateTitreErrors
  | 'Problème lors de la mise à jour des taches du titre'
  | CreateDemarcheErrors
  | 'Problème lors de la mise à jour des taches de la démarche'
  | "Problème lors de la création de l'étape"
  | "Problème lors de la mise à jour des tâches de l'étape"
  | "Problème lors de l'abonnement de l'utilisateur au titre"
  | "L'entreprise est obligatoire"
  | "L'entreprise ne doit pas être présente"
export const titreDemandeCreer = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  titreDemande: DeepReadonly<TitreDemande>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  _params: {}
): Effect.Effect<TitreDemandeOutput, CaminoApiError<TitreDemandeCreerErrors>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => canCreateTitre(user, titreDemande.titreTypeId),
      () => ({ message: 'Accès interdit' as const })
    ),
    Effect.filterOrFail(
      () => {
        console.log(createAutomaticallyEtapeWhenCreatingTitre(user))
        console.log(titreDemande.entrepriseId)
        console.log(createAutomaticallyEtapeWhenCreatingTitre(user) && isNotNullNorUndefinedNorEmpty(titreDemande.entrepriseId))
        return !createAutomaticallyEtapeWhenCreatingTitre(user) || isNotNullNorUndefinedNorEmpty(titreDemande.entrepriseId)
      },
      () => ({ message: 'L\'entreprise est obligatoire' as const })
    ),
    Effect.filterOrFail(
      () => !createAutomaticallyEtapeWhenCreatingTitre(user) && isNullOrUndefinedOrEmpty(titreDemande.entrepriseId),
      () => ({ message: 'L\'entreprise ne doit pas être présente' as const })
    ),
    Effect.filterOrFail(
      () => isNullOrUndefinedOrEmpty(titreDemande.references) || !isEntrepriseOrBureauDEtude(user),
      () => ({ message: 'Permissions insuffisantes' as const, detail: "L'utilisateur n'a pas les droits pour mettre des références" })
    ),
    Effect.bind('titreId', () => createTitre(pool, user, titreDemande)),
    Effect.tap(() => {
      if (isNotNullNorUndefinedNorEmpty(titreDemande.titreFromIds)) {
        return Effect.tryPromise({
          try: async () => {
            const titresFrom = await titresGet({ ids: [...titreDemande.titreFromIds] }, { fields: { id: {} } }, user)
            const result = checkTitreLinks(titreDemande.titreTypeId, titreDemande.titreFromIds, titresFrom, [])
            if (!result.valid) {
              throw new Error(result.errors.map(capitalize).join('. '))
            }
          },
          catch: unknown => {
            if (unknown instanceof Error) {
              return { message: 'Problème lors du lien des titres' as const, detail: unknown.message }
            }

            return { message: 'Problème lors du lien des titres' as const, extra: unknown }
          },
        })
      }

      return Effect.succeed(null)
    }),
    Effect.tap(({ titreId }) =>
      linkTitres(pool, {
        linkTo: titreId,
        linkFrom: [...titreDemande.titreFromIds],
      })
    ),
    Effect.tap(({ titreId }) =>
      Effect.tryPromise({
        try: async () => {
          await titreUpdateTask(pool, titreId)
        },
        catch: unknown => ({ message: 'Problème lors de la mise à jour des taches du titre' as const, extra: unknown }),
      })
    ),
    Effect.bind('demarcheId', ({ titreId }) => createDemarche(pool, titreId, 'oct')),
    Effect.tap(({ titreId, demarcheId }) => {
      return Effect.tryPromise({
        try: async () => {
          await titreDemarcheUpdateTask(pool, demarcheId, titreId)
        },
        catch: unknown => {
          if (unknown instanceof Error) {
            return { message: 'Problème lors de la mise à jour des taches de la démarche' as const, detail: unknown.message }
          }

          return { message: 'Problème lors de la mise à jour des taches de la démarche' as const, extra: unknown }
        },
      })
    }),
    Effect.flatMap(({ titreId, demarcheId }) => {
      if (createAutomaticallyEtapeWhenCreatingTitre(user)) {
        return pipe(
          Effect.tryPromise({
            try: async () => {
              if (isNullOrUndefinedOrEmpty(titreDemande.entrepriseId)) {
                throw new Error('Ne devrait jamais se produire, réduction pour typescript qui ne voit pas le filterOrFail au dessus')
              }
              const titreEtape: Omit<ITitreEtape, 'id'> = {
                titreDemarcheId: demarcheId,
                typeId: 'mfr',
                statutId: 'fai',
                isBrouillon: ETAPE_IS_BROUILLON,
                date: getCurrent(),
                duree: titreDemande.titreTypeId === 'arm' ? 4 : undefined,
                titulaireIds: [titreDemande.entrepriseId],
              }

              const updatedTitreEtape = await titreEtapeUpsert(titreEtape, user, titreId)
              if (isNullOrUndefined(updatedTitreEtape)) {
                throw new Error("Une erreur est survenue lors de l'insert de l'étape")
              }

              return updatedTitreEtape.id
            },
            catch: unknown => {
              if (unknown instanceof Error) {
                return { message: "Problème lors de la création de l'étape" as const, detail: unknown.message }
              }

              return { message: "Problème lors de la création de l'étape" as const, extra: unknown }
            },
          }),
          Effect.tap(etapeId => {
            return Effect.tryPromise({
              try: () => titreEtapeUpdateTask(pool, etapeId, demarcheId, user),
              catch: unknown => {
                return { message: "Problème lors de la mise à jour des tâches de l'étape" as const, extra: unknown }
              },
            })
          }),
          Effect.tap(() => {
            return Effect.tryPromise({
              try: () => utilisateurTitreCreate({ utilisateurId: user.id, titreId }),
              catch: unknown => {
                return { message: "Problème lors de l'abonnement de l'utilisateur au titre" as const, extra: unknown }
              },
            })
          }),
          Effect.map(etapeId => ({ titreId, etapeId }))
        )
      }

      return Effect.succeed({ titreId })
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr('Accès interdit', 'Permissions insuffisantes', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.whenOr(
          'Création du titre impossible',
          "Impossible d'accéder à la base de données",
          'Problème de validation de données',
          'Problème lors de la mise à jour des taches du titre',
          'Création de la démarche impossible',
          'Problème lors de la mise à jour des taches de la démarche',
          "Problème lors de la création de l'étape",
          "Problème lors de la mise à jour des tâches de l'étape",
          "Problème lors de l'abonnement de l'utilisateur au titre",
          () => ({
            ...caminoError,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          })
        ),
        Match.whenOr('Problème lors du lien des titres','L\'entreprise ne doit pas être présente', 'L\'entreprise est obligatoire', () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.exhaustive
      )
    )
  )
}
