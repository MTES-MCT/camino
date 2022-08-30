import { IToken } from '../../../types'

import { userGet } from '../../../database/queries/utilisateurs'

import {
  titresTypesGet,
  titresTypesTitresStatutsGet,
  titresTypesDemarchesTypesGet,
  titresTypesDemarchesTypesEtapesTypesGet,
  etapesTypesDocumentsTypesGet,
  etapesTypesJustificatifsTypesGet,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypesGet,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet
} from '../../../database/queries/metas'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build'
import { isSuper } from 'camino-common/src/roles'

const titresTypes = async (
  _: never,
  context: IToken,
  info: GraphQLResolveInfo
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)

    const titresTypes = await titresTypesGet(null as never, { fields })

    return titresTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

//

const titresTypesTitresStatuts = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const titresTypesTitresStatuts = await titresTypesTitresStatutsGet()

    return titresTypesTitresStatuts
  } catch (e) {
    console.error(e)

    throw e
  }
}

const titresTypesDemarchesTypes = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const titresTypesDemarchesTypes = await titresTypesDemarchesTypesGet()

    return titresTypesDemarchesTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}
//

const titresTypesDemarchesTypesEtapesTypes = async (
  _: never,
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const titresTypesDemarchesTypesEtapesTypes =
      await titresTypesDemarchesTypesEtapesTypesGet()

    return titresTypesDemarchesTypesEtapesTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}
//

const titresTypesDemarchesTypesEtapesTypesDocumentsTypes = async (
  _: never,
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const titresTypesDemarchesTypesEtapesTypesDocumentsTypes =
      await titresTypesDemarchesTypesEtapesTypesDocumentsTypesGet()

    return titresTypesDemarchesTypesEtapesTypesDocumentsTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

//

const titresTypesDemarchesTypesEtapesTypesJustificatifsTypes = async (
  _: never,
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const titresTypesDemarchesTypesEtapesTypesJustificatifsTypes =
      await titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet()

    return titresTypesDemarchesTypesEtapesTypesJustificatifsTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

const etapesTypesDocumentsTypes = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const etapesTypesDocumentsTypes = await etapesTypesDocumentsTypesGet()

    return etapesTypesDocumentsTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

const etapesTypesJustificatifsTypes = async (_: never, context: IToken) => {
  try {
    const user = await userGet(context.user?.id)

    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const etapesTypesJustificatifsTypes =
      await etapesTypesJustificatifsTypesGet()

    return etapesTypesJustificatifsTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

export {
  titresTypes,
  titresTypesTitresStatuts,
  titresTypesDemarchesTypes,
  titresTypesDemarchesTypesEtapesTypes,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  etapesTypesDocumentsTypes,
  etapesTypesJustificatifsTypes
}
