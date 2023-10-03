import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ref } from 'vue'
import { etapeGroupesBuild, Point } from '../../utils/titre-etape-edit'
import { Unites, UNITE_IDS } from 'camino-common/src/static/unites'
import { Tag } from '../_ui/tag'
import { PointReference } from './point-reference'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

interface Props {
  points: Point[]
}

const index = (points: Props['points']) => {
  return etapeGroupesBuild(points)
}

const groupes = (myIndex: ReturnType<typeof index>) => {
  return myIndex.groupes
}

const geoSystemes = (myIndex: ReturnType<typeof index>) => {
  return myIndex.geoSystemes
}

const geoSystemeOpposableId = (myIndex: ReturnType<typeof index>) => {
  return myIndex.geoSystemeOpposableId
}

const geoSysteme = (geoSystemeId: GeoSystemeId | undefined, myGeoSystemes: ReturnType<typeof geoSystemes>) => {
  return geoSystemeId && myGeoSystemes.filter(isNotNullNorUndefined).find(({ id }) => id === geoSystemeId)
}

const geoSystemeUniteNom = (myGeoSystem: ReturnType<typeof geoSysteme>) => {
  return myGeoSystem ? Unites[myGeoSystem.uniteId].nom : ''
}

const labels = (myGeoSystem: ReturnType<typeof geoSysteme>) => {
  return myGeoSystem?.uniteId === UNITE_IDS.mètre ? ['X', 'Y'] : ['Longitude', 'Latitude']
}
export const Points = caminoDefineComponent<Props>(['points'], props => {
  const myIndex = index(props.points)
  const myGeoSystemes = geoSystemes(myIndex)
  const opposableGeoSystemeId = geoSystemeOpposableId(myIndex) || (myGeoSystemes[0] && myGeoSystemes[0].id)
  const geoSystemeId = ref(geoSystemeOpposableId(myIndex) || (myGeoSystemes[0] && myGeoSystemes[0].id))
  const myGeoSysteme = geoSysteme(geoSystemeId.value, myGeoSystemes)
  const myLabels = labels(myGeoSysteme)
  const myGeoSystemeUniteNom = geoSystemeUniteNom(myGeoSysteme)
  const myGroupes = groupes(myIndex)

  return () => (
    <>
      {myGeoSysteme ? (
        <div>
          <div class="px">
            <div class="tablet-blobs flex-align-items-stretch">
              <div class="tablet-blob-1-2">
                {myGeoSystemes.length > 1 ? (
                  <select v-model={geoSystemeId.value} class="p-s mr-s mb-s">
                    {myGeoSystemes.filter(isNotNullNorUndefined).map(systeme => (
                      <option key={systeme.id} value={systeme.id}>
                        {systeme.nom} - {systeme.id}
                        {systeme.id === opposableGeoSystemeId ? ' (opposable)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div class="full-x p-s bg-alt mb-s">
                    {myGeoSysteme.nom} ({myGeoSysteme.id})
                  </div>
                )}
              </div>
              <div class="tablet-blob-1-2 flex flex-align-items-stretch">
                <div class="blobs-packed flex-grow flex-align-items-stretch mb-s">
                  <div class="blob-packed-1-2 full-y border-l pl-s pt-xs">
                    <h5 class="mb-0">{myLabels[0]}</h5>
                    <p class="h6 italic mb-0">{myGeoSystemeUniteNom}</p>
                  </div>
                  <div class="blob-packed-1-2 full-y border-l pl-s pt-xs">
                    <h5 class="mb-0">{myLabels[1]}</h5>
                    <p class="h6 italic mb-0">{myGeoSystemeUniteNom}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {myGroupes.map((groupeContours, groupeIndex) => (
            <div key={groupeIndex + 1} class="geo-groupe mb">
              {myGroupes.length > 1 ? <h4 class="color-bg pt-s pl-m mb-s">Groupe {groupeIndex + 1}</h4> : null}

              {groupeContours.map((contourPoints, contourIndex) => (
                <div key={contourIndex + 1} class="geo-contour">
                  {groupeContours.length > 1 ? <h4 class="pt-xs pl-s mb-s">{contourIndex === 0 ? 'Contour' : `Lacune ${contourIndex}`}</h4> : null}

                  {contourPoints.map(point => (
                    <div key={point.id} class="geo-point">
                      <div class="tablet-blobs">
                        <div class="tablet-blob-1-2 flex">
                          {point.nom ? <h4 class="mb-s flex-self-start mr-xs">{point.nom}</h4> : null}
                          {point.description || point.subsidiaire ? (
                            <p class="mb-s h6 flex-grow pt-xxs">
                              {point.subsidiaire && !point.lot ? <Tag mini text="Subsidiaire" color="bg-info" /> : null}
                              {point.lot ? <Tag mini color="bg-info" text=" Lot " /> : null}
                              {point.description}
                            </p>
                          ) : null}
                        </div>
                        {!point.lot && geoSystemeId.value ? (
                          <div class="tablet-blob-1-2">
                            <PointReference references={point.references[geoSystemeId.value]} />
                          </div>
                        ) : (
                          <div class="tablet-blob-1-2">
                            {Object.keys(point.references).map(reference => (
                              <div key={reference}>
                                <PointReference references={reference} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
})
