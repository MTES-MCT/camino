import { Request as JWTRequest } from 'express-jwt'
import { fiscaliteVisible } from 'camino-common/src/fiscalite'
import { Fiscalite, FiscaliteFrance, FiscaliteGuyane } from 'camino-common/src/validators/fiscalite'
import { HTTP_STATUS } from 'camino-common/src/http'

import { titresGet } from '../../database/queries/titres'
import { titresActivitesGet } from '../../database/queries/titres-activites'
import { entrepriseGet, entrepriseUpsert } from '../../database/queries/entreprises'
import { CustomResponse } from './express-type'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { anneePrecedente, isAnnee } from 'camino-common/src/date'
import {
  entrepriseIdValidator,
  EntrepriseType,
  sirenValidator,
  EntrepriseDocument,
  entrepriseDocumentIdValidator,
  EntrepriseDocumentId,
  newEntrepriseId,
  Entreprise,
  entrepriseValidator,
  EntrepriseId,
} from 'camino-common/src/entreprise'
import { isSuper, User } from 'camino-common/src/roles'
import { canCreateEntreprise, canEditEntreprise, canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises'
import { emailCheck } from '../../tools/email-check'
import { apiInseeEntrepriseAndEtablissementsGet } from '../../tools/api-insee/index'
import { Pool } from 'pg'
import {
  deleteEntrepriseDocument as deleteEntrepriseDocumentQuery,
  getEntrepriseDocuments as getEntrepriseDocumentsQuery,
  getEntreprises,
  getEntreprise,
  getLargeobjectIdByEntrepriseDocumentId,
  insertEntrepriseDocument,
  GetEntrepriseErrors,
} from './entreprises.queries'
import { newEnterpriseDocumentId } from '../../database/models/_format/id-create'
import { NewDownload } from './fichiers'
import Decimal from 'decimal.js'

import { createLargeObject, CreateLargeObjectError } from '../../database/largeobjects'
import { z } from 'zod'
import { getEntrepriseEtablissements } from './entreprises-etablissements.queries'
import { RawLineMatrice, getRawLines } from '../../business/matrices'
import { RestNewDeleteCall, RestNewGetCall, RestNewPostCall, RestNewPutCall } from '../../server/rest'
import { Effect, Match, Option } from 'effect'
import { EffectDbQueryAndValidateErrors } from '../../pg-database'
import { CaminoApiError } from '../../types'

type Reduced = { guyane: true; fiscalite: FiscaliteGuyane } | { guyane: false; fiscalite: FiscaliteFrance }
// VisibleForTesting
export const responseExtractor = (lines: Pick<RawLineMatrice, 'fiscalite'>[]): Fiscalite => {
  const redevances: Reduced = lines.reduce<Reduced>(
    (acc, { fiscalite }) => {
      acc.fiscalite.redevanceCommunale = acc.fiscalite.redevanceCommunale.add(fiscalite.redevanceCommunale)
      acc.fiscalite.redevanceDepartementale = acc.fiscalite.redevanceDepartementale.add(fiscalite.redevanceDepartementale)

      if (!acc.guyane && 'guyane' in fiscalite) {
        acc = {
          guyane: true,
          fiscalite: {
            ...acc.fiscalite,
            guyane: {
              taxeAurifereBrute: new Decimal(0),
              taxeAurifere: new Decimal(0),
              totalInvestissementsDeduits: new Decimal(0),
            },
          },
        }
      }
      if (acc.guyane && 'guyane' in fiscalite) {
        acc.fiscalite.guyane.taxeAurifereBrute = acc.fiscalite.guyane.taxeAurifereBrute.add(fiscalite.guyane.taxeAurifereBrute)
        acc.fiscalite.guyane.totalInvestissementsDeduits = acc.fiscalite.guyane.totalInvestissementsDeduits.add(fiscalite.guyane.totalInvestissementsDeduits)
        acc.fiscalite.guyane.taxeAurifere = acc.fiscalite.guyane.taxeAurifere.add(fiscalite.guyane.taxeAurifere)
      }

      return acc
    },
    {
      guyane: false,
      fiscalite: { redevanceCommunale: new Decimal(0), redevanceDepartementale: new Decimal(0) },
    }
  )

  return redevances.fiscalite
}

const miseAJourEntrepriseImpossible = "Erreur lors de la mise à jour de l'entreprise" as const
const entrepriseDifferente = "Impossible de changer l'identifiant de l'entreprise" as const
const archivageInterdit = "interdit d'archiver une entreprise" as const
const entrepriseInconnue = 'entreprise inconnue' as const
const adresseEmailInvalide = 'adresse email invalide' as const
const editionEntrepriseImpossible = "Interdiction d'éditer l'entreprise" as const
type ModifierEntrepriseErrors =
  | EffectDbQueryAndValidateErrors
  | typeof editionEntrepriseImpossible
  | typeof adresseEmailInvalide
  | typeof entrepriseInconnue
  | typeof archivageInterdit
  | typeof entrepriseDifferente
  | typeof miseAJourEntrepriseImpossible
export const modifierEntreprise: RestNewPutCall<'/rest/entreprises/:entrepriseId'> = (rootPipe): Effect.Effect<{ id: EntrepriseId }, CaminoApiError<ModifierEntrepriseErrors>> =>
  rootPipe.pipe(
    Effect.filterOrFail(
      ({ params, body }) => body.id === params.entrepriseId,
      () => ({ message: entrepriseDifferente })
    ),
    Effect.filterOrFail(
      ({ user, body }) => canEditEntreprise(user, body.id),
      () => ({ message: editionEntrepriseImpossible })
    ),
    Effect.filterOrFail(
      ({ body }) => isNullOrUndefined(body.email) || emailCheck(body.email),
      () => ({ message: adresseEmailInvalide })
    ),
    Effect.bind('entrepriseOld', ({ user, body }) =>
      Effect.tryPromise({
        try: () => entrepriseGet(body.id, { fields: { id: {} } }, user),
        catch: e => ({ message: entrepriseInconnue, extra: e }),
      })
    ),
    Effect.filterOrFail(
      ({ entrepriseOld }) => isNotNullNorUndefined(entrepriseOld),
      () => ({ message: entrepriseInconnue })
    ),
    Effect.filterOrFail(
      ({ entrepriseOld, body, user }) => (entrepriseOld?.archive ?? false) === (body.archive ?? false) || isSuper(user),
      () => ({ message: archivageInterdit })
    ),
    Effect.tap(({ entrepriseOld, body }) =>
      Effect.tryPromise({
        try: () =>
          entrepriseUpsert({
            ...entrepriseOld,
            ...body,
          }),
        catch: e => ({ message: miseAJourEntrepriseImpossible, extra: e }),
      })
    ),
    Effect.map(({ body }) => ({ id: body.id })),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Interdiction d'éditer l'entreprise", () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.whenOr('adresse email invalide', 'entreprise inconnue', "interdit d'archiver une entreprise", "Impossible de changer l'identifiant de l'entreprise", () => ({
          ...caminoError,
          status: HTTP_STATUS.BAD_REQUEST,
        })),
        Match.when("Erreur lors de la mise à jour de l'entreprise", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.exhaustive
      )
    )
  )

