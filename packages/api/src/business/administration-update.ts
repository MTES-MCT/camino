import { titresAdministrationsGestionnairesUpdate } from './processes/titres-administrations-gestionnaires-update'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update'
import { logsUpdate } from './_logs-update'

const administrationUpdate = async (administrationId: string) => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'une administration : ${administrationId}`)

    const {
      titresAdministrationsGestionnairesCreated = [],
      titresAdministrationsGestionnairesDeleted = []
    } = await titresAdministrationsGestionnairesUpdate()

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    logsUpdate({
      titresAdministrationsGestionnairesCreated,
      titresAdministrationsGestionnairesDeleted,
      titresEtapesAdministrationsLocalesUpdated:
        titresEtapesAdministrationsLocalesUpdated.map(
          ({ titreEtapeId }) => titreEtapeId
        )
    })

    return administrationId
  } catch (e) {
    console.error(`erreur: administrationUpdate ${administrationId}`)
    console.error(e)

    throw e
  }
}

export default administrationUpdate
