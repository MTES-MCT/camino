import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { HeritageEdit } from './heritage-edit'
import { PointsImportPopup } from './points-import-popup'
import { FunctionalComponent, computed, onMounted, ref, watch } from 'vue'
import { EtapeEdit } from '@/utils/titre-etape-edit'
import { DsfrButton } from '../_ui/dsfr-button'
import { ApiClient } from '@/api/api-client'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DsfrPerimetre } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId'>
  etape: { 
    typeId: EtapeTypeId, 
    heritageProps:{ perimetre: EtapeEdit['heritageProps']['perimetre']}
    geojson4326_perimetre: FeatureMultiPolygon | null,
    geojson4326_points: FeatureCollectionPoints | null,
    surface: number | null,
  }
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
}

type DisplayPerimetreProps = {
  apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>
  etape: { 
    geojson4326_perimetre: FeatureMultiPolygon | null,
    geojson4326_points: FeatureCollectionPoints | null,
  }
  titreSlug: TitreSlug
}

const DisplayPerimetre: FunctionalComponent<DisplayPerimetreProps> = (props) => {
  if (props.etape.geojson4326_perimetre !== null) {
    
    return <DsfrPerimetre calculateNeighbours={false} apiClient={props.apiClient} perimetre={{geojson4326_points: props.etape.geojson4326_points, geojson4326_perimetre: props.etape.geojson4326_perimetre}} titreSlug={props.titreSlug}   />
  }
  return null

}

// FIXMEs
// renommer l'héritage de point en héritage de périmètre
// supprimer l'héritage de surface (c'est le même héritage que périmètre)

export const PointsEdit = caminoDefineComponent<Props>(['etape', 'apiClient', 'titreTypeId', 'titreSlug'], (props, context) => {
  const importPopup = ref<boolean>(false)
  
  const complete = computed(() => {
    return props.etape.typeId !== 'mfr' || props.etape.geojson4326_perimetre !== null
  })


  const completeUpdate = () => {
    // FIXME pass props instead of emit
    context.emit('complete-update', complete.value)
  }

  watch(complete, () => completeUpdate())

  onMounted(() => {
    completeUpdate()
  })

  const openPopup = () => {
    importPopup.value = true
  }

  const closePopup = () => {
    importPopup.value = false
  }

  // const importPoints = async (file: File, geoSystemeId: GeoSystemeId) => {
  //   store.dispatch('titreEtapeEdition/pointsImport', {
  //     file,
  //     geoSystemeId,
  //   })
  // }

  const result = (value: GeojsonInformations | Error) => {

  }

  return () => (
    <div>
      <HeritageEdit
        prop={props.etape.heritageProps.perimetre}
        propId="perimetre"
        write={() => <>
        <DsfrButton onClick={openPopup} title="Importer depuis un fichier…" />
        
        <DisplayPerimetre apiClient={props.apiClient} etape={props.etape} titreSlug={props.titreSlug} />
        </>}
        read={(heritage) => <DisplayPerimetre apiClient={props.apiClient} etape={{...props.etape, geojson4326_perimetre:  heritage?.perimetre?.geojson4326_perimetre ?? null}} titreSlug={props.titreSlug} />}
      />

      FIXME AFFICHER LES POINTS
        <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s flex">
          <div>
            <h5 class="mb-0">Surface (Km²)</h5>
            <p class="h6 italic mb-0">Optionnel</p>
          </div>
        </div>
        {props.etape.surface}
      </div>
      {importPopup.value ? <PointsImportPopup close={closePopup} result={result} apiClient={props.apiClient} etapeTypeId={props.etape.typeId} titreTypeId={props.titreTypeId} /> : null}
    </div>
  )
})
