import { titresGet } from '../../database/queries/titres'

import { userGet } from '../../database/queries/utilisateurs'

import { ADMINISTRATION_IDS } from 'camino-common/src/administrations'
import express from 'express'
import { constants } from 'http2'
import { DOMAINES_IDS } from 'camino-common/src/domaines'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/titresTypesTypes'
import { ITitre, IUser, ITitreReference } from '../../types'
import { CommonTitreONF } from 'camino-common/src/titres'
import {
  toMachineEtapes,
  whoIsBlocking
} from '../../business/rules-demarches/machine-helper'
import {
  demarcheDefinitionFind,
  isDemarcheDefinitionMachine
} from '../../business/rules-demarches/definitions'

type Send<T = express.Response> = (body?: CommonTitreONF[]) => T

interface CustomResponse extends express.Response {
  json: Send<this>
}

type MyTitreRef = { type: NonNullable<ITitreReference['type']> } & Omit<
  ITitreReference,
  'type'
>

export const titresONF = async (req: express.Request, res: CustomResponse) => {
  const userId = (req.user as unknown as IUser | undefined)?.id

  const user = await userGet(userId)

  if (
    !user?.administrations?.find(
      ({ id }) => id === ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    )
  ) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const titres = await titresGet(
      {
        domainesIds: [DOMAINES_IDS.METAUX],
        typesIds: [TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE],
        statutsIds: ['dmi', 'mod', 'val']
      },
      {
        fields: {
          statut: { id: {} },
          references: { type: { id: {} } },
          titulaires: { id: {} },
          demarches: { etapes: { id: {} } }
        }
      },
      user
    )

    const titresFormated: CommonTitreONF[] = titres
      .map<CommonTitreONF | null>((titre: ITitre) => {
        if (titre.slug === undefined) {
          return null
        }
        if (!titre.statut) {
          throw new Error('le statut du titre n’est pas chargé')
        }

        if (!titre.references) {
          throw new Error('les références ne sont pas chargées')
        }

        const references = titre.references.filter(
          (reference: ITitreReference): reference is MyTitreRef =>
            !!reference.type && !!reference.type.nom && !!reference.nom
        )
        if (titre.references.length !== references.length) {
          throw new Error('le type de référence n’est pas chargé')
        }

        if (!titre.titulaires) {
          throw new Error('les titulaires ne sont pas chargés')
        }

        if (!titre.demarches) {
          throw new Error('les démarches ne sont pas chargées')
        }

        const octARM = titre.demarches.find(
          demarche => demarche.typeId === 'oct'
        )

        if (!octARM) {
          return null
        }

        if (!octARM.etapes) {
          throw new Error('les étapes ne sont pas chargées')
        }

        const dateCompletudePTMG =
          octARM.etapes.find(etape => etape.typeId === 'mcp')?.date || ''

        const dateReceptionONF =
          octARM.etapes.find(etape => etape.typeId === 'mcr')?.date || ''

        const dateCARM =
          octARM.etapes.find(etape => etape.typeId === 'sca')?.date || ''

        const hasMachine = isDemarcheDefinitionMachine(
          demarcheDefinitionFind(titre.typeId, octARM.typeId, octARM.etapes)
        )
        const blockedByMe: boolean =
          hasMachine &&
          whoIsBlocking(toMachineEtapes(octARM.etapes)).includes(
            ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
          )

        return {
          id: titre.id,
          slug: titre.slug,
          nom: titre.nom,
          statut: titre.statut,
          references,
          titulaires: titre.titulaires,
          dateCompletudePTMG,
          dateReceptionONF,
          dateCARM,
          enAttenteDeONF: blockedByMe
        }
      })
      .filter(
        (titre: CommonTitreONF | null): titre is CommonTitreONF =>
          titre !== null
      )

    res.json(titresFormated)
  }
}
