import { titreArchive, titresGet, titreGet, titreUpsert } from '../../database/queries/titres.js'
import { ADMINISTRATION_IDS, AdministrationId } from 'camino-common/src/static/administrations.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines.js'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes.js'
import { ITitre, ITitreDemarche } from '../../types.js'
import {
  CommonTitreAdministration,
  CommonTitreONF,
  editableTitreValidator,
  TitreLink,
  TitreLinks,
  TitreGet,
  titreOnfValidator,
  titreLinksValidator,
  utilisateurTitreAbonneValidator,
} from 'camino-common/src/titres.js'
import { demarcheDefinitionFind } from '../../business/rules-demarches/definitions.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { userSuper } from '../../database/user-super.js'
import { NotNullableKeys, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools.js'
import TitresTitres from '../../database/models/titres--titres.js'
import { titreAdministrationsGet } from '../_format/titres.js'
import { canDeleteTitre, canEditTitre, canLinkTitres } from 'camino-common/src/permissions/titres.js'
import { linkTitres } from '../../database/queries/titres-titres.js'
import { checkTitreLinks } from '../../business/validations/titre-links-validate.js'
import { titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common.js'
import { TitreReference } from 'camino-common/src/titres-references.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { CaminoDate, getCurrent } from 'camino-common/src/date.js'
import { isAdministration, User } from 'camino-common/src/roles.js'
import { canCreateOrEditDemarche, canCreateTravaux } from 'camino-common/src/permissions/titres-demarches.js'
import { utilisateurTitreCreate, utilisateurTitreDelete } from '../../database/queries/utilisateurs.js'
import titreUpdateTask from '../../business/titre-update.js'
import { getTitre as getTitreDb } from './titres.queries.js'
import type { Pool } from 'pg'
import { z } from 'zod'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { getTitreUtilisateur } from '../../database/queries/titres-utilisateurs.queries.js'
import { titreIdValidator, titreIdOrSlugValidator } from 'camino-common/src/validators/titres.js'

const etapesAMasquer = [
  ETAPES_TYPES.classementSansSuite,
  ETAPES_TYPES.desistementDuDemandeur,
  ETAPES_TYPES.noteInterneSignalee,
  ETAPES_TYPES.decisionImplicite,
  ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_,
]

export const titresONF = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<CommonTitreONF[]>) => {
  const user = req.auth

  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const onf = ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']

    if (!isAdministration(user) || user.administrationId !== onf) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else {
      const titresAvecOctroiArm = await titresArmAvecOctroi(user, onf)
      res.json(
        titresAvecOctroiArm.map(({ titre, references, octARM, blockedByMe }) => {
          const dateCompletudePTMG = octARM.etapes.find(etape => etape.typeId === 'mcp')?.date || ''

          const dateReceptionONF = octARM.etapes.find(etape => etape.typeId === 'mcr')?.date || ''

          const dateCARM = octARM.etapes.find(etape => etape.typeId === 'sca')?.date || ''

          const value: CommonTitreONF = {
            id: titre.id,
            slug: titre.slug,
            nom: titre.nom,
            titre_statut_id: titre.titreStatutId,
            type_id: titre.typeId,
            references,
            titulaires: titre.titulaires.map(entreprise => ({
              nom: entreprise.nom ?? '',
            })),
            dateCompletudePTMG,
            dateReceptionONF,
            dateCARM,
            enAttenteDeONF: blockedByMe,
          }

          return titreOnfValidator.parse(value)
        })
      )
    }
  }
}

type TitreSanitize = NotNullableKeys<Required<Pick<ITitre, 'slug' | 'titulaires' | 'titreStatutId' | 'typeId'>>> & Pick<ITitre, 'id' | 'nom'>
type TitreDemarcheSanitize = NotNullableKeys<Required<Pick<ITitreDemarche, 'etapes' | 'typeId'>>>

type TitreArmAvecOctroi = {
  titre: TitreSanitize
  references: TitreReference[]
  octARM: TitreDemarcheSanitize
  blockedByMe: boolean
}