export const creerEntreprise =
  (_pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth
    const siren = sirenValidator.safeParse(req.body.siren)
    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!siren.success) {
      console.warn(`siren '${req.body.siren}' invalide`)
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      if (!canCreateEntreprise(user)) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        try {
          const entrepriseOld = await entrepriseGet(newEntrepriseId(`fr-${siren.data}`), { fields: { id: {} } }, user)

          if (entrepriseOld) {
            console.warn(`l'entreprise ${entrepriseOld.nom} existe déjà dans Camino`)
            res.sendStatus(HTTP_STATUS.BAD_REQUEST)
          } else {
            const entrepriseInsee = await apiInseeEntrepriseAndEtablissementsGet(siren.data)

            if (!entrepriseInsee) {
              res.sendStatus(HTTP_STATUS.NOT_FOUND)
            } else {
              await entrepriseUpsert(entrepriseInsee)
              res.sendStatus(HTTP_STATUS.NO_CONTENT)
            }
          }
        } catch (e) {
          console.error(e)
          res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
      }
    }
  }
type GetEntrepriseRestErrors = GetEntrepriseErrors
export const getEntrepriseRest: RestNewGetCall<'/rest/entreprises/:entrepriseId'> = (rootPipe): Effect.Effect<EntrepriseType, CaminoApiError<GetEntrepriseRestErrors>> =>
  rootPipe.pipe(
    Effect.bind('entreprise', ({ pool, params: { entrepriseId } }) => getEntreprise(pool, entrepriseId)),
    Effect.bind('etablissements', ({ pool, params: { entrepriseId } }) => getEntrepriseEtablissements(pool, entrepriseId)),
    Effect.map(({ entreprise, etablissements }) => ({ ...entreprise, etablissements: etablissements ?? [] })),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("Impossible de trouver l'entreprise", () => ({
          ...caminoError,
          status: HTTP_STATUS.NOT_FOUND,
        })),
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.exhaustive
      )
    )
  )

