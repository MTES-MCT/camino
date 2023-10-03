import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { Perimetre as CommonPerimetre, TabId } from '../_common/perimetre'
import { Tag } from '../_ui/tag'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { Etape } from 'camino-common/src/etape'
import { GeoJsonObject } from 'geojson'
import { ref } from 'vue'
import { numberFormat } from 'camino-common/src/number'

interface Props {
  titreTypeId: TitreTypeId
  incertitude?: boolean
  geojsonMultiPolygon: GeoJsonObject
  etape: Pick<Etape, 'points' | 'surface' | 'incertitudes'>
}

export const Perimetre = caminoDefineComponent<Props>(['titreTypeId', 'incertitude', 'etape', 'geojsonMultiPolygon'], props => {
  const incertitude: boolean = props.incertitude ?? false
  const tabId = ref<TabId>('points')

  return () => (
    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-4">
          <h5>
            Périmètre
            {incertitude ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
          </h5>
        </div>

        <div class="tablet-blob-3-4">
          <CommonPerimetre
            titreTypeId={props.titreTypeId}
            points={props.etape.points}
            geojsonMultiPolygon={props.geojsonMultiPolygon}
            tabId={tabId.value}
            loading={false}
            tabUpdate={newTabId => {
              tabId.value = newTabId
            }}
          />
        </div>
      </div>

      {props.etape.surface ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Surface
              {props.etape.incertitudes && props.etape.incertitudes.surface ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <p>{numberFormat(props.etape.surface)} km² environ</p>
          </div>
        </div>
      ) : null}
    </div>
  )
})