async function titresArmAvecOctroi(user: User, administrationId: AdministrationId) {
  const filters = {
    domainesIds: [DOMAINES_IDS.METAUX],
    typesIds: [TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE],
    statutsIds: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire],
  }
  const titresAutorises = await titresGet(
    filters,
    {
      fields: { id: {} },
    },
    user
  )
  const titresAutorisesIds = titresAutorises.map(({ id }) => id)
  const titres = await titresGet(
    { ...filters, ids: titresAutorisesIds, colonne: 'nom' },
    {
      fields: {
        titulaires: { id: {} },
        demarches: { etapes: { id: {} } },
      },
    },
    userSuper
  )
  const titresAvecOctroiArm: TitreArmAvecOctroi[] = titres
    .map<TitreArmAvecOctroi | null>((titre: ITitre) => {
      if (titre.slug === undefined) {
        return null
      }

      if (!titre.references) {
        throw new Error('les références ne sont pas chargées')
      }

      const references = titre.references

      if (!titre.titulaires) {
        throw new Error('les titulaires ne sont pas chargés')
      }

      if (!titre.demarches) {
        throw new Error('les démarches ne sont pas chargées')
      }

      const octARM = titre.demarches.find(demarche => demarche.typeId === 'oct')

      if (!octARM) {
        return null
      }

      if (!octARM.etapes) {
        throw new Error('les étapes ne sont pas chargées')
      }
      if (octARM.statutId === 'eco') {
        return null
      }

      const dd = demarcheDefinitionFind(titre.typeId, octARM.typeId, octARM.etapes, octARM.id)
      const etapes = octARM.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))
      const blockedByMe: boolean = dd !== undefined && dd.machine.whoIsBlocking(toMachineEtapes(etapes)).includes(administrationId)

      // TODO 2022-06-08 wait for typescript to get better at type interpolation
      return {
        titre: titre as TitreSanitize,
        references,
        octARM: octARM as TitreDemarcheSanitize,
        blockedByMe,
      }
    })
    .filter((titre: TitreArmAvecOctroi | null): titre is TitreArmAvecOctroi => titre !== null)

  return titresAvecOctroiArm
}

type AdministrationTitreSanitize = NotNullableKeys<Required<Pick<ITitre, 'slug' | 'titulaires' | 'titreStatutId' | 'type'>>> &
  Pick<ITitre, 'typeId' | 'id' | 'nom' | 'activitesEnConstruction' | 'activitesAbsentes'>

type TitreAdministrationAvecReferences = {
  titre: AdministrationTitreSanitize
  references: TitreReference[]
} & Pick<CommonTitreAdministration, 'prochainesEtapes' | 'derniereEtape' | 'enAttenteDeAdministration'>

