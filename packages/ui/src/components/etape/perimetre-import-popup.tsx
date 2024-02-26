import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSystemes, TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { ref } from 'vue'
import { ApiClient } from '@/api/api-client'
import { GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { perimetreFileUploadTypeValidator } from 'camino-common/src/static/documentsTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { GeoSystemeTypeahead } from '../_common/geosysteme-typeahead'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport'>
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  result: (param: GeojsonInformations | Error) => void
  close: () => void
}

const defaultGeoSystemeId = GeoSystemes[4326].id
export const PerimetreImportPopup = caminoDefineComponent<Props>(['apiClient', 'close', 'result', 'titreTypeId', 'titreSlug'], props => {
  const systemeGeographique = ref<TransformableGeoSystemeId>(defaultGeoSystemeId)

  const importFile = ref<File | null>(null)

  const fileChange = async (file: File) => {
    importFile.value = file
  }

  const onSelectGeographicSystem = (geoSystemeId: TransformableGeoSystemeId | null) => {
    if (isNotNullNorUndefined(geoSystemeId)) {
      systemeGeographique.value = geoSystemeId
    } else {
      systemeGeographique.value = defaultGeoSystemeId
    }
  }

  const content = () => (
    <form>
      <Alert
        type="info"
        small={true}
        title={
          <>
            Vous ne devez déposer que des fichiers ayant un seul multipolygone. Pour plus d'informations sur la création d'un périmètre et son dépôt vous pouvez regardez ce{' '}
            <a class="fr-link" href="https://dai.ly/x8spe70" target="_blank" rel="noopener noreferrer" title="Vidéo tutoriel Dailymotion - lien externe">
              tutoriel
            </a>
            .
          </>
        }
      />
      <fieldset class="fr-fieldset fr-mt-2w" id="geographic">
        <div class="fr-fieldset__element">
          <div class="fr-select-group">
            <label class="fr-label" for="type">
              Système géographique
            </label>
            <GeoSystemeTypeahead geoSystemeSelected={onSelectGeographicSystem} disabled={false} />
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
            try {
              const result = await props.apiClient.geojsonImport(
                { tempDocumentName: tempFile, titreTypeId: props.titreTypeId, titreSlug: props.titreSlug, fileType: extension },
                systemeGeographique.value
              )
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
