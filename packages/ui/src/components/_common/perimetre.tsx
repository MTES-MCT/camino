import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { FunctionalComponent } from 'vue'
import { Icon } from '../_ui/icon'
import { Icon as IconSprite } from '../_ui/iconSpriteType'
import { Download } from './download'
import CaminoMap from './map.vue'
import Points from './points.vue'

export type TabId = 'carte' | 'points'
export interface Props {
  points?: unknown[]
  geojsonMultiPolygon: object
  titreTypeId: TitreTypeId
  titreId?: string
  isMain?: boolean
  tabId?: TabId
  tabUpdate: (tabId: TabId) => void
}

const tabs: { id: TabId; nom: Capitalize<TabId>; icon: IconSprite }[] = [
  { id: 'carte', nom: 'Carte', icon: 'globe' },
  { id: 'points', nom: 'Points', icon: 'list' }
]
export const Perimetre: FunctionalComponent<Props> = (props: Props) => {
  const isMain = props.isMain ?? false
  const tabId = props.tabId ?? 'carte'
  const titreId = props.titreId ?? ''
  return (
    <div>
      <div class="tablet-blobs tablet-flex-direction-reverse">
        <div class="tablet-blob-1-2 flex">
          {props.points?.length && titreId ? (
            <Download
              section={`titres/${titreId}`}
              format="geojson"
              class="btn-border small pill pl pr-m py-s flex-right"
              onClicked={() => {}}
              query={{}}
            >
              geojson
            </Download>
          ) : null}
        </div>

        <div class="tablet-blob-1-2 flex">
          {tabs.map(tab => {
            return (
              <div
                key={tab.id}
                class={`${tabId === tab.id ? 'active' : ''} mr-xs`}
              >
                {tabId !== tab.id ? (
                  <button
                    class="p-m btn-tab rnd-t-s"
                    onClick={() => props.tabUpdate(tab.id)}
                  >
                    <Icon name={tab.icon} size="M" />
                  </button>
                ) : (
                  <div class="p-m span-tab rnd-t-s">
                    <Icon name={tab.icon} size="M" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div class={`${isMain ? 'width-full' : ''} line-neutral`} />

      {props.points && props.geojsonMultiPolygon && tabId === 'carte' ? (
        <CaminoMap
          class={`${isMain ? 'width-full' : ''}`}
          geojson={props.geojsonMultiPolygon}
          points={props.points}
          titreTypeId={props.titreTypeId}
          isMain={props.isMain}
        />
      ) : null}

      {props.points && tabId === 'points' ? (
        <div class={`${isMain ? 'width-full' : ''} points bg-alt`}>
          <div class={`${isMain ? 'container' : ''} bg-bg py`}>
            <Points points={props.points} />
          </div>
        </div>
      ) : null}

      <div class={`${isMain ? 'width-full' : ''} line mb`} />
    </div>
  )
}