export const titresAdministrations = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<CommonTitreAdministration[]>) => {
  const user = req.auth

  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    if (isAdministration(user)) {
      const filters = {
        statutsIds: [TitresStatutIds.DemandeInitiale, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire],
      }

      const titresAutorises = await titresGet(
        filters,
        {
          fields: { pointsEtape: { id: {} } },
        },
        user
      )
      const titresAutorisesIds = titresAutorises
        .filter(titre => {
          if (!titre.titreStatutId) {
            throw new Error('le statut du titre est obligatoire')
          }

          if (titre.administrationsLocales === undefined) {
            throw new Error('les administrations locales doivent être chargées')
          }

          return (
            canEditTitre(user, titre.typeId, titre.titreStatutId) ||
            canCreateOrEditDemarche(user, titre.typeId, titre.titreStatutId, titre.administrationsLocales ?? []) ||
            canCreateTravaux(user, titre.typeId, titre.administrationsLocales ?? [])
          )
        })
        .map(({ id }) => id)
      const titres = await titresGet(
        { ...filters, ids: titresAutorisesIds, colonne: 'nom' },
        {
          fields: {
            type: { id: {} },
            titulaires: { id: {} },
            activites: { id: {} },
            demarches: { etapes: { id: {} } },
          },
        },
        userSuper
      )

      const titresFormated: CommonTitreAdministration[] = titres
        .map((titre: ITitre): TitreAdministrationAvecReferences | null => {
          if (titre.slug === undefined) {
            return null
          }

          if (!titre.type) {
            throw new Error('les types de titres ne sont pas chargées')
          }

          if (!titre.titulaires) {
            throw new Error('les titulaires ne sont pas chargés')
          }

          if (!titre.references) {
            throw new Error('les références ne sont pas chargées')
          }

          if (!titre.activites) {
            throw new Error('les activités ne sont pas chargées')
          }

          const references = titre.references

          if (!titre.demarches) {
            throw new Error('les démarches ne sont pas chargées')
          }

          const demarcheLaPlusRecente = titre.demarches.length > 0 ? titre.demarches.sort(({ ordre: ordreA }, { ordre: ordreB }) => (ordreA ?? 0) - (ordreB ?? 0))[titre.demarches.length - 1] : null
          let enAttenteDeAdministration = false
          const prochainesEtapes: EtapeTypeId[] = []
          let derniereEtape: {
            etapeTypeId: EtapeTypeId
            date: CaminoDate
          } | null = null
          if (demarcheLaPlusRecente !== null) {
            if (!demarcheLaPlusRecente.etapes) {
              throw new Error('les étapes ne sont pas chargées')
            }
            if (demarcheLaPlusRecente.statutId === DemarchesStatutsIds.EnConstruction) {
              return null
            } else {
              const etapes = demarcheLaPlusRecente.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))
              const etapesDerniereDemarche = toMachineEtapes(etapes)
              derniereEtape = etapesDerniereDemarche[etapesDerniereDemarche.length - 1]
              const dd = demarcheDefinitionFind(titre.typeId, demarcheLaPlusRecente.typeId, demarcheLaPlusRecente.etapes, demarcheLaPlusRecente.id)
              if (dd) {
                try {
                  enAttenteDeAdministration = dd.machine.whoIsBlocking(etapesDerniereDemarche).includes(user.administrationId)
                  const nextEtapes = dd.machine.possibleNextEtapes(etapesDerniereDemarche, getCurrent())
                  prochainesEtapes.push(
                    ...nextEtapes
                      .map(etape => etape.etapeTypeId)
                      .filter(onlyUnique)
                      .filter(etape => !etapesAMasquer.includes(etape))
                  )
                } catch (e) {
                  console.error(`Impossible de traiter le titre ${titre.id} car la démarche ${demarcheLaPlusRecente.typeId} n'est pas valide`, e)
                }
              }
            }
          }

          return {
            titre: titre as AdministrationTitreSanitize,
            references,
            enAttenteDeAdministration,
            derniereEtape,
            prochainesEtapes,
          }
        })
        .filter((titre: TitreAdministrationAvecReferences | null): titre is TitreAdministrationAvecReferences => titre !== null)
        .map(({ titre, references, enAttenteDeAdministration, derniereEtape, prochainesEtapes }) => {
          return {
            id: titre.id,
            slug: titre.slug,
            nom: titre.nom,
            titre_statut_id: titre.titreStatutId,
            type_id: titre.typeId,
            references,
            titulaires: titre.titulaires,
            enAttenteDeAdministration,
            derniereEtape,
            prochainesEtapes,
          }
        })

      res.json(titresFormated)
    } else {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    }
  }
}

