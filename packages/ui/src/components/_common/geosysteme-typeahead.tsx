import { defineComponent, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { GeoSysteme, GeoSystemes, GeoSystemeId, sortedGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { capitalize } from 'camino-common/src/strings'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

// https://github.com/MTES-MCT/camino/issues/917
const mainGeoSystemeIds = ['4326', '2154', '5490', '2972', '2975', '4471', '4467'] as const satisfies readonly GeoSystemeId[]

// TODO 2024-02-26, attention, vue rajoute tous les champs qui sont dans GeoSystemeTypeahead.props et les met à undefined, donc le typage n'est pas tout à fait correct par rapport à la réalité :(
type Props = { alwaysOpen?: boolean } & (
  | {
      geoSystemeSelected: (geoSysteme: GeoSystemeId | null) => void
      disabled: false
    }
  | {
      disabled: true
      geoSystemeId: GeoSystemeId
    }
)

const display = (geosystem: GeoSysteme<GeoSystemeId>) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-pl-2w">
      <span class={[mainGeoSystemeIds.includes(geosystem.id) ? 'fr-text--bold' : null]}>
        {capitalize(geosystem.nom)} - ({geosystem.id})
      </span>
      <span class="fr-text">{capitalize(geosystem.zone)}</span>
    </div>
  )
}

const sortedByUs = [...sortedGeoSystemes].sort((a, b) => {
  const aImportant = mainGeoSystemeIds.includes(a.id)
  const bImportant = mainGeoSystemeIds.includes(b.id)
  if (aImportant !== bImportant) {
    return aImportant ? -1 : 1
  }

  return a.nom.localeCompare(b.nom)
})
export const GeoSystemeTypeahead = defineComponent<Props>(props => {
  const geoSystemSelected = ref<GeoSysteme<GeoSystemeId> | undefined>(GeoSystemes[4326])
  const geoSystemUpdate = async (geoSysteme: GeoSysteme<GeoSystemeId> | undefined) => {
    geoSystemSelected.value = geoSysteme
    if (!props.disabled) {
      props.geoSystemeSelected(isNotNullNorUndefined(geoSysteme) ? geoSysteme.id : null)
    }
  }

  const geoSystemeFiltered = ref<GeoSysteme<GeoSystemeId>[]>(sortedByUs)
  const geoSystemeOnInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      geoSystemeFiltered.value = sortedByUs
    } else {
      geoSystemeFiltered.value = sortedByUs.filter(
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
        alwaysOpen: props.alwaysOpen,
        onSelectItem: geoSystemUpdate,
        onInput: geoSystemeOnInput,
        displayItemInList: display,
      }}
      disabled={props.disabled}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
GeoSystemeTypeahead.props = ['geoSystemeSelected', 'geoSystemeId', 'disabled', 'alwaysOpen']
