import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { DeepReadonly, computed, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionPoints } from 'camino-common/src/perimetre'
import { Alert } from '../_ui/alert'
import { GeoSystemeTypeahead } from '../_common/geosysteme-typeahead'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonPointsImport'>
  geoSystemeId: TransformableGeoSystemeId
  result: (param: FeatureCollectionPoints | Error) => void
  close: () => void
}

export const PointsImportPopup = caminoDefineComponent<Props>(['apiClient', 'close', 'result', 'geoSystemeId'], props => {

  const importFile = ref<File | null>(null)

  const fileChange = async (file: File) => {
    importFile.value = file
  }

  const content = () => (
    <form>
      <Alert
        type="info"
        small={true}
        title='Vous pouvez déposer un fichier de points pour modifier ou supprimer les noms et descriptions des points. Votre fichier doit comporter un champ "nom" (nous vous conseillons de ne pas dépasser 3 caractères) et un champ "description".'
      />
      <fieldset class="fr-fieldset fr-mt-2w" id="geographic">
       <div class="fr-fieldset__element">
          <div class="fr-select-group">
            <label class="fr-label" for="type">
              Système géographique
            </label>
            <GeoSystemeTypeahead geoSystemeId={props.geoSystemeId} disabled={true} />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset" id="fichier">
        <div class="fr-fieldset__element">
          <InputFile accept={['geojson']} uploadFile={fileChange} />
        </div>
      </fieldset>
    </form>
  )

  return () => (
    <FunctionalPopup
      title="Modification des points"
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          if (importFile.value !== null) {
            const tempFile = await props.apiClient.uploadTempDocument(importFile.value)
            try {
              const result = await props.apiClient.geojsonPointsImport({ tempDocumentName: tempFile }, props.geoSystemeId)
              props.result(result)
            } catch (e: any) {
              props.result(new Error("Erreur lors de l'import"))
            }
          }
        },
        text: 'Importer',
      }}
      canValidate={importFile.value !== null}
    />
  )
})
