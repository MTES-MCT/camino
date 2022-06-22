import { GraphQLResolveInfo } from 'graphql'
import {
  Context,
  IActiviteStatut,
  IActiviteType,
  IActiviteTypeDocumentType,
  IActiviteTypePays,
  IActiviteTypeTitreType
} from '../../../types'

import { debug } from '../../../config/index'
import { fieldsBuild } from './_fields-build'
import {
  activitesStatutsGet,
  activiteStatutUpdate,
  activitesTypesDocumentsTypesGet,
  activitesTypesGet,
  activitesTypesPaysGet,
  activitesTypesTitresTypesGet,
  activiteTypeDocumentTypeCreate,
  activiteTypeDocumentTypeDelete,
  activiteTypeDocumentTypeUpdate,
  activiteTypePaysCreate,
  activiteTypePaysDelete,
  activiteTypeTitreTypeCreate,
  activiteTypeTitreTypeDelete,
  activiteTypeUpdate
} from '../../../database/queries/metas-activites'
import { ordreUpdate } from './_ordre-update'
import { isSuper } from 'camino-common/src/roles'

const activitesTypes = async (
  _: never,
  _context: Context,
  info: GraphQLResolveInfo
) => {
  try {
    const fields = fieldsBuild(info)

    return await activitesTypesGet({ fields })
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activitesStatuts = async () => {
  try {
    const activitesStatuts = await activitesStatutsGet()

    return activitesStatuts
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypeModifier = async (
  { activiteType }: { activiteType: IActiviteType },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)

    if (activiteType.ordre) {
      const activitesTypes = await activitesTypesGet({ fields })

      await ordreUpdate(activiteType, activitesTypes, activiteTypeUpdate)
    }

    await activiteTypeUpdate(activiteType.id!, activiteType)

    const activitesTypes = await activitesTypesGet({ fields })

    return activitesTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteStatutModifier = async (
  { activiteStatut }: { activiteStatut: IActiviteStatut },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteStatutUpdate(activiteStatut.id!, activiteStatut)

    const activitesStatuts = await activitesStatutsGet()

    return activitesStatuts
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activitesTypesTitresTypes = async (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const activitesTypesTitresTypes = await activitesTypesTitresTypesGet()

    return activitesTypesTitresTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypeTitreTypeCreer = async (
  { activiteTypeTitreType }: { activiteTypeTitreType: IActiviteTypeTitreType },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypeTitreTypeCreate(activiteTypeTitreType)

    const activitesTypesTitresTypes = await activitesTypesTitresTypesGet()

    return activitesTypesTitresTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypeTitreTypeSupprimer = async (
  { activiteTypeTitreType }: { activiteTypeTitreType: IActiviteTypeTitreType },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypeTitreTypeDelete({
      activiteTypeId: activiteTypeTitreType.activiteTypeId,
      titreTypeId: activiteTypeTitreType.titreTypeId
    })

    const activitesTypesTitresTypes = await activitesTypesTitresTypesGet()

    return activitesTypesTitresTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activitesTypesDocumentsTypes = async (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const activitesTypesDocumentsTypes = await activitesTypesDocumentsTypesGet()

    return activitesTypesDocumentsTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypeDocumentTypeCreer = async (
  {
    activiteTypeDocumentType
  }: { activiteTypeDocumentType: IActiviteTypeDocumentType },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypeDocumentTypeCreate(activiteTypeDocumentType)

    const activitesTypesDocumentsTypes = await activitesTypesDocumentsTypesGet()

    return activitesTypesDocumentsTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypeDocumentTypeModifier = async (
  {
    activiteTypeDocumentType
  }: { activiteTypeDocumentType: IActiviteTypeDocumentType },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypeDocumentTypeUpdate(
      activiteTypeDocumentType.activiteTypeId,
      activiteTypeDocumentType.documentTypeId,
      activiteTypeDocumentType
    )

    const activitesTypesDocumentsTypes = await activitesTypesDocumentsTypesGet()

    return activitesTypesDocumentsTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypeDocumentTypeSupprimer = async (
  {
    activiteTypeDocumentType
  }: { activiteTypeDocumentType: IActiviteTypeDocumentType },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypeDocumentTypeDelete({
      activiteTypeId: activiteTypeDocumentType.activiteTypeId,
      documentTypeId: activiteTypeDocumentType.documentTypeId
    })

    const activitesTypesDocumentsTypes = await activitesTypesDocumentsTypesGet()

    return activitesTypesDocumentsTypes
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activitesTypesPays = async (_: never, { user }: Context) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    const activitesTypesPays = await activitesTypesPaysGet()

    return activitesTypesPays
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypePaysCreer = async (
  { activiteTypePays }: { activiteTypePays: IActiviteTypePays },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypePaysCreate(activiteTypePays)

    const activitesTypesDocumentsPays = await activitesTypesPaysGet()

    return activitesTypesDocumentsPays
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const activiteTypePaysSupprimer = async (
  { activiteTypePays }: { activiteTypePays: IActiviteTypePays },
  { user }: Context
) => {
  try {
    if (!isSuper(user)) {
      throw new Error('droits insuffisants')
    }

    await activiteTypePaysDelete({
      activiteTypeId: activiteTypePays.activiteTypeId,
      paysId: activiteTypePays.paysId
    })

    const activitesTypesDocumentsPays = await activitesTypesPaysGet()

    return activitesTypesDocumentsPays
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export {
  activitesTypes,
  activiteTypeModifier,
  activitesStatuts,
  activiteStatutModifier,
  activitesTypesTitresTypes,
  activiteTypeTitreTypeCreer,
  activiteTypeTitreTypeSupprimer,
  activitesTypesDocumentsTypes,
  activiteTypeDocumentTypeModifier,
  activiteTypeDocumentTypeCreer,
  activiteTypeDocumentTypeSupprimer,
  activitesTypesPays,
  activiteTypePaysCreer,
  activiteTypePaysSupprimer
}
