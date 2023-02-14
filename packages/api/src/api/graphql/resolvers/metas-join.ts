import { IToken } from '../../../types.js'

import { userGet } from '../../../database/queries/utilisateurs.js'

import {
  titresTypesGet,
  titresTypesDemarchesTypesEtapesTypesGet,
  etapesTypesDocumentsTypesGet,
  etapesTypesJustificatifsTypesGet,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypesGet
} from '../../../database/queries/metas.js'
import { GraphQLResolveInfo } from 'graphql'
import { fieldsBuild } from './_fields-build.js'
import { isSuper } from 'camino-common/src/roles.js'
import { titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts.js'

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

const titresTypesTitresStatuts = (_: never) => {
  return titreTypesStatutsTitresPublicLecture
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
  titresTypesDemarchesTypesEtapesTypes,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  etapesTypesDocumentsTypes,
  etapesTypesJustificatifsTypes
}
