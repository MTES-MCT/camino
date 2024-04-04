import { HeritageEdit } from './heritage-edit'
import { PerimetreImportPopup } from './perimetre-import-popup'
import { DeepReadonly, FunctionalComponent, HTMLAttributes, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { DsfrButton } from '../_ui/dsfr-button'
import { ApiClient } from '@/api/api-client'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DsfrPerimetre } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Alert } from '../_ui/alert'
import { KM2 } from 'camino-common/src/number'
import { EtapePropsFromHeritagePropName, HeritageProp, FullEtapeHeritage } from 'camino-common/src/etape'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { PointsImportPopup } from './points-import-popup'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { ForagesImportPopup } from './forages-import-popup'
import { canHaveForages } from 'camino-common/src/permissions/titres'

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId' | 'geojsonPointsImport' | 'geojsonForagesImport'>
  etape: DeepReadonly<{
    typeId: EtapeTypeId
    heritageProps: {
      perimetre: HeritageProp<Pick<FullEtapeHeritage, 'typeId' | 'date' | EtapePropsFromHeritagePropName<'perimetre'>>>
    }
    geojson4326Perimetre: FeatureMultiPolygon | null | undefined
    geojson4326Points: FeatureCollectionPoints | null | undefined
    geojsonOriginePerimetre: FeatureMultiPolygon | null | undefined
    geojsonOriginePoints: FeatureCollectionPoints | null | undefined
    geojson4326Forages: FeatureCollectionForages | null | undefined
    geojsonOrigineForages: FeatureCollectionForages | null | undefined
    geojsonOrigineGeoSystemeId: GeoSystemeId | null | undefined
    surface: KM2 | null | undefined
  }>
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  completeUpdate: (complete: boolean) => void
  onEtapeChange: (geojsonInformations: GeojsonInformations) => void
  onPointsChange: (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => void
  onForagesChange: (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => void
  initTab?: 'points' | 'carte'
}

type DisplayPerimetreProps = {
  apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>
  etape: Props['etape']
  surface: KM2 | null
  titreSlug: TitreSlug
  titreTypeId: TitreTypeId
  initTab?: 'points' | 'carte'
  class?: HTMLAttributes['class']
}

const DisplayPerimetre: FunctionalComponent<DisplayPerimetreProps> = props => {
  if (isNotNullNorUndefined(props.etape.geojson4326Perimetre) && isNotNullNorUndefined(props.etape.geojsonOriginePerimetre) && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId)) {
    return (
      <div>
        <DsfrPerimetre
          calculateNeighbours={false}
          apiClient={props.apiClient}
          perimetre={{
            geojson4326_points: props.etape.geojson4326Points ?? null,
            geojson4326_perimetre: props.etape.geojson4326Perimetre,
            geojson_origine_perimetre: props.etape.geojsonOriginePerimetre,
            geojson_origine_points: props.etape.geojsonOriginePoints ?? null,
            geojson_origine_geo_systeme_id: props.etape.geojsonOrigineGeoSystemeId,
            geojson4326_forages: props.etape.geojson4326Forages ?? null,
            geojson_origine_forages: props.etape.geojsonOrigineForages ?? null,
          }}
          titreSlug={props.titreSlug}
          titreTypeId={props.titreTypeId}
          initTab={props.initTab ?? 'carte'}
        />

        {props.surface ? <div class="fr-text--md">Surface : {props.surface} Km²</div> : null}
      </div>
    )
  }

  return null
}

