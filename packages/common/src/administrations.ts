import { Administration, AdministrationId, sortedAdministrations } from './static/administrations.js'
import { CommuneId } from './static/communes.js'
import { DepartementId, Departements, toDepartementId } from './static/departement.js'
import { SecteursMaritimes, getDepartementsBySecteurs } from './static/facades.js'
import { onlyUnique, isNullOrUndefined } from './typescript-tools.js'

// calcule tous les départements d'une étape
const titreEtapeAdministrationsDepartementsBuild = (communes: CommuneId[] | undefined | null, secteursMaritimes: SecteursMaritimes[] | undefined | null): DepartementId[] => {
  if (!communes) {
    throw new Error('les communes ne sont pas chargées')
  }

  const departements = communes.map(id => toDepartementId(id))

  if (secteursMaritimes) {
    departements.push(...getDepartementsBySecteurs(secteursMaritimes))
  }

  return departements.filter(onlyUnique)
}

export const getAdministrationsLocales = (communes: CommuneId[] | undefined | null, secteursMaritimes: SecteursMaritimes[] | undefined | null): AdministrationId[] => {
  const titreDepartementsIds = titreEtapeAdministrationsDepartementsBuild(communes, secteursMaritimes)
  const titreRegionsIds = titreDepartementsIds.map(departementId => Departements[departementId].regionId).filter(onlyUnique)

  // calcule toutes les administrations qui couvrent ces départements et régions
  return sortedAdministrations.reduce((titreEtapeAdministrations: AdministrationId[], administration: Administration) => {
    // si le département ou la région de l'administration ne fait pas partie de ceux de l'étape
    const isAdministrationLocale =
      (administration.departementId && titreDepartementsIds.includes(administration.departementId)) || (administration.regionId && titreRegionsIds.includes(administration.regionId))
    // alors l'administration n'est pas rattachée à l'étape
    if (isNullOrUndefined(isAdministrationLocale) || !isAdministrationLocale) return titreEtapeAdministrations

    titreEtapeAdministrations.push(administration.id)

    return titreEtapeAdministrations
  }, [])
}
