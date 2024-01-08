import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import GeoSystemeEdit from './points-geo-systemes-edit.vue'
import PointEdit from './points-point-edit.vue'
import PointsLotEdit from './points-lot-edit.vue'
import { HeritageEdit } from './heritage-edit'
import { PointsImportPopup } from './points-import-popup'
import { Points } from '../_common/points'
import { InputNumber } from '../_ui/input-number'
import { Icon } from '@/components/_ui/icon'
import { HelpTooltip } from '@/components/_ui/help-tooltip'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { EtapeEdit, GroupeBuildPoint } from '@/utils/titre-etape-edit'
import { ButtonIcon } from '../_ui/button-icon'
import { Button } from '../_ui/button'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'

interface Props {
  etape: EtapeEdit
  events?: { saveKeyUp: boolean }
  showTitle?: boolean
}

export const PointsEdit = caminoDefineComponent<Props>(['showTitle', 'etape', 'events'], (props, context) => {
  const store = useStore()
  const events = props.events ?? { saveKeyUp: true }
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

  const clean = (groupes: GroupeBuildPoint[][][], groupeIndex: number, contourIndex: number) => {
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

  const pointRemove = (groupeIndex: number, contourIndex: number, pointIndex: number) => {
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

            <GeoSystemeEdit etape={props.etape} onUpdate:etape={(newValue: EtapeEdit) => context.emit('update:etape', newValue)} />

            {props.etape.geoSystemeIds.length ? (
              <div class="mb-s">
                <hr />
                <div class="h6">
                  <ul class="list-prefix">
                    <li>
                      <b>Point</b> : paire de coordoonnées
                    </li>
                    <li>
                      <b>Contour ou lacune</b> : ensemble de points
                    </li>
                    <li>
                      <b>Groupe</b> : ensemble de contours
                    </li>
                  </ul>
                  <p>
                    Le premier contour d'un groupe définit un périmètre.
                    <br />
                    Les contours suivants définissent des lacunes au sein de ce périmètre.
                  </p>
                </div>

                {props.etape.groupes.map((groupeContours, groupeIndex) => (
                  <>
                    <div key={groupeIndex + 1} class={`geo-groupe mb-xs ${groupeContours.length && groupeContours[0].length ? 'geo-groupe-edit' : ''}`}>
                      {props.etape.groupes.length > 1 ? (
                        <div class="flex flex-full">
                          <h4 class="color-bg pt-s pl-m mb-s">Groupe {groupeIndex + 1}</h4>
                          <div class="flex-right hide">
                            <ButtonIcon class="btn-border py-s px-m rnd-xs" onClick={() => groupeRemove(groupeIndex)} icon="minus" title="Supprimer un groupe" />
                          </div>
                        </div>
                      ) : null}

                      {groupeContours.map((contourPoints, contourIndex) => (
                        <div key={contourIndex + 1} class="geo-contour">
                          {groupeContours.length > 1 ? (
                            <div class="flex flex-full">
                              <h4 class="pt-xs pl-s mb-s">{contourIndex === 0 ? 'Contour' : `Lacune ${contourIndex}`}</h4>
                              <div class="flex-right hide">
                                <ButtonIcon class="btn-border py-s px-m rnd-xs" onClick={() => contourRemove(groupeIndex, contourIndex)} icon="minus" title="Supprimer un contour" />
                              </div>
                            </div>
                          ) : null}

                          {contourPoints.map((point, pointIndex) => (
                            <div key={pointIndex + 1} class="geo-point">
                              <div class="flex full-x">
                                <h4 class="mt-s">{point.lot ? 'Lot de points' : `Point ${point.nom ?? ''}`}</h4>
                                <div class="flex-right">
                                  {!(props.etape.groupes.length === groupeIndex + 1 && groupeContours.length === contourIndex + 1 && contourPoints.length === pointIndex + 1) ? (
                                    <ButtonIcon
                                      class="btn-border py-s px-m rnd-l-xs"
                                      onClick={() => pointMoveDown(groupeIndex, contourIndex, pointIndex)}
                                      icon="move-down"
                                      title="Déplacer le point vers le bas"
                                    />
                                  ) : null}

                                  {!(groupeIndex === 0 && contourIndex === 0 && pointIndex === 0) ? (
                                    <ButtonIcon
                                      class={`btn-border py-s px-m ${
                                        props.etape.groupes.length === groupeIndex + 1 && groupeContours.length === contourIndex + 1 && contourPoints.length === pointIndex + 1 ? 'rnd-l-xs' : ''
                                      }`}
                                      onClick={() => pointMoveUp(groupeIndex, contourIndex, pointIndex)}
                                      icon="move-up"
                                      title="Déplacer le point vers le haut"
                                    />
                                  ) : null}

                                  <ButtonIcon
                                    class={`btn py-s px-m rnd-r-xs ${
                                      groupeIndex === 0 &&
                                      contourIndex === 0 &&
                                      pointIndex === 0 &&
                                      props.etape.groupes.length === groupeIndex + 1 &&
                                      groupeContours.length === contourIndex + 1 &&
                                      contourPoints.length === pointIndex + 1
                                        ? 'rnd-l-xs'
                                        : ''
                                    } `}
                                    onClick={() => pointRemove(groupeIndex, contourIndex, pointIndex)}
                                    icon="minus"
                                    title="Supprimer le point"
                                  />
                                </div>
                              </div>

                              {point.lot ? (
                                <PointsLotEdit
                                  v-model:point={contourPoints[pointIndex]}
                                  geoSystemeOpposableId={props.etape.geoSystemeOpposableId}
                                  geoSystemeIds={props.etape.geoSystemeIds}
                                  events={events}
                                />
                              ) : (
                                <PointEdit v-model:point={contourPoints[pointIndex]} geoSystemeOpposableId={props.etape.geoSystemeOpposableId} geoSystemeIds={props.etape.geoSystemeIds} />
                              )}
                            </div>
                          ))}

                          <Button
                            class="btn-border rnd-s py-s px-m full-x mb-xs flex small"
                            onClick={() => pointAdd(groupeIndex, contourIndex)}
                            title="Ajouter un point"
                            render={() => (
                              <>
                                <span class="mt-xxs">Ajouter un point</span>
                                <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
                              </>
                            )}
                          />
                        </div>
                      ))}

                      {groupeContours.length && groupeContours[0].length ? (
                        <Button
                          class="btn rnd-s py-s px-m full-x mb-xs flex h6"
                          onClick={() => contourAdd(groupeIndex)}
                          title={`Ajouter ${groupeContours.length >= 1 ? 'une lacune' : 'un contour'}`}
                          render={() => (
                            <>
                              <span class="mt-xxs">Ajouter {groupeContours.length >= 1 ? 'une lacune' : 'un contour'}</span>
                              <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
                            </>
                          )}
                        />
                      ) : null}
                    </div>

                    {props.etape.groupes.length && props.etape.groupes[0].length && props.etape.groupes[0][0].length ? (
                      <Button
                        class="btn rnd-s py-s px-m full-x mb-s flex h6"
                        onClick={groupeAdd}
                        title="Ajouter un groupe"
                        render={() => (
                          <>
                            <span class="mt-xxs">Ajouter un groupe</span>
                            <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
                          </>
                        )}
                      />
                    ) : null}
                  </>
                ))}
              </div>
            ) : null}
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
