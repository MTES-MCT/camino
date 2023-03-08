import { numberFormat } from '@/utils/number-format'
import { DepartementId, Departements } from 'camino-common/src/static/departement'
import { getFacadesComputed, SecteursMaritimes, FacadeComputed } from 'camino-common/src/static/facades'
import { PaysId, PAYS_IDS } from 'camino-common/src/static/pays'
import { Regions } from 'camino-common/src/static/region'
import { SDOMZoneId, SDOMZones } from 'camino-common/src/static/sdom'
import { TagList } from '../_ui/tag-list'

export interface TerritoiresCommune {
  nom: string
  departementId: DepartementId
}
export interface TerritoiresForet {
  nom: string
}

export interface TerritoiresProps {
  surface?: number
  forets: TerritoiresForet[]
  sdomZones?: SDOMZoneId[]
  communes: TerritoiresCommune[]
  secteursMaritimes: SecteursMaritimes[]
}

type RegionsComputed = {
  id: string
  nom: string
  paysId: PaysId
  departements: { id: string; nom: string; communes: string[] }[]
}[]

function CommunesEtRegions(communes: TerritoiresCommune[]) {
  if (communes.length) {
    const regions: RegionsComputed = communes.reduce((acc, commune) => {
      const departement = Departements[commune.departementId]
      const region = Regions[departement.regionId]

      let regionToUpdate = acc.find(({ id }) => id === region.id)

      if (!regionToUpdate) {
        regionToUpdate = {
          id: region.id,
          paysId: region.paysId,
          nom: region.nom,
          departements: [],
        }
        acc.push(regionToUpdate)
      }

      let departementToUpdate = regionToUpdate.departements.find(({ id }) => id === departement.id)
      if (!departementToUpdate) {
        departementToUpdate = {
          id: departement.id,
          nom: departement.nom,
          communes: [],
        }
        regionToUpdate.departements.push(departementToUpdate)
      }

      departementToUpdate.communes.push(commune.nom)

      return acc
    }, [] as RegionsComputed)

    return (
      <>
        {regions.map(region => {
          return (
            <div key={region.id}>
              {region.departements.map(departement => {
                return (
                  <div key={departement.id}>
                    <h6 class="mb-s">{region.paysId === PAYS_IDS['République Française'] ? region.nom + ' / ' + departement.nom : region.nom}</h6>
                    <TagList elements={departement.communes} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </>
    )
  }
  return null
}

function Forets(forets: TerritoiresForet[]) {
  return forets.length ? (
    <div>
      <div>
        <h6 class="mb-s">Forêts</h6>
        <TagList elements={forets.map(f => f.nom)} />
      </div>
    </div>
  ) : null
}

function SdomZones(sdomZones?: SDOMZoneId[]) {
  return sdomZones && sdomZones?.length ? (
    <div>
      <div>
        <h6 class="mb-s">Zones du SDOM</h6>
        <TagList elements={sdomZones.map(id => SDOMZones[id].nom)} />
      </div>
    </div>
  ) : null
}

function SecteursMaritimesTsx(secteursMaritimes: SecteursMaritimes[]) {
  if (secteursMaritimes.length) {
    const facadesMaritime: FacadeComputed[] = getFacadesComputed(secteursMaritimes)
    return (
      <>
        {facadesMaritime.map(facade => {
          return (
            <div key={facade.facade}>
              <h6 class="mb-s">{facade.facade}</h6>
              <TagList elements={facade.secteurs} />
            </div>
          )
        })}
      </>
    )
  }
  return null
}

function Surface(surface?: number) {
  return surface ? (
    <div>
      <h5>Surface</h5>
      <p>{numberFormat(surface)} km² environ</p>
    </div>
  ) : null
}

function TerritoiresSansSurface(props: TerritoiresProps) {
  return props.communes.length || props.forets.length || props.sdomZones?.length || props.secteursMaritimes.length ? (
    <div class="tablet-blob-3-4">
      <h5>Territoires</h5>
      {CommunesEtRegions(props.communes)}
      {Forets(props.forets)}
      {SdomZones(props.sdomZones)}
      {SecteursMaritimesTsx(props.secteursMaritimes)}
    </div>
  ) : null
}

export function Territoires(props: TerritoiresProps) {
  return (
    <div class="tablet-blobs mb-xl">
      <div class="tablet-blob-1-4">{Surface(props.surface)}</div>
      {TerritoiresSansSurface(props)}
    </div>
  )
}
