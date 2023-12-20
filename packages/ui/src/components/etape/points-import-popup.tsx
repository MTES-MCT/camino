import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalPopup } from '../_ui/functional-popup'
import { InputFile } from '../_ui/dsfr-input-file'
import { GeoSysteme, GeoSystemeId, GeoSystemes, sortedGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { DeepReadonly, computed, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'

interface Props {
  // TODO 2023-10-23 utiliser l'api client et supprimer l'appel au store en interne
  pointsImport: (file: File, geoSystemeId: GeoSystemeId) => Promise<void>
  close: () => void
}

const defaultGeoSystemeId = GeoSystemes[4326].id
export const PointsImportPopup = caminoDefineComponent<Props>(['pointsImport', 'close'], props => {
  const systemeGeographique = ref<GeoSystemeId>(defaultGeoSystemeId)

  const importFile = ref<File | null>(null)

  const fileChange = async (file: File) => {
    importFile.value = file
  }

  const itemChipLabel = (item: GeoSysteme): string => item?.nom
  const onSelectGeographicSystem = (item: DeepReadonly<GeoSysteme> | undefined) => {
    if (item !== undefined) {
      systemeGeographique.value = item.id
    } else {
      systemeGeographique.value = defaultGeoSystemeId
    }
  }

  const search = ref<string | null>(null)
  const geoSystemesToDisplay = computed<GeoSysteme[]>(() => {
    const value = search.value

    return sortedGeoSystemes.filter(({ id, nom }) => {
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
            props.pointsImport(importFile.value, systemeGeographique.value)
          }
        },
        text: 'Importer',
      }}
      canValidate={importFile.value !== null}
    />
  )
})
