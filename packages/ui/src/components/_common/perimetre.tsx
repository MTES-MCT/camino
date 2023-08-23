import { Point } from '@/utils/titre-etape-edit'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { FunctionalComponent } from 'vue'
import { Icon } from '../_ui/icon'
import { Icon as IconSprite } from '../_ui/iconSpriteType'
import { CaminoCommonMap, Props as CaminoCommonMapProps } from './map'
import { Points } from './points'
import { TitreId } from 'camino-common/src/titres'
import { ButtonIcon } from '../_ui/button-icon'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { download } from './downloads'

export type TabId = 'carte' | 'points'
export interface Props {
  points?: Point[]
  geojsonMultiPolygon: CaminoCommonMapProps['geojson']
  titreTypeId: TitreTypeId
  titreId?: TitreId
  isMain?: boolean
  tabId?: TabId
  tabUpdate: (tabId: TabId) => void
  loading: boolean
}

const tabs: { id: TabId; nom: Capitalize<TabId>; icon: IconSprite }[] = [
  { id: 'carte', nom: 'Carte', icon: 'globe' },
  { id: 'points', nom: 'Points', icon: 'list' },
]

export const Perimetre: FunctionalComponent<Props> = (props: Props) => {
  const isMain = props.isMain ?? false
  const tabId = props.tabId ?? 'carte'
  const titreId = props.titreId ?? ''
  return (
    <div>
      <div class="tablet-blobs tablet-flex-direction-reverse dsfr" style={{ alignItems: 'center' }}>
        <div class="tablet-blob-1-2" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          {props.points?.length && titreId ? (
            <DsfrButtonIcon
              label="geojson"
              icon="fr-icon-file-download-line"
              buttonType="secondary"
              title="Télécharger le périmètre au format geojson"
              onClick={() =>
                download(
                  'geojson',
                  {},
                  {
                    downloadRoute: '/titres/:id',
                    params: { id: titreId },
                  }
                )
              }
            />
          ) : null}
        </div>

        <div class="tablet-blob-1-2 flex">
          {tabs.map(tab => {
            return (
              <div key={tab.id} class={`${tabId === tab.id ? 'active' : ''} mr-xs`}>
                {tabId !== tab.id ? (
                  <ButtonIcon class="p-m btn-tab rnd-t-s" onClick={() => props.tabUpdate(tab.id)} title={`Affiche le périmètre (${tab.nom})`} icon={tab.icon} />
                ) : (
                  <div class="p-m span-tab rnd-t-s">
                    <Icon name={tab.icon} size="M" aria-hidden="true" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div class={`${isMain ? 'width-full' : ''} line-neutral`} />

      {props.points && props.geojsonMultiPolygon && tabId === 'carte' ? (
        <CaminoCommonMap
          class={`${isMain ? 'width-full' : ''} dsfr`}
          geojson={props.geojsonMultiPolygon}
          titreId={props.titreId}
          points={props.points}
          titreTypeId={props.titreTypeId}
          isMain={props.isMain}
          loading={props.loading}
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