const interditDeVoirLesDocumentsDeLEntreprise = "L'utilisateur n'a pas le droit de voir les documents de l'entreprise" as const
export const getEntrepriseDocuments: RestNewGetCall<'/rest/entreprises/:entrepriseId/documents'> = (
  rootPipe
): Effect.Effect<EntrepriseDocument[], CaminoApiError<EffectDbQueryAndValidateErrors | typeof interditDeVoirLesDocumentsDeLEntreprise>> =>
  rootPipe.pipe(
    Effect.filterOrFail(
      ({ user, params: { entrepriseId } }) => canSeeEntrepriseDocuments(user, entrepriseId),
      ({ user, params: { entrepriseId } }) => ({ message: interditDeVoirLesDocumentsDeLEntreprise, detail: `utilisateur ${user} pour l'entreprise ${entrepriseId}` })
    ),
    Effect.flatMap(({ user, params: { entrepriseId }, pool }) => getEntrepriseDocumentsQuery([], [entrepriseId], pool, user)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr(interditDeVoirLesDocumentsDeLEntreprise, () => ({
          ...caminoError,
          status: HTTP_STATUS.FORBIDDEN,
        })),
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.exhaustive
      )
    )
  )

export const postEntrepriseDocument: RestNewPostCall<'/rest/entreprises/:entrepriseId/documents'> = (
  rootPipe
): Effect.Effect<{ id: EntrepriseDocumentId }, CaminoApiError<EffectDbQueryAndValidateErrors | typeof interditDeVoirLesDocumentsDeLEntreprise | CreateLargeObjectError>> =>
  rootPipe.pipe(
    Effect.filterOrFail(
      ({ user, params: { entrepriseId } }) => canEditEntreprise(user, entrepriseId),
      () => ({ message: interditDeVoirLesDocumentsDeLEntreprise })
    ),
    Effect.let('id', ({ body }) => newEnterpriseDocumentId(body.date, body.typeId)),
    Effect.bind('oid', ({ pool, body }) => createLargeObject(pool, body.tempDocumentName)),
    Effect.tap(({ pool, body, params: { entrepriseId }, oid, id }) =>
      insertEntrepriseDocument(pool, {
        id,
        entreprise_document_type_id: body.typeId,
        description: body.description,
        date: body.date,
        entreprise_id: entrepriseId,
        largeobject_id: oid,
      })
    ),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr(interditDeVoirLesDocumentsDeLEntreprise, () => ({
          ...caminoError,
          status: HTTP_STATUS.FORBIDDEN,
        })),
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', "impossible d'insérer un fichier en base", () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.exhaustive
      )
    )
  )

const droitsInsuffisantsPourSupprimerLeDocument = "droits insuffisants pour supprimer le document d'entreprise" as const
export const deleteEntrepriseDocument: RestNewDeleteCall<'/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId'> = (
  rootPipe
): Effect.Effect<Option.Option<never>, CaminoApiError<typeof droitsInsuffisantsPourSupprimerLeDocument | EffectDbQueryAndValidateErrors>> =>
  rootPipe.pipe(
    Effect.filterOrFail(
      ({ user, params: { entrepriseId } }) => canEditEntreprise(user, entrepriseId),
      () => ({ message: droitsInsuffisantsPourSupprimerLeDocument })
    ),
    Effect.bind('documents', ({ pool, user, params: { entrepriseId } }) => getEntrepriseDocumentsQuery([], [entrepriseId], pool, user)),
    Effect.bind('entrepriseDocument', ({ documents, params: { entrepriseDocumentId } }) =>
      Effect.succeed(documents.find(({ id }) => id === entrepriseDocumentId)).pipe(
        Effect.filterOrFail(
          (document): document is NonNullable<typeof document> => isNotNullNorUndefined(document) && document.can_delete_document,
          () => ({ message: droitsInsuffisantsPourSupprimerLeDocument, detail: 'document non trouvé ou non supprimable' })
        )
      )
    ),
    Effect.tap(({ pool, entrepriseDocument, params: { entrepriseId } }) => deleteEntrepriseDocumentQuery(pool, { id: entrepriseDocument.id, entrepriseId: entrepriseId })),
    Effect.map(() => Option.none()),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr(droitsInsuffisantsPourSupprimerLeDocument, () => ({
          ...caminoError,
          status: HTTP_STATUS.FORBIDDEN,
        })),
        Match.whenOr("Impossible d'exécuter la requête dans la base de données", 'Les données en base ne correspondent pas à ce qui est attendu', () => ({
          ...caminoError,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        })),
        Match.exhaustive
      )
    )
  )

