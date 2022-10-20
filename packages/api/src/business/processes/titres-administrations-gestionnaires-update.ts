import { ITitre, ITitreAdministrationGestionnaire } from '../../types'

import {
  titreAdministrationGestionnaireDelete,
  titresAdministrationsGestionnairesCreate,
  titresGet
} from '../../database/queries/titres'

import { userSuper } from '../../database/user-super'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes'

const titreAsGsToCreatedFind = (
  titreAsGsOldIds: string[],
  titreAsGs: ITitreAdministrationGestionnaire[]
) =>
  titreAsGs.reduce(
    (
      titresAsGsToCreate: ITitreAdministrationGestionnaire[],
      titreAdministrationGestionnaire
    ) => {
      if (
        !titreAsGsOldIds.some(
          id => id === titreAdministrationGestionnaire.administrationId
        )
      ) {
        titresAsGsToCreate.push(titreAdministrationGestionnaire)
      }

      return titresAsGsToCreate
    },
    []
  )

const titreAsGsToDeleteFind = (
  titreAsGsOldIds: string[],
  titreAsGs: ITitreAdministrationGestionnaire[],
  titreId: string
) =>
  titreAsGsOldIds.reduce(
    (titreAsGsToDelete: ITitreAdministrationGestionnaire[], id) => {
      if (!titreAsGs.find(({ administrationId }) => administrationId === id)) {
        titreAsGsToDelete.push({
          titreId,
          administrationId: id
        })
      }

      return titreAsGsToDelete
    },
    []
  )

interface ITitresAsGsToUpdate {
  titreAsGsOldIds: string[]
  titreAsGs: ITitreAdministrationGestionnaire[]
  titreId: string
}

const titresAsGsToUpdateBuild = (titres: ITitre[]) =>
  titres.reduce((titresAsGsToUpdate: ITitresAsGsToUpdate[], titre) => {
    const titreAsGs: ITitreAdministrationGestionnaire[] =
      getGestionnairesByTitreTypeId(titre.typeId).map(a => ({
        ...a,
        titreId: titre.id
      }))

    const titreAsGsToUpdate = {
      titreAsGsOldIds: titre.administrationsGestionnaires
        ? titre.administrationsGestionnaires.map(({ id }) => id)
        : [],
      titreAsGs,
      titreId: titre.id
    }

    titresAsGsToUpdate.push(titreAsGsToUpdate)

    return titresAsGsToUpdate
  }, [])

const titresAsGsToCreateAndDeleteBuild = (titres: ITitre[]) =>
  titresAsGsToUpdateBuild(titres).reduce(
    (
      {
        titresAsGsToCreate,
        titresAsGsToDelete
      }: {
        titresAsGsToCreate: ITitreAdministrationGestionnaire[]
        titresAsGsToDelete: ITitreAdministrationGestionnaire[]
      },
      { titreAsGsOldIds, titreAsGs, titreId }
    ) => {
      titresAsGsToCreate.push(
        ...titreAsGsToCreatedFind(titreAsGsOldIds, titreAsGs)
      )

      titresAsGsToDelete.push(
        ...titreAsGsToDeleteFind(titreAsGsOldIds, titreAsGs, titreId)
      )

      return { titresAsGsToCreate, titresAsGsToDelete }
    },
    {
      titresAsGsToCreate: [],
      titresAsGsToDelete: []
    }
  )

export const titresAdministrationsGestionnairesUpdate = async (
  titresIds?: string[]
) => {
  console.info()
  console.info('administrations gestionnaires associées aux titres…')

  const titres = await titresGet(
    { ids: titresIds },
    { fields: { administrationsGestionnaires: { id: {} } } },
    userSuper
  )

  const { titresAsGsToCreate, titresAsGsToDelete } =
    titresAsGsToCreateAndDeleteBuild(titres)

  let titresAsGsCreated = [] as ITitreAdministrationGestionnaire[]
  const titresAsGsDeleted = [] as string[]

  if (titresAsGsToCreate.length) {
    titresAsGsCreated = await titresAdministrationsGestionnairesCreate(
      titresAsGsToCreate
    )

    console.info(
      'titre : administrations gestionnaires (création) ->',
      titresAsGsCreated.map(tag => JSON.stringify(tag)).join(', ')
    )
  }

  if (titresAsGsToDelete.length) {
    for (const { titreId, administrationId } of titresAsGsToDelete) {
      await titreAdministrationGestionnaireDelete(titreId, administrationId)

      console.info(
        'titre : administration gestionnaire (suppression) ->',
        `${titreId}: ${administrationId}`
      )

      titresAsGsDeleted.push(titreId)
    }
  }

  return {
    titresAdministrationsGestionnairesCreated: titresAsGsCreated.map(
      tag => tag.titreId
    ),
    titresAdministrationsGestionnairesDeleted: titresAsGsDeleted
  }
}
