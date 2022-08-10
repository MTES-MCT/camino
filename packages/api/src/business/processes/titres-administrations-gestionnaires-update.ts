import {
  IAdministration,
  ITitre,
  ITitreAdministrationGestionnaire
} from '../../types'

import {
  titreAdministrationGestionnaireDelete,
  titresAdministrationsGestionnairesCreate,
  titresGet
} from '../../database/queries/titres'

import titreAdministrationsGestionnairesBuild from '../rules/titre-administrations-gestionnaires-build'
import { administrationsGet } from '../../database/queries/administrations'
import { userSuper } from '../../database/user-super'

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

const titresAsGsToUpdateBuild = (
  titres: ITitre[],
  administrations: IAdministration[]
) =>
  titres.reduce((titresAsGsToUpdate: ITitresAsGsToUpdate[], titre) => {
    const titreAsGs = titreAdministrationsGestionnairesBuild(
      titre,
      administrations
    )

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

const titresAsGsToCreateAndDeleteBuild = (
  titres: ITitre[],
  administrations: IAdministration[]
) =>
  titresAsGsToUpdateBuild(titres, administrations).reduce(
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

  const administrations = await administrationsGet({}, userSuper)

  const { titresAsGsToCreate, titresAsGsToDelete } =
    titresAsGsToCreateAndDeleteBuild(titres, administrations)

  let titresAsGsCreated = [] as ITitreAdministrationGestionnaire[]
  const titresAsGsDeleted = [] as string[]

  if (titresAsGsToCreate.length) {
    titresAsGsCreated = await titresAdministrationsGestionnairesCreate(
      titresAsGsToCreate
    )

    const log = {
      type: 'titre : administrations gestionnaires (création) ->',
      value: titresAsGsCreated.map(tag => JSON.stringify(tag)).join(', ')
    }

    console.info(log.type, log.value)
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