export const postTitreLiaisons = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<TitreLinks>) => {
  const user = req.auth

  const titreId = titreIdValidator.safeParse(req.params.id)
  const titreFromIds = z.array(titreIdValidator).safeParse(req.body)

  if (!titreFromIds.success || titreFromIds.data.length === 0) {
    throw new Error(`un tableau est attendu en corps de message : '${titreFromIds}'`)
  }

  if (!titreId.success) {
    throw new Error('le paramètre id est obligatoire')
  }

  const titre = await titreGet(
    titreId.data,
    {
      fields: {
        pointsEtape: { id: {} },
        demarches: { id: {} },
      },
    },
    user
  )

  if (!titre) throw new Error("le titre n'existe pas")

  const administrations = titreAdministrationsGet(titre)
  if (!canLinkTitres(user, administrations)) throw new Error('droits insuffisants')

  if (!titre.demarches) {
    throw new Error('les démarches ne sont pas chargées')
  }

  const titresFrom = await titresGet({ ids: titreFromIds.data }, { fields: { id: {} } }, user)

  checkTitreLinks(titre, titreFromIds.data, titresFrom, titre.demarches)

  await linkTitres({ linkTo: titreId.data, linkFrom: titreFromIds.data })

  res.json({
    amont: await titreLinksGet(titreId.data, 'titreFromId', user),
    aval: await titreLinksGet(titreId.data, 'titreToId', user),
  })
}
export const getTitreLiaisons = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<TitreLinks>) => {
  const user = req.auth

  const titreId = req.params.id

  if (!titreId) {
    res.json({ amont: [], aval: [] })
  } else {
    const titre = await titreGet(titreId, { fields: { id: {} } }, user)
    if (!titre) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else {
      const value: TitreLinks = {
        amont: await titreLinksGet(titreId, 'titreFromId', user),
        aval: await titreLinksGet(titreId, 'titreToId', user),
      }
      res.json(titreLinksValidator.parse(value))
    }
  }
}

const titreLinksGet = async (titreId: string, link: 'titreToId' | 'titreFromId', user: User): Promise<TitreLink[]> => {
  const titresTitres = await TitresTitres.query().where(link === 'titreToId' ? 'titreFromId' : 'titreToId', titreId)
  const titreIds = titresTitres.map(r => r[link])

  if (titreIds.length > 0) {
    const titres = await titresGet({ ids: titreIds }, { fields: { id: {} } }, user)

    return titres.map(({ id, nom }) => ({ id, nom }))
  } else {
    return []
  }
}

export const removeTitre = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const user = req.auth

  const titreId = titreIdValidator.safeParse(req.params.titreId)
  if (!titreId.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    const titreOld = await titreGet(
      titreId.data,
      {
        fields: {
          demarches: { etapes: { id: {} } },
          activites: { id: {} },
        },
      },
      user
    )

    if (!titreOld) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
    } else if (!canDeleteTitre(user)) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else {
      await titreArchive(titreId.data)
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
    }
  }
}

export const utilisateurTitreAbonner = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const user = req.auth
  const parsedBody = utilisateurTitreAbonneValidator.safeParse(req.body)
  const titreId: string | undefined = req.params.titreId
  if (!titreId) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else if (!parsedBody.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      if (!user) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
      } else {
        const titre = await titreGet(titreId, { fields: { id: {} } }, user)

        if (!titre) {
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
        } else {
          if (parsedBody.data.abonne) {
            await utilisateurTitreCreate({ utilisateurId: user.id, titreId })
          } else {
            await utilisateurTitreDelete(user.id, titreId)
          }
        }
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const getUtilisateurTitreAbonner = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<boolean>) => {
  const user = req.auth
  const parsedTitreId = titreIdValidator.safeParse(req.params.titreId)
  if (!parsedTitreId.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      if (!user) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
      } else {
        res.send(await getTitreUtilisateur(pool, parsedTitreId.data, user.id))
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const updateTitre = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const titreId: string | undefined = req.params.titreId
  const user = req.auth
  const parsedBody = editableTitreValidator.safeParse(req.body)
  if (!titreId) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else if (!parsedBody.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else if (titreId !== parsedBody.data.id) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      const titreOld = await titreGet(titreId, { fields: {} }, user)

      if (isNullOrUndefined(titreOld)) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
      } else {
        if (!canEditTitre(user, titreOld.typeId, titreOld.titreStatutId)) {
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
        } else {
          // on doit utiliser upsert (plutôt qu'un simple update)
          // car le titre contient des références (tableau d'objet)
          await titreUpsert(parsedBody.data)

          await titreUpdateTask(titreId)
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
        }
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const getTitre = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<TitreGet>) => {
  const titreId: string | undefined = req.params.titreId
  const user = req.auth
  if (!titreId) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      const titre = await getTitreDb(pool, user, titreIdOrSlugValidator.parse(titreId))

      if (titre === null) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
      } else {
        res.json(titre)
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}
