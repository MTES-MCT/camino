import { DepartementId, Departements, toDepartementId } from 'camino-common/src/static/departement'
import { getFacadesComputed, SecteursMaritimes, FacadeComputed } from 'camino-common/src/static/facades'
import { PaysId, PAYS_IDS } from 'camino-common/src/static/pays'
import { Regions } from 'camino-common/src/static/region'
import { SDOMZoneId, SDOMZones } from 'camino-common/src/static/sdom'
import { FunctionalComponent, onMounted, ref } from 'vue'
import { TagList } from '../_ui/tag-list'
import { Commune, CommuneId } from 'camino-common/src/static/communes'
import { numberFormat } from 'camino-common/src/number'
import { ForetId, Forets } from 'camino-common/src/static/forets'
import { LoadingElement } from '../_ui/functional-loader'
import { caminoDefineComponent } from '../../utils/vue-tsx-utils'
import { AsyncData } from '../../api/client-rest'
import { TitreApiClient } from './titre-api-client'

export interface TerritoiresCommune {
  id: CommuneId
}

export interface TerritoiresProps {
  apiClient: Pick<TitreApiClient, 'getTitreCommunes'>
  surface?: number
  forets: ForetId[]
  sdomZones?: SDOMZoneId[]
  titreId: string
  secteursMaritimes: SecteursMaritimes[]
}

type RegionsComputed = {
  id: string
  nom: string
  paysId: PaysId
  departements: { id: DepartementId; nom: string; communes: string[] }[]
}[]

function CommunesEtRegions({communes}: {communes: Commune[]}) {
  if (communes.length) {
    const regions: RegionsComputed = communes.reduce((acc, commune) => {
      const departement = Departements[toDepartementId(commune.id)]
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

function ForetsComp({forets}: {forets: ForetId[]}) {
  return forets.length ? (
    <div>
      <div>
        <h6 class="mb-s">Forêts</h6>
        <TagList elements={forets.map(id => Forets[id].nom)} />
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

const TerritoiresSansSurface = caminoDefineComponent<Omit<TerritoiresProps, 'surface'>>(['forets', 'sdomZones', 'secteursMaritimes', 'titreId', 'apiClient'], (props: TerritoiresProps) => {

  const communesAsyncData = ref<AsyncData<Commune[]>>({status: 'LOADING'})

  onMounted(async () => {
    try{
      communesAsyncData.value = {status: 'LOADING'}
      const communes = await props.apiClient.getTitreCommunes(props.titreId)

      communesAsyncData.value = {status: 'LOADED', value: communes}
    } catch (e: any) {
      console.error('error', e)
      communesAsyncData.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })

  return () =>
    <LoadingElement data={communesAsyncData.value} renderItem={(item) =><>
      {props.forets.length || props.sdomZones?.length || props.secteursMaritimes.length || item.length ? (
        <div class="tablet-blob-3-4">
      <h5>Territoires</h5>
      <CommunesEtRegions communes={item}/>
      <ForetsComp forets={props.forets} />
      {SdomZones(props.sdomZones)}
      {SecteursMaritimesTsx(props.secteursMaritimes)}
    </div>): null} </>}/>
})

export const Territoires: FunctionalComponent<TerritoiresProps> = (props: TerritoiresProps) => {
  return (
    <div class="tablet-blobs mb-xl">
      <div class="tablet-blob-1-4">{Surface(props.surface)}</div>
      <TerritoiresSansSurface {...props} />
    </div>
  )
}
