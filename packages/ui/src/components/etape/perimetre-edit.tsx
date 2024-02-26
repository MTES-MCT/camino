import { HeritageEdit } from './heritage-edit'
import { PerimetreImportPopup } from './perimetre-import-popup'
import { FunctionalComponent, HTMLAttributes, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { DsfrButton } from '../_ui/dsfr-button'
import { ApiClient } from '@/api/api-client'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DsfrPerimetre } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Alert } from '../_ui/alert'
import { KM2 } from 'camino-common/src/number'
import { EtapeWithHeritage, EtapeFondamentale } from 'camino-common/src/etape'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { PointsImportPopup } from './points-import-popup'
import { TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId' | 'geojsonPointsImport'>
  etape: {
    typeId: EtapeTypeId
    heritageProps: { perimetre: EtapeWithHeritage<'perimetre', Pick<EtapeFondamentale, 'geojson4326Perimetre' | 'surface' | 'geojson4326Points' | 'typeId' | 'date' | 'geojsonOriginePerimetre' | 'geojsonOriginePoints' | 'geojsonOrigineGeoSystemeId'>>['heritageProps']['perimetre'] }
    geojson4326Perimetre: FeatureMultiPolygon | null
    geojson4326Points: FeatureCollectionPoints | null
    geojsonOriginePerimetre: FeatureMultiPolygon | null | undefined
    geojsonOriginePoints: FeatureCollectionPoints | null
    geojsonOrigineGeoSystemeId: TransformableGeoSystemeId | null
    surface: KM2 | null
  }
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  completeUpdate: (complete: boolean) => void
  onEtapeChange: (geojsonInformations: GeojsonInformations) => void
  onPointsChange: (geojson4326Points: FeatureCollectionPoints) => void
  initTab?: 'points' | 'carte'
}

type DisplayPerimetreProps = {
  apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>
  etape: {
    geojson4326Perimetre: FeatureMultiPolygon | null | undefined
    geojson4326Points: FeatureCollectionPoints | null
    geojsonOriginePerimetre: FeatureMultiPolygon | null | undefined
    geojsonOriginePoints: FeatureCollectionPoints | null
    geojsonOrigineGeoSystemeId: TransformableGeoSystemeId | null
  }
  surface: KM2 | null
  titreSlug: TitreSlug
  initTab?: 'points' | 'carte'
  class?: HTMLAttributes['class']
}

const DisplayPerimetre: FunctionalComponent<DisplayPerimetreProps> = props => {
  console.log('PLOP', isNotNullNorUndefined(props.etape.geojson4326Perimetre), isNotNullNorUndefined(props.etape.geojsonOriginePerimetre),isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId), )
  if (isNotNullNorUndefined(props.etape.geojson4326Perimetre) && isNotNullNorUndefined(props.etape.geojsonOriginePerimetre) && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId)) {
    return (
      <div>
        <DsfrPerimetre
          calculateNeighbours={false}
          apiClient={props.apiClient}
          perimetre={{ geojson4326_points: props.etape.geojson4326Points, geojson4326_perimetre: props.etape.geojson4326Perimetre, geojson_origine_perimetre: props.etape.geojsonOriginePerimetre, geojson_origine_points: props.etape.geojsonOriginePoints, geojson_origine_geo_systeme_id: props.etape.geojsonOrigineGeoSystemeId }}
          titreSlug={props.titreSlug}
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

  const surface = ref<KM2 | null>(props.etape.surface)

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


  console.log('zeze', props.etape)

  const resultPoints = (value: FeatureCollectionPoints | Error) => {
    if ('type' in value) {
      importError.value = false
      props.onPointsChange(value)
    } else {
      importError.value = true
      console.error(value)
    }
  }

  return () => (
    <div class="dsfr">
      <HeritageEdit
        prop={props.etape.heritageProps.perimetre}
        propId="perimetre"
        write={() => (
          <div>
            <DsfrButton onClick={openPerimetrePopup} title="Importer un périmètre…" />
            {isNotNullNorUndefined(props.etape.geojson4326Perimetre) && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId) ? <DsfrButton class="fr-ml-2w" onClick={openPointsPopup} buttonType="secondary" title="Éditer les points" /> : null}

            {importError.value ? <Alert class="fr-mt-2w" title="Une erreur est survenue lors de l’import de votre fichier." type="error" description="Vérifiez le contenu de votre fichier" /> : null}

            <DisplayPerimetre class="fr-mt-2w" apiClient={props.apiClient} etape={props.etape} titreSlug={props.titreSlug} initTab={props.initTab} surface={surface.value} />
          </div>
        )}
        read={heritage => (
          <DisplayPerimetre
            apiClient={props.apiClient}
            etape={{ ...props.etape, geojson4326Perimetre: heritage?.geojson4326Perimetre ?? null, geojson4326Points: heritage?.geojson4326Points ?? null, geojsonOriginePerimetre: heritage?.geojsonOriginePerimetre ?? null, geojsonOriginePoints: heritage?.geojsonOriginePoints ?? null, geojsonOrigineGeoSystemeId: heritage?.geojsonOrigineGeoSystemeId ?? null }}
            titreSlug={props.titreSlug}
            initTab={props.initTab}
            surface={heritage?.surface ?? null}
          />
        )}
      />

      {importPerimetrePopup.value ? <PerimetreImportPopup close={closePerimetrePopup} result={result} apiClient={props.apiClient} titreTypeId={props.titreTypeId} titreSlug={props.titreSlug} /> : null}

      {importPointsPopup.value && isNotNullNorUndefined(props.etape.geojsonOrigineGeoSystemeId) ? <PointsImportPopup close={closePointsPopup} result={resultPoints} geoSystemeId={props.etape.geojsonOrigineGeoSystemeId} apiClient={props.apiClient} /> : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PerimetreEdit.props = ['etape', 'apiClient', 'titreTypeId', 'titreSlug', 'completeUpdate', 'onEtapeChange', 'initTab', 'onPointsChange']
