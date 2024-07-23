import { titresGet } from '../../database/queries/titres'

import { titreUpdateTask } from '../../business/titre-update'
import { UserNotNull, isEntrepriseOrBureauDEtude } from 'camino-common/src/roles'
import { linkTitres } from '../../database/queries/titres-titres.queries'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { checkTitreLinks } from '../../business/validations/titre-links-validate'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { TitreDemande, TitreDemandeOutput } from 'camino-common/src/titres'
import { HTTP_STATUS } from 'camino-common/src/http'
import { Pool } from 'pg'
import { etapeIdValidator } from 'camino-common/src/etape'
import { Effect, pipe, Match } from 'effect'
import { capitalize } from 'effect/String'
import { titreDemarcheUpdateTask } from '../../business/titre-demarche-update'
import { ZodUnparseable } from '../../tools/fp-tools'
import { CaminoApiError } from '../../types'
import { CreateTitreErrors, CreateDemarcheErrors, createTitre, createDemarche } from './titre-demande.queries'

type TitreDemandeCreerErrors =
  | 'Accès interdit'
  | 'Permissions insuffisantes'
  | 'Problème lors du lien des titres'
  | ZodUnparseable
  | CreateTitreErrors
  | 'Problème lors de la mise à jour des taches du titre'
  | CreateDemarcheErrors
  | 'Problème lors de la mise à jour des taches de la démarche'
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
      () => isNullOrUndefinedOrEmpty(titreDemande.references) || !isEntrepriseOrBureauDEtude(user),
      () => ({ message: 'Permissions insuffisantes' as const, detail: "L'utilisateur n'a pas les droits pour mettre des références" })
    ),
    Effect.bind('titreId', () => createTitre(pool, user, titreDemande)),
    Effect.bind('titreLinks', () => {
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
    Effect.bind('link', ({ titreId }) =>
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
    Effect.bind('demarcheTasks', ({ titreId, demarcheId }) => {
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
      if (isEntrepriseOrBureauDEtude(user)) {
        const toto = pipe(
          Effect.tryPromise({
            try: async () => {
              return etapeIdValidator.parse('plop')
            },
            catch: unknown => {
              if (unknown instanceof Error) {
                return { message: 'Problème lors de la mise à jour des taches de la démarche' as const, detail: unknown.message }
              }

              return { message: 'Problème lors de la mise à jour des taches de la démarche' as const, extra: unknown }
            },
          }),
          Effect.map(etapeId => ({ titreId, etapeId }))
        )

        return toto
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
          () => ({
            ...caminoError,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          })
        ),
        Match.when('Problème lors du lien des titres', () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.exhaustive
      )
    )
  )

  //       const date = toCaminoDate(new Date())
  //       const titreDemarcheId = updatedTitre.demarches![0].id

  //       // Quand on est une entreprise ou un bureau d'étude, on créer directement la demande
  //       if (isEntrepriseOrBureauDEtude(user)) {
  //         const titreEtape: Omit<ITitreEtape, 'id'> = {
  //           titreDemarcheId,
  //           typeId: 'mfr',
  //           statutId: 'fai',
  //           isBrouillon: ETAPE_IS_BROUILLON,
  //           date,
  //           duree: titreDemande.typeId === 'arm' ? 4 : undefined,
  //           titulaireIds: [titreDemande.entrepriseId],
  //         }

  //         const updatedTitreEtape = await titreEtapeUpsert(titreEtape, user, titreId)
  //         if (isNullOrUndefined(updatedTitreEtape)) {
  //           console.error("Une erreur est survenue lors de l'insert de l'étape")
  //           res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  //         } else {
  //           await titreEtapeUpdateTask(pool, updatedTitreEtape.id, titreEtape.titreDemarcheId, user)

  //           const titreEtapeId = updatedTitreEtape.id

  //           // on abonne l’utilisateur au titre
  //           await utilisateurTitreCreate({ utilisateurId: user.id, titreId })

  //           res.json({ etapeId: titreEtapeId })
  //         }
  //       } else {
  //         res.json({ titreId })
  //       }
  //     }
  //   }
  // } catch (e) {
  //   console.error(e)
  //   res.sendStatus(HTTP_STATUS.FORBIDDEN)
  // }
}
