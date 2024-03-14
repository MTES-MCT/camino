import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSystemeId, GeoSystemes } from 'camino-common/src/static/geoSystemes'
import { ref } from 'vue'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionForages } from 'camino-common/src/perimetre'
import { Alert } from '../_ui/alert'
import { GeoSystemeTypeahead } from '../_common/geosysteme-typeahead'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonForagesImport'>
  geoSystemeId: GeoSystemeId
  result: (value: { geojson4326: FeatureCollectionForages; origin: FeatureCollectionForages } | Error) => void
  close: () => void
}

export const ForagesImportPopup = caminoDefineComponent<Props>(['apiClient', 'close', 'result', 'geoSystemeId'], props => {
  const importFile = ref<File | null>(null)

  const fileChange = async (file: File) => {
    importFile.value = file
  }

  type FileType = 'geojson' | 'shp' | 'csv'
  const fileType = ref<FileType | null>(null)
  const fileTypeSelected = (value: FileType) => {
    fileType.value = value
  }

  const content = () => (
    <form>
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
      <DsfrInputRadio
        legend={{ main: 'Type de fichier' }}
        orientation="horizontal"
        valueChanged={fileTypeSelected}
        elements={[
          { legend: { main: 'csv' }, itemId: 'csv' },
          { legend: { main: 'geojson' }, itemId: 'geojson' },
          { legend: { main: 'shape' }, itemId: 'shp' },
        ]}
      />

      {isNotNullNorUndefined(fileType.value) ? (
        <>
          <Alert
            type="info"
            small={true}
            title={
              <>
                Vous pouvez déposer un fichier de forages pour modifier ou supprimer les propriétés des forages. Ils doivent avoir les champs suivants : "nom" (nous vous conseillons de ne pas dépasser
                3 caractères), "description", "type" (rejet ou captage), "profondeur" (en NGF)
                {fileType.value !== 'csv' ? '. ' : `, ${GeoSystemes[props.geoSystemeId].uniteId === 'deg' ? '"longitude", "latitude". ' : '"x", "y". '}`}
                Seul le champ description peut être vide.
              </>
            }
          />

          <fieldset class="fr-fieldset" id="fichier">
            <div class="fr-fieldset__element">
              <InputFile accept={[fileType.value]} uploadFile={fileChange} />
            </div>
          </fieldset>
        </>
      ) : null}
    </form>
  )

  return () => (
    <FunctionalPopup
      title="Modification des forages"
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          if (importFile.value !== null && fileType.value !== null) {
            const tempFile = await props.apiClient.uploadTempDocument(importFile.value)
            try {
              const result = await props.apiClient.geojsonForagesImport({ tempDocumentName: tempFile, fileType: fileType.value }, props.geoSystemeId)
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