export const PerimetreEdit = defineComponent<Props>(props => {
  const importPerimetrePopup = ref<boolean>(false)
  const importPointsPopup = ref<boolean>(false)
  const importForagesPopup = ref<boolean>(false)
  const importError = ref<boolean>(false)


  const updateHeritage = () => {

  }
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

  const openPerimetrePopup = () => {
    importPerimetrePopup.value = true
  }

  const closePerimetrePopup = () => {
    importPerimetrePopup.value = false
  }
  const openPointsPopup = () => {
    importPointsPopup.value = true
  }

  const closePointsPopup = () => {
    importPointsPopup.value = false
  }

  const openForagesPopup = () => {
    importForagesPopup.value = true
  }
  const closeForagesPopup = () => {
    importForagesPopup.value = false
  }

  const surface = ref<KM2 | null>(props.etape.surface ?? null)

  const result = (value: GeojsonInformations | Error) => {
    if ('geojson4326_perimetre' in value) {
      importError.value = false
      surface.value = value.surface
      props.onEtapeChange(value)
    } else {
      importError.value = true
      console.error(value)
    }
  }

  const resultPoints = (value: { geojson4326: FeatureCollectionPoints; origin: FeatureCollectionPoints } | Error) => {
    if ('geojson4326' in value) {
      importError.value = false
      props.onPointsChange(value.geojson4326, value.origin)
    } else {
      importError.value = true
      console.error(value)
    }
  }

  const resultForages = (value: { geojson4326: FeatureCollectionForages; origin: FeatureCollectionForages } | Error) => {
    if ('geojson4326' in value) {
      importError.value = false
      props.onForagesChange(value.geojson4326, value.origin)
    } else {
      importError.value = true
      console.error(value)
    }
  }

  return () => (
    <div class="dsfr">
      <HeritageEdit
        prop={props.etape.heritageProps.perimetre}
        updateHeritage={updateHeritage}
        propId="perimetre"
        write={() => (
          <div>
            <DsfrButton onClick={openPerimetrePopup} title="Importer un périmètre" />
            {isNotNullNorUndefined(props.etape.geojson4326Perimetre) && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId) ? (
              <>
                <DsfrButton class="fr-ml-2w" onClick={openPointsPopup} buttonType="secondary" title="Éditer les points" />
                {canHaveForages(props.titreTypeId) ? <DsfrButton class="fr-ml-2w" onClick={openForagesPopup} buttonType="secondary" title="Éditer les forages" /> : null}
              </>
            ) : null}

            {importError.value ? <Alert class="fr-mt-2w" title="Une erreur est survenue lors de l’import de votre fichier." type="error" description="Vérifiez le contenu de votre fichier" /> : null}

            <DisplayPerimetre
              class="fr-mt-2w"
              apiClient={props.apiClient}
              etape={props.etape}
              titreSlug={props.titreSlug}
              initTab={props.initTab}
              surface={surface.value}
              titreTypeId={props.titreTypeId}
            />
          </div>
        )}
        read={heritage => (
          <DisplayPerimetre
            apiClient={props.apiClient}
            etape={{
              ...props.etape,
              geojson4326Perimetre: heritage?.geojson4326Perimetre ?? null,
              geojson4326Points: heritage?.geojson4326Points ?? null,
              geojsonOriginePerimetre: heritage?.geojsonOriginePerimetre ?? null,
              geojsonOriginePoints: heritage?.geojsonOriginePoints ?? null,
              geojsonOrigineGeoSystemeId: heritage?.geojsonOrigineGeoSystemeId ?? null,
              geojson4326Forages: heritage?.geojson4326Forages ?? null,
              geojsonOrigineForages: heritage?.geojsonOrigineForages ?? null,
            }}
            titreSlug={props.titreSlug}
            titreTypeId={props.titreTypeId}
            initTab={props.initTab}
            surface={heritage?.surface ?? null}
          />
        )}
      />

      {importPerimetrePopup.value ? <PerimetreImportPopup close={closePerimetrePopup} result={result} apiClient={props.apiClient} titreTypeId={props.titreTypeId} titreSlug={props.titreSlug} /> : null}

      {importPointsPopup.value && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId) ? (
        <PointsImportPopup close={closePointsPopup} result={resultPoints} geoSystemeId={props.etape.geojsonOrigineGeoSystemeId} apiClient={props.apiClient} />
      ) : null}

      {importForagesPopup.value && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId) ? (
        <ForagesImportPopup close={closeForagesPopup} result={resultForages} geoSystemeId={props.etape.geojsonOrigineGeoSystemeId} apiClient={props.apiClient} />
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PerimetreEdit.props = ['etape', 'apiClient', 'titreTypeId', 'titreSlug', 'completeUpdate', 'onEtapeChange', 'initTab', 'onPointsChange', 'onForagesChange']
