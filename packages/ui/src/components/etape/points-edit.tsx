import { caminoDefineComponent } from "@/utils/vue-tsx-utils";
import GeoSystemeEdit from './points-geo-systemes-edit.vue'
import PointEdit from './points-point-edit.vue'
import PointsLotEdit from './points-lot-edit.vue'
import { HeritageEdit } from './heritage-edit'
import PointsImportPopup from './points-import-popup.vue'
import Points from '../_common/points.vue'
import InputNumber from '../_ui/input-number.vue'
import { Icon } from '@/components/_ui/icon'
import { HelpTooltip } from '@/components/_ui/help-tooltip'
import { computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { EtapeEdit, GroupeBuildPoint } from "@/utils/titre-etape-edit";

interface Props {
  etape: EtapeEdit
  events?: { saveKeyUp: boolean }
  showTitle?: boolean
}

export const PointsEdit = caminoDefineComponent<Props>(['showTitle', 'etape', 'events'], (props, context) => {
  const store = useStore()
  const events = props.events ?? {saveKeyUp: true}
  const showTitle = props.showTitle ?? true


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

  const complete = computed(() =>  {
    return props.etape.type.id !== 'mfr' || pointsTotal.value?.length > 3
  })

  const etapeGeoSystemeOpposableIdUpdate = () => {
    if (props.etape.geoSystemeIds.length < 2) {
      props.etape.geoSystemeOpposableId = ''
    } else if (props.etape.geoSystemeIds.length > 1 && (!props.etape.geoSystemeOpposableId || !props.etape.geoSystemeIds.includes(props.etape.geoSystemeOpposableId))) {
      props.etape.geoSystemeOpposableId = props.etape.geoSystemeIds[0]
    }
  }

  const clean = (groupes: GroupeBuildPoint[][][], groupeIndex: number, contourIndex: number) =>  {
    const contours = groupes[groupeIndex]
    const points = contours[contourIndex]

    if (!points.length && (groupes.length > 1 || contours.length > 1)) {
      contours.splice(contourIndex, 1)
      if (!contours.length && groupes.length > 1) {
        groupes.splice(groupeIndex, 1)
      }
    }
  }

  const referencesInit = (): GroupeBuildPoint['references'] => {
    return props.etape.geoSystemeIds.reduce<GroupeBuildPoint['references']>((references, geoSystemeId) => {
      references[geoSystemeId] = {}

      return references
    }, {})
  }

  const pointAdd = (groupeIndex: number, contourIndex: number) => {
    props.etape.groupes[groupeIndex][contourIndex].push({
      groupe: groupeIndex + 1,
      contour: contourIndex + 1,
      point: props.etape.groupes[groupeIndex][contourIndex].length,
      references: referencesInit(),
      subsidiaire: false,
    })
  }

  const pointRemove = (groupeIndex: number, contourIndex: number, pointIndex: number)  => {
    const groupes = props.etape.groupes
    const contours = groupes[groupeIndex]
    const points = contours[contourIndex]
    points.splice(pointIndex, 1)

    clean(groupes, groupeIndex, contourIndex)
  }

  const pointMoveDown = (groupeIndex: number, contourIndex: number, pointIndex: number) => {
    const groupes = props.etape.groupes
    const contours = groupes[groupeIndex]
    const points = contours[contourIndex]
    if (points.length > pointIndex + 1) {
      const point = points.splice(pointIndex, 1)[0]
      points.splice(pointIndex + 1, 0, point)
    } else if (contours.length > contourIndex + 1) {
      const point = points.splice(pointIndex, 1)[0]
      contours[contourIndex + 1].unshift(point)
      clean(groupes, groupeIndex, contourIndex)
    } else if (groupes.length > groupeIndex + 1) {
      const point = points.splice(pointIndex, 1)[0]
      groupes[groupeIndex + 1][0].unshift(point)
      clean(groupes, groupeIndex, contourIndex)
    }
  }

  const pointMoveUp = (groupeIndex: number, contourIndex: number, pointIndex: number) => {
    const groupes = props.etape.groupes
    const contours = groupes[groupeIndex]
    const points = contours[contourIndex]
    if (pointIndex > 0) {
      const point = points.splice(pointIndex, 1)[0]
      points.splice(pointIndex - 1, 0, point)
    } else if (contourIndex > 0) {
      const point = points.splice(pointIndex, 1)[0]
      contours[contourIndex - 1].push(point)
      clean(groupes, groupeIndex, contourIndex)
    } else if (groupeIndex > 0) {
      const point = points.splice(pointIndex, 1)[0]
      groupes[groupeIndex - 1][groupes[groupeIndex - 1].length - 1].push(point)
      clean(groupes, groupeIndex, contourIndex)
    }
  }

  const contourAdd = (groupeIndex: number) => {
    props.etape.groupes[groupeIndex].push([
      {
        groupe: groupeIndex + 1,
        contour: 1,
        point: 1,
        references: referencesInit(),
      },
    ])
  }

  const contourRemove = (groupeIndex: number, contourIndex: number) => {
    props.etape.groupes[groupeIndex].splice(contourIndex, 1)
  }

  const groupeAdd = () => {
    props.etape.groupes.push([
      [
        {
          groupe: props.etape.groupes.length,
          contour: 1,
          point: 1,
          references: referencesInit(),
        },
      ],
    ])
  }

  const groupeRemove = (groupeIndex: number) => {
    props.etape.groupes.splice(groupeIndex, 1)
  }

  const completeUpdate = () => {
    context.emit('complete-update', complete.value)
  }

  const pointsImport = () => {
    store.commit('popupOpen', {
      component: PointsImportPopup,
    })
  }

  const surfaceRefresh = () => {
    store.dispatch('titreEtapeEdition/surfaceRefresh', props.etape)
  }

  watch(complete, () => completeUpdate()) 
  watch(() => props.etape.geoSystemeIds, () => etapeGeoSystemeOpposableIdUpdate(), {deep: true} )
  

  watch(() => props.etape, (etape) => {
      if (!etape.groupes || !etape.groupes[0] || !etape.groupes[0][0] || !etape.groupes[0][0].length) {
        props.etape.incertitudes.points = false
      }

      if (!etape.surface) {
        props.etape.incertitudes.surface = false
      }
    },
    { deep: true}
  )
  onMounted(() => {
      completeUpdate()
    
  })
  return () => (<div>
    {showTitle ? (<h4 class="mb-s">Périmètre</h4>) : null}
    <HeritageEdit prop={props.etape.heritageProps.points} propId="points" write={() => (<>
    <button class="btn small rnd-xs py-s px-m full-x flex mb-s" onClick={pointsImport}>
          <span class="mt-xxs">Importer depuis un fichier…</span>
          <Icon name="plus" size="M" class="flex-right" />
        </button>

        <GeoSystemeEdit etape={props.etape} onUpdate:etape={(newValue: EtapeEdit) => context.emit('update:etape', newValue)} />

        {props.etape.geoSystemeIds.length ? (
          <div class="mb-s">
          <hr />
          <div class="h6">
            <ul class="list-prefix">
              <li><b>Point</b> : paire de coordoonnées</li>
              <li><b>Contour ou lacune</b> : ensemble de points</li>
              <li><b>Groupe</b> : ensemble de contours</li>
            </ul>
            <p>
              Le premier contour d'un groupe définit un périmètre.
              <br />Les contours suivants définissent des lacunes au sein de ce périmètre.
            </p>
          </div>

{props.etape.groupes.map((groupeContours, groupeIndex) => (<><div
            key={groupeIndex + 1}
            class={`geo-groupe mb-xs ${groupeContours.length && groupeContours[0].length ? 'geo-groupe-edit': ''}`}
          >
            {props.etape.groupes.length > 1 ? (<div class="flex flex-full">
              <h4 class="color-bg pt-s pl-m mb-s">Groupe { groupeIndex + 1 }</h4>
              <div class="flex-right hide">
                <button class="btn-border py-s px-m rnd-xs" onClick={() => groupeRemove(groupeIndex)}>
                  <Icon name="minus" size="M" />
                </button>
              </div>
            </div>) : null}
            
            {groupeContours.map((contourPoints, contourIndex) => (<div key={contourIndex + 1} class="geo-contour">
              {groupeContours.length > 1 ? (<div class="flex flex-full">
                <h4 class="pt-xs pl-s mb-s">
                  { contourIndex === 0 ? 'Contour' : `Lacune ${contourIndex}` }
                </h4>
                <div class="flex-right hide">
                  <button class="btn-border py-s px-m rnd-xs" onClick={() => contourRemove(groupeIndex, contourIndex)}>
                    <Icon name="minus" size="M" />
                  </button>
                </div>
              </div>) : null}
              
              {contourPoints.map((point, pointIndex) => (<div key={pointIndex + 1} class="geo-point">
                <div class="flex full-x">
                  <h4 class="mt-s">{point.lot ? 'Lot de points' : `Point ${ point.nom }`}</h4>
                  <div class="flex-right">
                    {!(props.etape.groupes.length === groupeIndex + 1 && groupeContours.length === contourIndex + 1 && contourPoints.length === pointIndex + 1) ? (<button
                      class="btn-border py-s px-m rnd-l-xs"
                      onClick={() => pointMoveDown(groupeIndex, contourIndex, pointIndex)}
                    >
                      <Icon size="M" name="move-down" />
                    </button> ) : null}
                    
                    {!(groupeIndex === 0 && contourIndex === 0 && pointIndex === 0) ? (<button
                      class={`btn-border py-s px-m ${props.etape.groupes.length === groupeIndex + 1 && groupeContours.length === contourIndex + 1 && contourPoints.length === pointIndex + 1 ? 'rnd-l-xs' : ''}`}
                      onClick={() => pointMoveUp(groupeIndex, contourIndex, pointIndex)}
                    >
                      <Icon size="M" name="move-up" />
                    </button>) : null}
                    
                    <button

                      class={`btn py-s px-m rnd-r-xs ${groupeIndex === 0 &&
                        contourIndex === 0 &&
                        pointIndex === 0 &&
                        props.etape.groupes.length === groupeIndex + 1 &&
                        groupeContours.length === contourIndex + 1 &&
                        contourPoints.length === pointIndex + 1 ? 'rnd-l-xs' : ''} `}
                      onClick={() => pointRemove(groupeIndex, contourIndex, pointIndex)}
                    >
                      <Icon name="minus" size="M" />
                    </button>
                  </div>
                </div>

              {point.lot ? (<PointsLotEdit v-model:point={contourPoints[pointIndex]} geoSystemeOpposableId={props.etape.geoSystemeOpposableId} geoSystemeIds={props.etape.geoSystemeIds} events={events} />) : (<PointEdit v-model:point={contourPoints[pointIndex]} geoSystemeOpposableId={props.etape.geoSystemeOpposableId} geoSystemeIds={props.etape.geoSystemeIds} />) }
              </div>))}
              

              <button class="btn-border rnd-s py-s px-m full-x mb-xs flex small" onClick={() => pointAdd(groupeIndex, contourIndex)}>
                <span class="mt-xxs">Ajouter un point</span>
                <Icon name="plus" size="M" class="flex-right" />
              </button>
            </div>))}
            
            {groupeContours.length && groupeContours[0].length ? ( <button class="btn rnd-s py-s px-m full-x mb-xs flex h6" onClick={() => contourAdd(groupeIndex)}>
              <span class="mt-xxs">Ajouter { groupeContours.length >= 1 ? 'une lacune' : 'un contour' }</span>
              <Icon name="plus" size="M" class="flex-right" />
            </button>) : null}
           
          </div>

{props.etape.groupes.length && props.etape.groupes[0].length && props.etape.groupes[0][0].length ? (<button class="btn rnd-s py-s px-m full-x mb-s flex h6" onClick={groupeAdd}>
<span class="mt-xxs">Ajouter un groupe</span>
<Icon name="plus" size="M" class="flex-right" />
</button>) : null}
          

          <div class="h6">
            {pointsTotal.value.length ? (   <label >
              <input v-model={props.etape.incertitudes.points} type="checkbox" />
              Incertain
            </label>) : null}
         
          </div></>))}
          
        </div>
        ) : null}
        </>)} read={() => <Points points={props.etape.heritageProps.points.etape?.points} />} />

    <hr />

    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s flex">
        <div>
          <h5 class="mb-0">Surface (Km²)</h5>
          <p class="h6 italic mb-0">Optionnel</p>
        </div>
        {!props.etape.heritageProps.surface.actif ? (<button class="flex-right btn-border pill p-s tooltip" onClick={surfaceRefresh}>
          <HelpTooltip icon="refresh" text="Recalculer automatiquement la surface à partir du périmètre" />
        </button>) : null}

      </div>
      <HeritageEdit prop={props.etape.heritageProps.surface} class="tablet-blob-2-3" propId="surface" write={() => <><InputNumber v-model={props.etape.surface} min="0" placeholder="0" class="mb-s" />
      {props.etape.surface ? (<div class="h6">
            <label>
              <input v-model={props.etape.incertitudes.surface} type="checkbox" class="mr-xs" />
              Incertain
            </label>
          </div>) : null}
          </>} read={() => <div class="border p-s mb-s bold">
            { props.etape.heritageProps.surface.etape?.surface }
          </div>} />
    </div>
  </div>)
})

