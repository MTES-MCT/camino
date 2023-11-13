import { IAdministration, ITitreEtape, ICommune } from '../../types.js'

import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { DepartementId, Departements, toDepartementId } from 'camino-common/src/static/departement.js'
import { getDepartementsBySecteurs, SecteursMaritimes } from 'camino-common/src/static/facades.js'
import { isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { AdministrationId, sortedAdministrations } from 'camino-common/src/static/administrations.js'
import { knex } from '../../knex.js'

interface ITitreEtapeAdministrationLocale {
  titreEtapeAdministrationsLocalesOld: AdministrationId[]
  titreEtapeAdministrationsLocales: AdministrationId[]
  titreEtapeId: string
}

// calcule tous les départements d'une étape
const titreEtapeAdministrationsDepartementsBuild = (communes: Pick<ICommune, 'id'>[] | undefined | null, secteursMaritimes: SecteursMaritimes[] | undefined | null): DepartementId[] => {
  if (!communes) {
    throw new Error('les communes ne sont pas chargées')
  }

  const departements = communes.map(({ id }) => toDepartementId(id))

  if (secteursMaritimes) {
    departements.push(...getDepartementsBySecteurs(secteursMaritimes))
  }

  return departements.filter(onlyUnique)
}

export const getTitreEtapeAdministrationsLocales = (communes: Pick<ICommune, 'id'>[] | undefined | null, secteursMaritimes: SecteursMaritimes[] | undefined | null): AdministrationId[] => {
  const titreDepartementsIds = titreEtapeAdministrationsDepartementsBuild(communes, secteursMaritimes)
  const titreRegionsIds = titreDepartementsIds.map(departementId => Departements[departementId].regionId).filter(onlyUnique)

  // calcule toutes les administrations qui couvrent ces départements et régions
  return sortedAdministrations.reduce((titreEtapeAdministrations: AdministrationId[], administration: IAdministration) => {
    // si le département ou la région de l'administration ne fait pas partie de ceux de l'étape
    const isAdministrationLocale =
      (administration.departementId && titreDepartementsIds.includes(administration.departementId)) || (administration.regionId && titreRegionsIds.includes(administration.regionId))
    // alors l'administration n'est pas rattachée à l'étape
    if (isNullOrUndefined(isAdministrationLocale) || !isAdministrationLocale) return titreEtapeAdministrations

    titreEtapeAdministrations.push(administration.id)

    return titreEtapeAdministrations
  }, [])
}

const titresEtapesAdministrationsLocalesBuild = (etapes: ITitreEtape[]): ITitreEtapeAdministrationLocale[] =>
  etapes.reduce<ITitreEtapeAdministrationLocale[]>((titresEtapesAdministrationsLocales, titreEtape) => {
    const titreEtapeAdministrationsLocales = getTitreEtapeAdministrationsLocales(titreEtape.communes, titreEtape.secteursMaritime)

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
