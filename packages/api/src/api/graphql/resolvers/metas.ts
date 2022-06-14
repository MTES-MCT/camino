import { GraphQLResolveInfo } from 'graphql'
import {
  IDemarcheStatut,
  IDemarcheType,
  IDocumentRepertoire,
  IDocumentType,
  IDomaine,
  IEtapeStatut,
  IEtapeType,
  IFields,
  IPhaseStatut,
  IReferenceType,
  ITitreStatut,
  ITitreTypeType,
  IToken
} from '../../../types'
import { debug } from '../../../config/index'

import {
  demarchesStatutsGet,
  demarcheStatutUpdate,
  demarchesTypesGet,
  demarcheTypeUpdate,
  devisesGet,
  documentsTypesGet,
  documentTypeCreate,
  documentTypeUpdate,
  domainesGet,
  domaineUpdate,
  etapesStatutsGet,
  etapeStatutUpdate,
  etapesTypesGet,
  etapeTypeUpdate,
  phasesStatutsGet,
  phaseStatutUpdate,
  referencesTypesGet,
  referenceTypeUpdate,
  titresStatutsGet,
  titreStatutUpdate,
  titresTypesTypesGet,
  titreTypeTypeUpdate
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
  departementsGet,
  paysGet,
  regionsGet
} from '../../../database/queries/territoires'
import { ordreUpdate } from './_ordre-update'
import {
  demarcheDefinitionFind,
  isDemarcheDefinitionMachine
} from '../../../business/rules-demarches/definitions'
import { userSuper } from '../../../database/user-super'
import { titresEtapesHeritageContenuUpdate } from '../../../business/processes/titres-etapes-heritage-contenu-update'
import { sortedAdministrationTypes } from 'camino-common/src/administrations'
import { sortedGeoSystemes } from 'camino-common/src/geoSystemes'
import {
  isEtapesOk,
  possibleNextEtapes,
  toMachineEtapes
} from '../../../business/rules-demarches/machine-helper'
import { UNITES } from 'camino-common/src/unites'
import {
  isAdministrationAdmin,
  isEntreprise,
  isSuper,
  isAdministrationEditeur
} from 'camino-common/src/roles'
import { titreEtapesSortAscByOrdre } from '../../../business/utils/titre-etapes-sort'
import TitresDemarches from '../../../database/models/titres-demarches'
import { Etape } from '../../../business/rules-demarches/arm/oct.machine'

const devises = async () => devisesGet()

const geoSystemes = () => sortedGeoSystemes

const unites = () => UNITES

