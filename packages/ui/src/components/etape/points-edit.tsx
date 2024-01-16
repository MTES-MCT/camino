import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { HeritageEdit } from './heritage-edit'
import { PointsImportPopup } from './points-import-popup'
import { InputNumber } from '../_ui/input-number'
import { Icon } from '@/components/_ui/icon'
import { HelpTooltip } from '@/components/_ui/help-tooltip'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { EtapeEdit } from '@/utils/titre-etape-edit'
import { Button } from '../_ui/button'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'

interface Props {
  etape: EtapeEdit
  events?: { saveKeyUp: boolean }
  showTitle?: boolean
}

export const PointsEdit = caminoDefineComponent<Props>(['showTitle', 'etape', 'events'], (props, context) => {
  const store = useStore()
  const showTitle = props.showTitle ?? true

  const importPopup = ref<boolean>(false)
  const pointsTotal = computed(() => {
    return props.etape.groupes.reduce((pointsTotal, contours) => {
      pointsTotal = pointsTotal.concat(
        contours.reduce((pointsTotal, points) => {
          pointsTotal = pointsTotal.concat(points)

          return pointsTotal
        }, [])
      )

      return pointsTotal
    }, [])
  })

  const complete = computed(() => {
    return props.etape.type.id !== 'mfr' || pointsTotal.value?.length > 3
  })

  const etapeGeoSystemeOpposableIdUpdate = () => {
    if (props.etape.geoSystemeIds.length < 2) {
      props.etape.geoSystemeOpposableId = ''
    } else if (props.etape.geoSystemeIds.length > 1 && (!props.etape.geoSystemeOpposableId || !props.etape.geoSystemeIds.includes(props.etape.geoSystemeOpposableId))) {
      props.etape.geoSystemeOpposableId = props.etape.geoSystemeIds[0]
    }
  }


  const completeUpdate = () => {
    context.emit('complete-update', complete.value)
  }

  const surfaceRefresh = () => {
    store.dispatch('titreEtapeEdition/surfaceRefresh', props.etape)
  }

  watch(complete, () => completeUpdate())
  watch(
    () => props.etape.geoSystemeIds,
    () => etapeGeoSystemeOpposableIdUpdate(),
    { deep: true }
  )

  onMounted(() => {
    completeUpdate()
  })

  const openPopup = () => {
    importPopup.value = true
  }

  const closePopup = () => {
    importPopup.value = false
  }

  const importPoints = async (file: File, geoSystemeId: GeoSystemeId) => {
    store.dispatch('titreEtapeEdition/pointsImport', {
      file,
      geoSystemeId,
    })
  }

  return () => (
    <div>
      {showTitle ? <h4 class="mb-s">Périmètre</h4> : null}
      <HeritageEdit
        prop={props.etape.heritageProps.points}
        propId="points"
        write={() => (
          <>
            <Button
              class="btn small rnd-xs py-s px-m full-x flex mb-s"
              onClick={openPopup}
              title="Importer depuis un fichier"
              render={() => (
                <>
                  <span class="mt-xxs">Importer depuis un fichier…</span>
                  <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
                </>
              )}
            />
          </>
        )}
        read={() => <Points points={props.etape.heritageProps.points.etape?.points ?? []} />}
      />

      <hr />

      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s flex">
          <div>
            <h5 class="mb-0">Surface (Km²)</h5>
            <p class="h6 italic mb-0">Optionnel</p>
          </div>
          {!props.etape.heritageProps.surface.actif ? (
            <button class="flex-right btn-border pill p-s tooltip" onClick={surfaceRefresh}>
              <HelpTooltip icon="refresh" text="Recalculer automatiquement la surface à partir du périmètre" />
            </button>
          ) : null}
        </div>
        <HeritageEdit
          prop={props.etape.heritageProps.surface}
          class="tablet-blob-2-3"
          propId="surface"
          write={() => (
            <InputNumber
              initialValue={props.etape.surface}
              placeholder="0"
              class="mb-s"
              numberChanged={value => {
                props.etape.surface = value ?? 0
              }}
            />
          )}
          read={() => <div class="border p-s mb-s bold">{props.etape.heritageProps.surface.etape?.surface}</div>}
        />
      </div>
      {importPopup.value ? <PointsImportPopup close={closePopup} pointsImport={importPoints} /> : null}
    </div>
  )
})
