import { GraphQLResolveInfo } from 'graphql'
import {
  IDocumentRepertoire,
  IEtapeType,
  IFields,
  IToken
} from '../../../types'

import {
  demarchesStatutsGet,
  demarchesTypesGet,
  devisesGet,
  documentsTypesGet,
  domainesGet,
  etapesTypesGet,
  phasesStatutsGet,
  referencesTypesGet,
  titresTypesTypesGet
} from '../../../database/queries/metas'

import { userGet } from '../../../database/queries/utilisateurs'

import { fieldsBuild } from './_fields-build'
import {
  etapeTypeFormat,
  etapeTypeIsValidCheck
} from '../../_format/etapes-types'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches'
import { titreEtapeGet } from '../../../database/queries/titres-etapes'
import {
  demarcheDefinitionFind,
  isDemarcheDefinitionMachine
} from '../../../business/rules-demarches/definitions'
import { userSuper } from '../../../database/user-super'
import { sortedAdministrationTypes } from 'camino-common/src/static/administrations'
import { sortedGeoSystemes } from 'camino-common/src/static/geoSystemes'
import {
  isEtapesOk,
  possibleNextEtapes,
  toMachineEtapes
} from '../../../business/rules-demarches/machine-helper'
import { UNITES } from 'camino-common/src/static/unites'
import { titreEtapesSortAscByOrdre } from '../../../business/utils/titre-etapes-sort'
import TitresDemarches from '../../../database/models/titres-demarches'
import { Etape } from '../../../business/rules-demarches/arm/oct.machine'
import { Pays, PaysList } from 'camino-common/src/static/pays'
import { Departement, Departements } from 'camino-common/src/static/departement'
import { Region, Regions } from 'camino-common/src/static/region'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { sortedTitresStatuts } from 'camino-common/src/static/titresStatuts'

export const devises = async () => devisesGet()

export const geoSystemes = () => sortedGeoSystemes

export const unites = () => UNITES

