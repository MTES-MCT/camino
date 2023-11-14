import { ITitreEtape } from '../../types.js'

import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { getAdministrationsLocales } from 'camino-common/src/administrations.js'
import { knex } from '../../knex.js'

interface ITitreEtapeAdministrationLocale {
  titreEtapeAdministrationsLocalesOld: AdministrationId[]
  titreEtapeAdministrationsLocales: AdministrationId[]
  titreEtapeId: string
}

const titresEtapesAdministrationsLocalesBuild = (etapes: ITitreEtape[]): ITitreEtapeAdministrationLocale[] =>
  etapes.reduce<ITitreEtapeAdministrationLocale[]>((titresEtapesAdministrationsLocales, titreEtape) => {
    const titreEtapeAdministrationsLocales = getAdministrationsLocales(
      titreEtape.communes?.map(({ id }) => id),
      titreEtape.secteursMaritime
    )

    titresEtapesAdministrationsLocales.push({
      titreEtapeAdministrationsLocalesOld: titreEtape.administrationsLocales?.sort() ?? [],
      titreEtapeAdministrationsLocales: titreEtapeAdministrationsLocales.sort(),
      titreEtapeId: titreEtape.id,
    })

    return titresEtapesAdministrationsLocales
  }, [])

export const titresEtapesAdministrationsLocalesUpdate = async (titresEtapesIds?: string[]) => {
  console.info()
  console.info('administrations locales associées aux étapes…')

  const etapes = await titresEtapesGet({ titresEtapesIds }, { fields: { id: {} } }, userSuper)
  const titresEtapesAdministrationsLocalesUpdated: {
    titreEtapeId: string
    administrations: AdministrationId[]
  }[] = []

  if (etapes.length > 0) {
    const titresEtapesAdministrationsLocales = titresEtapesAdministrationsLocalesBuild(etapes)

    for (const { titreEtapeId, titreEtapeAdministrationsLocales, titreEtapeAdministrationsLocalesOld } of titresEtapesAdministrationsLocales) {
      if (
        titreEtapeAdministrationsLocales.length !== titreEtapeAdministrationsLocalesOld.length ||
        titreEtapeAdministrationsLocales.some((a, index) => a !== titreEtapeAdministrationsLocalesOld[index])
      ) {
        await knex('titres_etapes')
          .update({
            administrationsLocales: JSON.stringify(titreEtapeAdministrationsLocales),
          })
          .where('id', titreEtapeId)
        console.info(
          `titres / démarches / étapes ${titreEtapeId} : administrations locales (modification) -> ${titreEtapeAdministrationsLocalesOld.join(', ')} | ${titreEtapeAdministrationsLocales.join(', ')}`
        )
        titresEtapesAdministrationsLocalesUpdated.push({
          titreEtapeId,
          administrations: titreEtapeAdministrationsLocales,
        })
      }
    }
  }

  return { titresEtapesAdministrationsLocalesUpdated }
}
