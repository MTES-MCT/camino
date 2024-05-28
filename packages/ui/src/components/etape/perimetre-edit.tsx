import { HeritageEdit } from './heritage-edit'
import { PerimetreImportPopup } from './perimetre-import-popup'
import { DeepReadonly, FunctionalComponent, HTMLAttributes, defineComponent, ref } from 'vue'
import { DsfrButton } from '../_ui/dsfr-button'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionForages, FeatureCollectionPoints, GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DsfrPerimetre } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Alert } from '../_ui/alert'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { PointsImportPopup } from './points-import-popup'
import { ForagesImportPopup } from './forages-import-popup'
import { canHaveForages } from 'camino-common/src/permissions/titres'
import { CoreEtapeCreationOrModification } from './etape-api-client'

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport' | 'getGeojsonByGeoSystemeId' | 'geojsonPointsImport' | 'geojsonForagesImport'>
  etape: DeepReadonly<Pick<CoreEtapeCreationOrModification, 'perimetre'>>
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  onEtapeChange: (geojsonInformations: GeojsonInformations) => void
  onHeritageChange: (heritage: Props['etape']['perimetre']) => void
  onPointsChange: (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => void
  onForagesChange: (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => void
  initTab?: 'points' | 'carte'
}

type DisplayPerimetreProps = {
  apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>
  perimetre: Props['etape']['perimetre'] | null
  titreSlug: TitreSlug
  titreTypeId: TitreTypeId
  initTab?: 'points' | 'carte'
  class?: HTMLAttributes['class']
}

const DisplayPerimetre: FunctionalComponent<DisplayPerimetreProps> = props => {
  if (
    isNotNullNorUndefined(props.perimetre?.value?.geojson4326Perimetre) &&
    isNotNullNorUndefined(props.perimetre.value.geojsonOriginePerimetre) &&
    isNotNullNorUndefined(props.perimetre.value.geojsonOrigineGeoSystemeId)
  ) {
    return (
      <div>
        <DsfrPerimetre
          calculateNeighbours={false}
          apiClient={props.apiClient}
          perimetre={{
            geojson4326_points: props.perimetre?.value?.geojson4326Points ?? null,
            geojson4326_perimetre: props.perimetre.value.geojson4326Perimetre,
            geojson_origine_perimetre: props.perimetre.value.geojsonOriginePerimetre,
            geojson_origine_points: props.perimetre?.value?.geojsonOriginePoints ?? null,
            geojson_origine_geo_systeme_id: props.perimetre.value.geojsonOrigineGeoSystemeId,
            geojson4326_forages: props.perimetre?.value?.geojson4326Forages ?? null,
            geojson_origine_forages: props.perimetre?.value?.geojsonOrigineForages ?? null,
            surface: props.perimetre.value.surface ?? null,
          }}
          titreSlug={props.titreSlug}
          titreTypeId={props.titreTypeId}
          initTab={props.initTab ?? 'carte'}
        />
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

  const updateHeritage = (heritage: Props['etape']['perimetre']) => {
    props.onHeritageChange(heritage)
  }

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

  const result = (value: GeojsonInformations | Error) => {
    if ('geojson4326_perimetre' in value) {
      importError.value = false
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

  // const mutableEtape = ref(flattenEtapeValidator.parse({...props.etape}))
  // FIXME
  return () => (
    <div>
      <HeritageEdit
        prop={props.etape.perimetre}
        updateHeritage={updateHeritage}
        label={null}
        write={() => (
          <div>
            <DsfrButton onClick={openPerimetrePopup} title="Importer un périmètre" />
            {isNotNullNorUndefined(props.etape.perimetre.value?.geojson4326Perimetre) && isNotNullNorUndefined(props.etape.perimetre.value?.geojsonOrigineGeoSystemeId) ? (
              <>
                <DsfrButton class="fr-ml-2w" onClick={openPointsPopup} buttonType="secondary" title="Éditer les points" />
                {canHaveForages(props.titreTypeId) ? <DsfrButton class="fr-ml-2w" onClick={openForagesPopup} buttonType="secondary" title="Éditer les forages" /> : null}
              </>
            ) : null}

            {importError.value ? <Alert class="fr-mt-2w" title="Une erreur est survenue lors de l’import de votre fichier." type="error" description="Vérifiez le contenu de votre fichier" /> : null}

            <DisplayPerimetre class="fr-mt-2w" apiClient={props.apiClient} perimetre={props.etape.perimetre} titreSlug={props.titreSlug} initTab={props.initTab} titreTypeId={props.titreTypeId} />
          </div>
        )}
        read={heritage => (
          <DisplayPerimetre
            apiClient={props.apiClient}
            perimetre={isNotNullNorUndefined(heritage) ? { ...props.etape.perimetre, value: heritage.value } : null}
            titreSlug={props.titreSlug}
            titreTypeId={props.titreTypeId}
            initTab={props.initTab}
          />
        )}
      />

      {importPerimetrePopup.value ? <PerimetreImportPopup close={closePerimetrePopup} result={result} apiClient={props.apiClient} titreTypeId={props.titreTypeId} titreSlug={props.titreSlug} /> : null}

      {importPointsPopup.value && isNotNullNorUndefined(props.etape.perimetre.value?.geojsonOrigineGeoSystemeId) ? (
        <PointsImportPopup close={closePointsPopup} result={resultPoints} geoSystemeId={props.etape.perimetre.value.geojsonOrigineGeoSystemeId} apiClient={props.apiClient} />
      ) : null}

      {importForagesPopup.value && isNotNullNorUndefined(props.etape.perimetre.value?.geojsonOrigineGeoSystemeId) ? (
        <ForagesImportPopup close={closeForagesPopup} result={resultForages} geoSystemeId={props.etape.perimetre.value.geojsonOrigineGeoSystemeId} apiClient={props.apiClient} />
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PerimetreEdit.props = ['etape', 'apiClient', 'titreTypeId', 'titreSlug', 'onEtapeChange', 'initTab', 'onPointsChange', 'onForagesChange', 'onHeritageChange']
