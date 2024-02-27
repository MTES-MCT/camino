import { defineComponent, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { capitalize } from 'camino-common/src/strings'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

// TODO 2024-02-26, attention, vue rajoute tous les champs qui sont dans GeoSystemeTypeahead.props et les met à undefined, donc le typage n'est pas tout à fait correct par rapport à la réalité :(
type Props =
  | {
      geoSystemeSelected: (geoSysteme: TransformableGeoSystemeId | null) => void
      disabled: false
    }
  | {
      disabled: true
      geoSystemeId: TransformableGeoSystemeId
    }

const display = (geosystem: GeoSysteme<TransformableGeoSystemeId>) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-pl-2w">
      <span class="fr-text--bold">
        {capitalize(geosystem.nom)} - ({geosystem.id})
      </span>
      <span class="fr-text">{capitalize(geosystem.zone)}</span>
    </div>
  )
}

export const GeoSystemeTypeahead = defineComponent<Props>(props => {
  const geoSystemSelected = ref<GeoSysteme<TransformableGeoSystemeId> | undefined>(GeoSystemes[4326])
  const geoSystemUpdate = async (geoSysteme: GeoSysteme<TransformableGeoSystemeId> | undefined) => {
    geoSystemSelected.value = geoSysteme
    if (!props.disabled) {
      props.geoSystemeSelected(isNotNullNorUndefined(geoSysteme) ? geoSysteme.id : null)
    }
  }

  const geoSystemeFiltered = ref<GeoSysteme<TransformableGeoSystemeId>[]>(transformableGeoSystemes)
  const geoSystemeOnInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      geoSystemeFiltered.value = transformableGeoSystemes
    } else {
      geoSystemeFiltered.value = transformableGeoSystemes.filter(
        ({ nom, id, zone }) =>
          id.toLowerCase().includes(formatedSearch) || nom.toLowerCase().includes(formatedSearch) || zone.toLowerCase().includes(formatedSearch) || id === geoSystemSelected.value?.id
      )
    }
  }
  const defaultGeoSysteme = props.disabled ? GeoSystemes[props.geoSystemeId] : GeoSystemes[4326]
  if (!props.disabled) {
    props.geoSystemeSelected(defaultGeoSysteme.id)
  }

  return () => (
    <TypeAheadSingle
      overrideItem={defaultGeoSysteme}
      props={{
        items: geoSystemeFiltered.value,
        itemChipLabel: item => `${item.nom} - (${item.id})`,
        itemKey: 'id',
        placeholder: '',
        minInputLength: 1,
        onSelectItem: geoSystemUpdate,
        onInput: geoSystemeOnInput,
        displayItemInList: display,
      }}
      disabled={props.disabled}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
GeoSystemeTypeahead.props = ['geoSystemeSelected', 'geoSystemeId', 'disabled']
