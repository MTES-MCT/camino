import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { DeepReadonly, computed, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { ApiClient } from '@/api/api-client'
import { GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { perimetreFileUploadTypeValidator } from 'camino-common/src/static/documentsTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport'>
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  result: (param: GeojsonInformations | Error) => void
  close: () => void
}

const defaultGeoSystemeId = GeoSystemes[4326].id
export const PointsImportPopup = caminoDefineComponent<Props>(['apiClient', 'close', 'result', 'titreTypeId', 'titreSlug'], props => {
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

  const overrideItems = [GeoSystemes[systemeGeographique.value]]

  const content = () => (
    <form>
      <fieldset class="fr-fieldset" id="geographic">
        <div class="fr-fieldset__element">
          <div class="fr-select-group">
            <label class="fr-label" for="type">
              Système géographique
            </label>
            <TypeAheadSingle
              overrideItems={overrideItems}
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
          <InputFile accept={['geojson', 'shp']} uploadFile={fileChange} />
        </div>
      </fieldset>
    </form>
  )

  return () => (
    <FunctionalPopup
      title="Import d'un périmètre"
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          if (importFile.value !== null) {
            const tempFile = await props.apiClient.uploadTempDocument(importFile.value)
            const values = importFile.value.name.split('.')
            const extension = perimetreFileUploadTypeValidator.parse(values[values.length - 1])
            const result = await props.apiClient.geojsonImport(
              { tempDocumentName: tempFile, titreTypeId: props.titreTypeId, titreSlug: props.titreSlug, fileType: extension },
              systemeGeographique.value
            )
            props.result(result)
          }
        },
        text: 'Importer',
      }}
      canValidate={importFile.value !== null}
    />
  )
})
