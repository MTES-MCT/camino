import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSystemes, GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { ref } from 'vue'
import { ApiClient } from '@/api/api-client'
import { GeojsonInformations } from 'camino-common/src/perimetre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { GeoSystemeTypeahead } from '../_common/geosysteme-typeahead'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'geojsonImport'>
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  result: (param: GeojsonInformations | Error) => void
  close: () => void
}

type FileType = 'geojson' | 'shp' | 'csv'

const defaultGeoSystemeId = GeoSystemes[4326].id
export const PerimetreImportPopup = caminoDefineComponent<Props>(['apiClient', 'close', 'result', 'titreTypeId', 'titreSlug'], props => {
  const systemeGeographique = ref<GeoSystemeId>(defaultGeoSystemeId)

  const importFile = ref<File | null>(null)

  const fileChange = async (file: File) => {
    importFile.value = file
  }

  const onSelectGeographicSystem = (geoSystemeId: GeoSystemeId | null) => {
    if (isNotNullNorUndefined(geoSystemeId)) {
      systemeGeographique.value = geoSystemeId
    } else {
      systemeGeographique.value = defaultGeoSystemeId
    }
  }

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
            <GeoSystemeTypeahead geoSystemeSelected={onSelectGeographicSystem} disabled={false} />
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
      {fileType.value === 'geojson' || fileType.value === 'shp' ? <Alert type="info" small={true} title={<>Vous ne devez déposer que des fichiers ayant un seul multipolygone.</>} /> : null}

      {fileType.value === 'csv' ? (
        <Alert
          type="info"
          small={true}
          title={
            <>
              Le dépôt csv n'est possible que pour des périmètres simples : un seul polygone sans lacune ayant moins de 20 sommets. Ils doivent avoir les 4 champs suivants : "nom", "description",{' '}
              {GeoSystemes[systemeGeographique.value].uniteId === 'deg' ? '"longitude", "latitude"' : '"x", "y"'}. Seul le champ description peut être vide.
            </>
          }
        />
      ) : null}

      {isNotNullNorUndefined(fileType.value) ? (
        <fieldset class="fr-fieldset" id="fichier">
          <div class="fr-fieldset__element">
            <InputFile accept={[fileType.value]} uploadFile={fileChange} />
          </div>
        </fieldset>
      ) : null}
    </form>
  )

  return () => (
    <FunctionalPopup
      title="Import d'un périmètre"
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          if (isNotNullNorUndefined(importFile.value) && isNotNullNorUndefined(fileType.value)) {
            const tempFile = await props.apiClient.uploadTempDocument(importFile.value)
            try {
              const result = await props.apiClient.geojsonImport(
                { tempDocumentName: tempFile, titreTypeId: props.titreTypeId, titreSlug: props.titreSlug, fileType: fileType.value },
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