const documentsTypes = async ({
  repertoire,
  typeId
}: {
  repertoire: IDocumentRepertoire
  typeId?: string
}) => {
  try {
    return await documentsTypesGet({ repertoire, typeId })
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const documentsVisibilites = async (_: never, context: IToken) => {
  const user = await userGet(context.user?.id)
  if (!user) return []

  if (
    isSuper(user) ||
    isAdministrationAdmin(user) ||
    isAdministrationEditeur(user)
  ) {
    return [
      { id: 'admin', nom: 'Administrations uniquement' },
      { id: 'entreprise', nom: 'Administrations et entreprises titulaires' },
      { id: 'public', nom: 'Public' }
    ]
  }

  if (isEntreprise(user)) {
    return [
      { id: 'entreprise', nom: 'Administrations et entreprises titulaires' }
    ]
  }

  return []
}

const referencesTypes = async () => referencesTypesGet()

const domaines = async (
  _: never,
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    return await domainesGet(null as never, { fields }, user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const types = async () => {
  try {
    return await titresTypesTypesGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const statuts = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

    return await titresStatutsGet(user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const demarchesTypes = async (
  { titreId, travaux }: { titreId?: string; travaux?: boolean },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)
    const fields = fieldsBuild(info)

    return await demarchesTypesGet({ titreId, travaux }, { fields }, user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const demarchesStatuts = async () => {
  try {
    return await demarchesStatutsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

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
    etapesAvant.push(
      ...toMachineEtapes(sortedEtapes.filter(etape => etape.date < date))
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
        type: { etapesTypes: { etapesStatuts: { id: {} } } },
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
    titreDemarche.typeId
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
        titreDemarche.etapes,
        titreEtape
      )
    )
  }

  return etapesTypes.map(et =>
    etapeTypeFormat(et, undefined, undefined, undefined)
  )
}

const etapesTypes = async (
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
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const etapesStatuts = async () => {
  try {
    return await etapesStatutsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const version = () => process.env.APPLICATION_VERSION

/**
 * Retourne les types d'administrations
 *
 * @returns un tableau de types d'administrations
 */
const administrationsTypes = () => {
  try {
    return sortedAdministrationTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const pays = async () => {
  try {
    return await paysGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

/**
 * Retourne les départements
 *
 * @returns un tableau de départements
 */
const departements = async () => {
  try {
    return await departementsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

/**
 * Retourne les régions
 *
 * @returns un tableau de régions
 */
const regions = async () => {
  try {
    return await regionsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const phasesStatuts = async () => {
  try {
    return await phasesStatutsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const domaineModifier = async (
  { domaine }: { domaine: IDomaine },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)

    if (domaine.ordre) {
      const domaines = await domainesGet(null as never, { fields }, user)

      await ordreUpdate(domaine, domaines, domaineUpdate)
    }

    await domaineUpdate(domaine.id!, domaine)

    return await domainesGet(null as never, { fields }, user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const titreTypeTypeModifier = async (
  { titreType }: { titreType: ITitreTypeType },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    if (titreType.ordre) {
      const titresTypesTypes = await titresTypesTypesGet()

      await ordreUpdate(titreType, titresTypesTypes, titreTypeTypeUpdate)
    }

    await titreTypeTypeUpdate(titreType.id!, titreType)

    return await titresTypesTypesGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const titreStatutModifier = async (
  { titreStatut }: { titreStatut: ITitreStatut },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    if (titreStatut.ordre) {
      const titresStatuts = await titresStatutsGet(user)

      await ordreUpdate(titreStatut, titresStatuts, titreStatutUpdate)
    }

    await titreStatutUpdate(titreStatut.id!, titreStatut)

    return await titresStatutsGet(user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const demarcheTypeModifier = async (
  { demarcheType }: { demarcheType: IDemarcheType },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)

    if (demarcheType.ordre) {
      const demarchesTypes = await demarchesTypesGet({}, { fields }, user)

      await ordreUpdate(demarcheType, demarchesTypes, demarcheTypeUpdate)
    }

    await demarcheTypeUpdate(demarcheType.id!, demarcheType)

    return await demarchesTypesGet({}, { fields }, user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const demarcheStatutModifier = async (
  { demarcheStatut }: { demarcheStatut: IDemarcheStatut },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    if (demarcheStatut.ordre) {
      const demarchesStatuts = await demarchesStatutsGet()

      await ordreUpdate(demarcheStatut, demarchesStatuts, demarcheStatutUpdate)
    }

    await demarcheStatutUpdate(demarcheStatut.id!, demarcheStatut)

    return await demarchesStatutsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const phaseStatutModifier = async (
  { phaseStatut }: { phaseStatut: IPhaseStatut },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await phaseStatutUpdate(phaseStatut.id!, phaseStatut)

    return await phasesStatutsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const etapeTypeModifier = async (
  { etapeType }: { etapeType: IEtapeType },
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)

    if (etapeType.ordre) {
      const etapesTypes = await etapesTypesGet({}, { fields }, user)

      await ordreUpdate(etapeType, etapesTypes, etapeTypeUpdate)
    }

    await etapeTypeUpdate(etapeType.id!, etapeType)

    await titresEtapesHeritageContenuUpdate(user)

    return await etapesTypesGet({}, { fields }, user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const etapeStatutModifier = async (
  { etapeStatut }: { etapeStatut: IEtapeStatut },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await etapeStatutUpdate(etapeStatut.id!, etapeStatut)

    return await etapesStatutsGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const documentTypeCreer = async (
  { documentType }: { documentType: IDocumentType },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await documentTypeCreate(documentType)

    return await documentsTypesGet({})
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const documentTypeModifier = async (
  { documentType }: { documentType: IDocumentType },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await documentTypeUpdate(documentType.id!, documentType)

    return await documentsTypesGet({})
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}
const referenceTypeModifier = async (
  { referenceType }: { referenceType: IReferenceType },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await referenceTypeUpdate(referenceType.id!, referenceType)

    return await referencesTypesGet()
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export {
  devises,
  demarchesTypes,
  demarchesStatuts,
  documentsTypes,
  documentsVisibilites,
  domaines,
  etapesTypes,
  etapesStatuts,
  geoSystemes,
  phasesStatuts,
  referencesTypes,
  statuts,
  titreStatutModifier,
  types,
  unites,
  version,
  administrationsTypes,
  regions,
  departements,
  domaineModifier,
  titreTypeTypeModifier,
  demarcheTypeModifier,
  demarcheStatutModifier,
  phaseStatutModifier,
  etapeTypeModifier,
  etapeStatutModifier,
  documentTypeCreer,
  documentTypeModifier,
  referenceTypeModifier,
  pays
}
