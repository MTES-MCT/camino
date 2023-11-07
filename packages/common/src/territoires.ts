import { CommuneId } from './static/communes.js'
import { FacadeComputed, getDepartementsBySecteurs, getFacadesComputed, SecteursMaritimes } from './static/facades.js'
import { DepartementLabel, Departements, toDepartementId } from './static/departement.js'
import { RegionLabel, Regions } from './static/region.js'
import { onlyUnique } from './typescript-tools.js'

export const territoiresFind = (
  communesWithName: Record<CommuneId, string>,
  communes?: { id: CommuneId; surface?: number | null }[] | null | undefined,
  secteursMaritime?: SecteursMaritimes[] | null | undefined
): { communes: { nom: string; surface: null | number }[]; departements: DepartementLabel[]; regions: RegionLabel[]; facades: FacadeComputed[] } => {
  const result: {
    communes: { nom: string; surface: null | number }[]
    departements: DepartementLabel[]
    regions: RegionLabel[]
    facades: FacadeComputed[]
  } = { communes: [], departements: [], regions: [], facades: [] }

  getDepartementsBySecteurs(secteursMaritime ?? [])
    .filter(onlyUnique)
    .forEach(departementId => {
      const departement = Departements[departementId]
      if (!result.departements.includes(departement.nom)) {
        result.departements.push(departement.nom)

        const region = Regions[departement.regionId]
        if (!result.regions.includes(region.nom)) {
          result.regions.push(region.nom)
        }
      }
    })
  ;(communes ?? []).forEach(commune => {
    result.communes.push({ nom: communesWithName[commune.id] ?? '', surface: commune.surface !== null && commune.surface !== undefined ? Math.round(commune.surface / 100) / 10000 : null })

    const departement = Departements[toDepartementId(commune.id)]

    if (!result.departements.includes(departement.nom)) {
      result.departements.push(departement.nom)

      const region = Regions[departement.regionId]
      if (!result.regions.includes(region.nom)) {
        result.regions.push(region.nom)
      }
    }
  })

  result.facades = getFacadesComputed(secteursMaritime ?? [])

  result.regions.sort()
  result.communes.sort()
  result.departements.sort()
  result.facades.sort()

  return result
}