export const fiscalite =
  (_pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<Fiscalite>): Promise<void> => {
    const user = req.auth
    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const caminoAnnee = req.params.annee

      const parsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)

      if (!parsed.success) {
        console.warn(`l'entrepriseId est obligatoire`)
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else if (!caminoAnnee || !isAnnee(caminoAnnee)) {
        console.warn(`l'année ${caminoAnnee} n'est pas correcte`)
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
      } else {
        const entreprise = await entrepriseGet(parsed.data, { fields: { id: {} } }, user)
        if (!entreprise) {
          throw new Error(`l’entreprise ${parsed.data} est inconnue`)
        }
        const anneeMoins1 = anneePrecedente(caminoAnnee)

        const titres = await titresGet(
          { entreprisesIds: [parsed.data] },
          {
            fields: {
              titulairesEtape: { id: {} },
              amodiatairesEtape: { id: {} },
              substancesEtape: { id: {} },
              pointsEtape: { id: {} },
            },
          },
          user
        )

        // TODO 2022-09-26 feature https://trello.com/c/VnlFB6Z1/294-featfiscalit%C3%A9-masquer-la-section-fiscalit%C3%A9-de-la-fiche-entreprise-pour-les-autres-domaines-que-m
        if (
          !fiscaliteVisible(
            user,
            parsed.data,
            titres.map(({ typeId }) => ({ type_id: typeId }))
          )
        ) {
          console.warn(`la fiscalité n'est pas visible pour l'utilisateur ${user.email} et l'entreprise ${parsed.data}`)
          res.sendStatus(HTTP_STATUS.FORBIDDEN)
        } else {
          const activites = await titresActivitesGet(
            // TODO 2022-07-25 Laure, est-ce qu’il faut faire les WRP ?
            {
              typesIds: ['grx', 'gra', 'wrp'],
              // TODO 2022-07-25 Laure, que les déposées ? Pas les « en construction » ?
              statutsIds: ['dep'],
              annees: [anneeMoins1],
              titresIds: titres.map(({ id }) => id),
            },
            { fields: { id: {} } },
            user
          )
          const activitesTrimestrielles = await titresActivitesGet(
            {
              typesIds: ['grp'],
              statutsIds: ['dep'],
              annees: [anneeMoins1],
              titresIds: titres.map(({ id }) => id),
            },
            { fields: { id: {} } },
            user
          )
          const communes = titres.flatMap(({ communes }) => communes?.map(({ id }) => ({ id, nom: id }))).filter(isNotNullNorUndefined)
          const rawLines = getRawLines(activites, activitesTrimestrielles, titres, caminoAnnee, communes, [
            {
              nom: entreprise.nom ?? '',
              legal_siren: entreprise.legalSiren ?? null,
              code_postal: entreprise.codePostal ?? null,
              legal_etranger: entreprise.legalEtranger ?? null,
              id: entreprise.id,
              categorie: entreprise.categorie ?? 'pme',
              adresse: entreprise.adresse ?? '',
              commune: entreprise.commune ?? null,
            },
          ])

          const redevances = responseExtractor(rawLines)
          res.json(redevances)
        }
      }
    }
  }

export const entrepriseDocumentDownload: NewDownload = async (params, user, pool) => {
  const entrepriseDocumentId = entrepriseDocumentIdValidator.parse(params.documentId)
  const entrepriseDocumentLargeObjectId = await getLargeobjectIdByEntrepriseDocumentId(entrepriseDocumentId, pool, user)

  return { loid: entrepriseDocumentLargeObjectId, fileName: entrepriseDocumentId }
}

export const getAllEntreprises =
  (pool: Pool) =>
  async (_req: JWTRequest<User>, res: CustomResponse<Entreprise[]>): Promise<void> => {
    const allEntreprises = await getEntreprises(pool)
    res.json(z.array(entrepriseValidator).parse(allEntreprises))
  }
