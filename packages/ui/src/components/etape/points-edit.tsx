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
import { Alert } from '../_ui/alert'
import { KM2 } from 'camino-common/src/number'

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId'>
  etape: {
    typeId: EtapeTypeId
    heritageProps: { perimetre: EtapeEdit['heritageProps']['perimetre'] }
    geojson4326Perimetre: FeatureMultiPolygon | null
    geojson4326Points: FeatureCollectionPoints | null
    surface: KM2 | null
  }
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  completeUpdate: (complete: boolean) => void
  onEtapeChange: (geojsonInformations: GeojsonInformations) => void
  initTab?: 'points' | 'carte'
}

type DisplayPerimetreProps = {
  apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>
  etape: {
    geojson4326Perimetre: FeatureMultiPolygon | null
    geojson4326Points: FeatureCollectionPoints | null
  }
  titreSlug: TitreSlug
  initTab?: 'points' | 'carte'
}

const DisplayPerimetre: FunctionalComponent<DisplayPerimetreProps> = props => {
  if (props.etape.geojson4326Perimetre !== null) {
    return (
      <DsfrPerimetre
        calculateNeighbours={false}
        apiClient={props.apiClient}
        perimetre={{ geojson4326_points: props.etape.geojson4326Points, geojson4326_perimetre: props.etape.geojson4326Perimetre }}
        titreSlug={props.titreSlug}
        initTab={props.initTab ?? 'carte'}
      />
    )
  }

  return null
}

export const PointsEdit = caminoDefineComponent<Props>(['etape', 'apiClient', 'titreTypeId', 'titreSlug', 'completeUpdate', 'onEtapeChange', 'initTab'], props => {
  const importPopup = ref<boolean>(false)
  const importError = ref<boolean>(false)

  const complete = computed(() => {
    return props.etape.typeId !== 'mfr' || props.etape.geojson4326Perimetre !== null
  })

  const completeUpdate = () => {
    props.completeUpdate(complete.value)
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


  const surface = ref<KM2 | null>(props.etape.surface)

  const result = (value: GeojsonInformations | Error) => {
    if ('geojson4326_perimetre' in value) {
      importError.value = false
      surface.value = value.surface
      props.onEtapeChange(value)
    } else {
      importError.value = true
    }
  }

  // FIXME rajouter du padding/margin
  // FIXME afficher erreur si import pas bon
  // FIXME jouer avec les heritage props et la propId
  return () => (
    <div>
      {JSON.stringify(props.etape.heritageProps.perimetre)}
      <HeritageEdit
        prop={props.etape.heritageProps.perimetre}
        
        propId="geojson4326Perimetre"
        write={() => (
          <>
            <DsfrButton onClick={openPopup} title="Importer depuis un fichier…" />
            {importError.value ? <Alert title="Une erreur est survenue lors de l’import de votre fichier." type="error" description="Vérifiez le contenu de votre fichier" /> : null}

            <DisplayPerimetre apiClient={props.apiClient} etape={props.etape} titreSlug={props.titreSlug} initTab={props.initTab} />
          </>
        )}
        read={heritage => (
          <DisplayPerimetre
            apiClient={props.apiClient}
            etape={{ ...props.etape, geojson4326Perimetre: heritage?.geojson4326Perimetre ?? null, geojson4326Points: heritage?.geojson4326Points ?? null }}
            titreSlug={props.titreSlug}
            initTab={props.initTab}
          />
        )}
      />
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s flex">
          <div>
            <h5 class="mb-0">Surface (Km²)</h5>
          </div>
        </div>
        {surface.value}
      </div>
      {importPopup.value ? <PointsImportPopup close={closePopup} result={result} apiClient={props.apiClient} titreTypeId={props.titreTypeId} titreSlug={props.titreSlug} /> : null}
    </div>
  )
})