export const documentsTypes = async ({
  repertoire,
  typeId
}: {
  repertoire: IDocumentRepertoire
  typeId?: string
}) => {
  try {
    return await documentsTypesGet({ repertoire, typeId })
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const referencesTypes = async () => referencesTypesGet()

export const domaines = async (
  _: never,
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    return await domainesGet(null as never, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const types = async () => {
  try {
    return await titresTypesTypesGet()
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const statuts = () => sortedTitresStatuts

export const demarchesTypes = async (
  { titreId, travaux }: { titreId?: string; travaux?: boolean },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    return await demarchesTypesGet({ titreId, travaux }, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const demarchesStatuts = async () => {
  try {
    return await demarchesStatutsGet()
  } catch (e) {
    console.error(e)

    throw e
  }
}
// VISIBLE_FOR_TESTING
export const etapesTypesPossibleACetteDateOuALaPlaceDeLEtape = (
  titreDemarche: Pick<TitresDemarches, 'etapes'>,
  titreEtapeId: string | undefined,
  date: string,
  etapesTypes: IEtapeType[]
): IEtapeType[] => {
  if (!titreDemarche.etapes) throw new Error('les étapes ne sont pas chargées')
  const sortedEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes)
  const etapesAvant: Etape[] = []
  const etapesApres: Etape[] = []
  if (titreEtapeId) {
    const index = sortedEtapes.findIndex(etape => etape.id === titreEtapeId)
    etapesAvant.push(...toMachineEtapes(sortedEtapes.slice(0, index)))
    etapesApres.push(...toMachineEtapes(sortedEtapes.slice(index + 1)))
  } else {
    // TODO 2022-07-12: Il faudrait mieux gérer les étapes à la même date que l'étape qu'on veut rajouter
    // elles ne sont ni avant, ni après, mais potentiellement au milieu de toutes ces étapes
    etapesAvant.push(
      ...toMachineEtapes(sortedEtapes.filter(etape => etape.date <= date))
    )
    etapesApres.push(...toMachineEtapes(sortedEtapes.slice(etapesAvant.length)))
  }

  const etapesPossibles = possibleNextEtapes(etapesAvant).filter(et => {
    const newEtapes = [...etapesAvant]

    const items = { ...et, date }
    newEtapes.push(items)
    newEtapes.push(...etapesApres)

    return isEtapesOk(newEtapes)
  })

  etapesTypes = etapesTypes.filter(et =>
    etapesPossibles.map(({ typeId }) => typeId).includes(et.id)
  )

  return etapesTypes
}

const demarcheEtapesTypesGet = async (
  {
    titreDemarcheId,
    titreEtapeId,
    date
  }: { titreDemarcheId: string; date: string; titreEtapeId?: string },
  { fields }: { fields: IFields },
  userId?: string
) => {
  const user = await userGet(userId)

  const titreDemarche = await titreDemarcheGet(
    titreDemarcheId,
    {
      fields: {
        type: { etapesTypes: { id: {} } },
        titre: {
          type: { demarchesTypes: { id: {} } },
          demarches: { etapes: { id: {} } }
        },
        etapes: { type: { id: {} } }
      }
    },
    userSuper
  )

  if (!titreDemarche) throw new Error("la démarche n'existe pas")

  const titre = titreDemarche.titre!

  const titreEtape = titreEtapeId
    ? await titreEtapeGet(titreEtapeId, {}, user)
    : undefined

  if (titreEtapeId && !titreEtape) throw new Error("l'étape n'existe pas")

  const demarcheTypeEtapesTypes = titreDemarche.type!.etapesTypes
  // si on modifie une étape
  // vérifie que son type est possible sur la démarche
  if (titreEtape) {
    const etapeType = demarcheTypeEtapesTypes.find(
      et => et.id === titreEtape.typeId
    )

    if (!etapeType) {
      throw new Error(
        `étape ${titreEtape.type!.nom} inexistante pour une démarche ${
          titreDemarche.type!.nom
        } pour un titre ${titre.typeId}.`
      )
    }
  }

  // si il existe un arbre d’instructions pour cette démarche,
  // on laisse l’arbre traiter l’unicité des étapes
  const demarcheDefinition = demarcheDefinitionFind(
    titre.typeId,
    titreDemarche.typeId,
    titreDemarche.etapes,
    titreDemarche.id
  )

  // dans un premier temps on récupère toutes les étapes possibles pour cette démarche
  let etapesTypes: IEtapeType[] = await etapesTypesGet(
    { titreDemarcheId, titreEtapeId },
    { fields, uniqueCheck: !demarcheDefinition },
    user
  )

  if (isDemarcheDefinitionMachine(demarcheDefinition)) {
    etapesTypes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      titreDemarche,
      titreEtapeId,
      date,
      etapesTypes
    )
  } else {
    etapesTypes = etapesTypes.filter(etapeType =>
      etapeTypeIsValidCheck(
        etapeType,
        date,
        titre,
        titreDemarche.type!,
        titreDemarche.id,
        titreDemarche.etapes,
        titreEtape
      )
    )
  }

  return etapesTypes.map(et =>
    etapeTypeFormat(et, undefined, undefined, undefined)
  )
}

export const etapesTypes = async (
  {
    titreDemarcheId,
    titreEtapeId,
    date,
    travaux
  }: {
    titreDemarcheId?: string
    titreEtapeId?: string
    date?: string
    travaux?: boolean
  },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    // si création ou édition d'une étape de démarche
    // retourne les types d'étape pour cette démarche
    if (titreDemarcheId) {
      if (!date) {
        throw new Error(`date manquante`)
      }

      return demarcheEtapesTypesGet(
        { titreDemarcheId, date, titreEtapeId },
        { fields },
        context.user?.id
      )
    }

    // sinon (p.e.: édition des métas ou des permissions d'administration)
    // retourne la liste des types d'étapes
    return etapesTypesGet({ travaux }, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const etapesStatuts = () => Object.values(EtapesStatuts)

export const version = () => process.env.APPLICATION_VERSION

/**
 * Retourne les types d'administrations
 *
 * @returns un tableau de types d'administrations
 */
export const administrationsTypes = () => {
  try {
    return sortedAdministrationTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const pays = (): Pays[] => Object.values(PaysList)

export const departements = (): Departement[] => Object.values(Departements)

export const regions = (): Region[] => Object.values(Regions)

export const phasesStatuts = async () => {
  try {
    return await phasesStatutsGet()
  } catch (e) {
    console.error(e)

    throw e
  }
}
