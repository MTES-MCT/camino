import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { DeepReadonly, computed, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { ApiClient } from '@/api/api-client'
import { FeatureCollectionPoints } from 'camino-common/src/perimetre'
import { Alert } from '../_ui/alert'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonPointsImport'>
  result: (param: FeatureCollectionPoints | Error) => void
  close: () => void
}

const defaultGeoSystemeId = GeoSystemes[4326].id
export const PointsImportPopup = caminoDefineComponent<Props>(['apiClient', 'close', 'result'], props => {
  const systemeGeographique = ref<TransformableGeoSystemeId>(defaultGeoSystemeId)

  const importFile = ref<File | null>(null)

  const fileChange = async (file: File) => {
    importFile.value = file
  }

  const itemChipLabel = (item: GeoSysteme): string => item?.nom
  const onSelectGeographicSystem = (item: DeepReadonly<GeoSysteme<TransformableGeoSystemeId>> | undefined) => {
    if (item !== undefined) {
      systemeGeographique.value = item.id
    } else {
      systemeGeographique.value = defaultGeoSystemeId
    }
  }

  const search = ref<string | null>(null)
  const geoSystemesToDisplay = computed<GeoSysteme<TransformableGeoSystemeId>[]>(() => {
    const value = search.value

    return transformableGeoSystemes.filter(({ id, nom }) => {
      return value !== null ? id.toLowerCase().includes(value) || nom.toLowerCase().includes(value) : true
    })
  })

  const searchReduceGeoSystem = (item: string) => {
    search.value = item.toLowerCase()
  }

  const overrideItem = GeoSystemes[systemeGeographique.value]

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
            <TypeAheadSingle
              overrideItem={overrideItem}
              props={{
                id: 'geographic-system',
                itemKey: 'id',
                itemChipLabel,
                items: geoSystemesToDisplay.value,
                minInputLength: 1,
                placeholder: '',
                onSelectItem: onSelectGeographicSystem,
                onInput: searchReduceGeoSystem,
              }}
            />
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
              const result = await props.apiClient.geojsonPointsImport({ tempDocumentName: tempFile }, systemeGeographique.value)
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
