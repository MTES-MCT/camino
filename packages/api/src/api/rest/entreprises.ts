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
  entrepriseDocumentInputValidator,
  entrepriseDocumentIdValidator,
  EntrepriseDocumentId,
  newEntrepriseId,
  Entreprise,
  entrepriseValidator,
  entrepriseTypeValidator,
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
  getEntreprise as getEntrepriseQuery,
  getLargeobjectIdByEntrepriseDocumentId,
  insertEntrepriseDocument,
} from './entreprises.queries'
import { newEnterpriseDocumentId } from '../../database/models/_format/id-create'
import { NewDownload } from './fichiers'
import Decimal from 'decimal.js'

import { createLargeObject } from '../../database/largeobjects'
import { z } from 'zod'
import { getEntrepriseEtablissements } from './entreprises-etablissements.queries'
import { RawLineMatrice, getRawLines } from '../../business/matrices'
import { callAndExit } from '../../tools/fp-tools'
import { RestNewPutCall } from '../../server/rest'
import { Effect, Match } from 'effect'
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
export const getEntreprise =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<EntrepriseType>): Promise<void> => {
    const parsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)

    if (!parsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      try {
        const entreprise = await getEntrepriseQuery(pool, parsed.data)
        if (isNullOrUndefined(entreprise)) {
          res.sendStatus(HTTP_STATUS.NOT_FOUND)
        } else {
          const etablissements = await getEntrepriseEtablissements(pool, parsed.data)
          const entrepriseType: EntrepriseType = {
            ...entreprise,
            etablissements: etablissements ?? [],
          }

          res.json(entrepriseTypeValidator.parse(entrepriseType))
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }

export const getEntrepriseDocuments =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<EntrepriseDocument[]>): Promise<void> => {
    const user = req.auth

    const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
    if (!entrepriseIdParsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!canSeeEntrepriseDocuments(user, entrepriseIdParsed.data)) {
      console.warn(`l'utilisateur ${user} n'a pas le droit de voir les documents de l'entreprise ${entrepriseIdParsed.data}`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const entrepriseDocuments = await callAndExit(getEntrepriseDocumentsQuery([], [entrepriseIdParsed.data], pool, user))
      res.json(entrepriseDocuments)
    }
  }

export const postEntrepriseDocument =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<EntrepriseDocumentId | Error>): Promise<void> => {
    const user = req.auth

    const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
    if (!entrepriseIdParsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!canEditEntreprise(user, entrepriseIdParsed.data)) {
      console.warn(`l'utilisateur ${user} n'a pas le droit de voir les documents de l'entreprise ${entrepriseIdParsed.data}`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const entrepriseDocumentInput = entrepriseDocumentInputValidator.safeParse(req.body)

      if (entrepriseDocumentInput.success) {
        const id = newEnterpriseDocumentId(entrepriseDocumentInput.data.date, entrepriseDocumentInput.data.typeId)
        try {
          const oid = await createLargeObject(pool, entrepriseDocumentInput.data.tempDocumentName)

          await insertEntrepriseDocument(pool, {
            id,
            entreprise_document_type_id: entrepriseDocumentInput.data.typeId,
            description: entrepriseDocumentInput.data.description,
            date: entrepriseDocumentInput.data.date,
            entreprise_id: entrepriseIdParsed.data,
            largeobject_id: oid,
          })
          res.json(id)
        } catch (e: any) {
          console.error(e)
          res.status(HTTP_STATUS.BAD_REQUEST)
          res.json(e)
        }
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST)
        res.json(entrepriseDocumentInput.error)
      }
    }
  }

export const deleteEntrepriseDocument =
  (pool: Pool) =>
  async (req: JWTRequest<User>, res: CustomResponse<void | Error>): Promise<void> => {
    const user = req.auth

    const entrepriseIdParsed = entrepriseIdValidator.safeParse(req.params.entrepriseId)
    const entrepriseDocumentIdParsed = entrepriseDocumentIdValidator.safeParse(req.params.entrepriseDocumentId)
    if (!entrepriseIdParsed.success) {
      console.warn(`l'entrepriseId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!entrepriseDocumentIdParsed.success) {
      console.warn(`le documentId est obligatoire`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else if (!canEditEntreprise(user, entrepriseIdParsed.data)) {
      console.warn(`l'utilisateur ${user} n'a pas le droit de supprimer les documents de l'entreprise ${entrepriseIdParsed.data}`)
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const entrepriseDocuments = await callAndExit(getEntrepriseDocumentsQuery([], [entrepriseIdParsed.data], pool, user))
      const entrepriseDocument = entrepriseDocuments.find(({ id }) => id === entrepriseDocumentIdParsed.data)

      if (!entrepriseDocument || !entrepriseDocument.can_delete_document) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        await deleteEntrepriseDocumentQuery(pool, { id: entrepriseDocument.id, entrepriseId: entrepriseIdParsed.data })
        res.sendStatus(HTTP_STATUS.NO_CONTENT)
      }
    }
  }

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
