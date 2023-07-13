import { HTMLAttributes, computed, defineComponent, onBeforeUnmount, onMounted } from "vue"
import Accordion from './accordion.vue'
import { FiltersInput } from './filters-input'
import { FiltersCheckboxes } from './filters-checkboxes'
import { FiltersSelects } from './filters-selects'
import { InputAutocomplete } from './filters-input-autocomplete'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { FiltresEtapes } from "../demarches/filtres-etapes"
import { CommonFilter, FilterAutocomplete, FilterCheckbox, FilterEtape, FilterEtapeValue, FilterInput, FilterSelect, FiltersDeclaration } from "./all-filters"
import { EtapesStatuts } from "camino-common/src/static/etapesStatuts"
import { EtapeTypeId, EtapesTypes } from "camino-common/src/static/etapesTypes"

type FormatedLabel<FiltreId> = {id: FiltreId
  name: string,
  value: string | string[]
  valueName?: string | string[]}

type Props<FiltreId extends string, SelectElement extends {id: SelectElementId}, SelectElementId extends string, AutocompleteElementId extends string> = {
    filters: FiltersDeclaration<FiltreId, SelectElement, SelectElementId, AutocompleteElementId>[],
    subtitle?: string,
    opened?: boolean,
    validate: () => void
    toggle: () => void
} & Pick<HTMLAttributes, 'class'>

const etapesLabelFormat = <FiltreId extends string, >(f: {id: FiltreId, name: string, value: FilterEtapeValue[]}): {id: FiltreId, name: string, value: FilterEtapeValue, valueName: string}[] =>
  f.value
    .filter(value => value.typeId)
    .map(value => {
      let message = `type: ${EtapesTypes[value.typeId as EtapeTypeId].nom}`
      if (value.statutId) {
        message+=`, statut: ${EtapesStatuts[value.statutId].nom}`
      }
      if (value.dateDebut) {
        message+=`, après le ${value.dateDebut}` 
      }
      if (value.dateFin) {
        message+=`, avant le ${value.dateFin}` 
      }
      return {
      id: f.id,
      name: f.name,
      value,
      valueName: message,
    }})



export const Filters = defineComponent(<FiltreId extends string, SelectElement extends {id: SelectElementId}, SelectElementId extends string, AutocompleteElementId extends string>(props: Props<FiltreId, SelectElement, SelectElementId, AutocompleteElementId>) => {

  

  const keyup = (e: KeyboardEvent) => {
          if ((e.which || e.keyCode) === 13 && (props.opened ?? false)) {
            props.validate()
          }
        }


        onMounted(() => {
          document.addEventListener('keyup', keyup)
        })
        onBeforeUnmount(() => {
          document.removeEventListener('keyup', keyup)
        })

    
        const inputsErase = () => {
          inputs.value.forEach(filter => {
            if (Array.isArray(filter.value)) {
              filter.value.splice(0, filter.value.length)
            } else {
              filter.value = ''
            }
          })
        }
    
        const labelRemove = (label: FormatedLabel<FiltreId>) => {
          if (!(props.opened ?? false)) {
            const filter = props.filters.find(({ id }) => id === label.id)
            if (filter) {
            if (Array.isArray(filter.value)) {
              if (filter.type === 'checkboxes' || filter.type === 'select' || filter.type === 'etape' || filter.type === 'autocomplete') {
                const index = filter.value.indexOf(label.value)
                if (index > -1) {
                  filter.value.splice(index, 1)
                }
              }
            } else {
              filter.value = ''
            }
          }
    
            props.validate()
          }
        }
    
        const labelsReset = () => {
          props.filters.forEach(filter => {
            if (Array.isArray(filter.value)) {
              filter.value = []
            } else {
              filter.value = ''
            }
          })
    
          if (!(props.opened ?? false)) {
            props.validate()
          }
        }




        const inputs = computed<(CommonFilter<FiltreId> & (FilterInput))[]>(() => {
          return props.filters.filter((filter): filter is CommonFilter<FiltreId> & FilterInput => filter.type === 'input' )
        })
        const autocompletes = computed<(CommonFilter<FiltreId> & FilterAutocomplete<AutocompleteElementId>)[]>(() => {
          return props.filters.filter((filter): filter is CommonFilter<FiltreId> & FilterAutocomplete<AutocompleteElementId> => filter.type === 'autocomplete')
        })
    
        const checkboxes = computed<(CommonFilter<FiltreId> & FilterCheckbox)[]>(() => {
          return props.filters.filter(( filter ): filter is CommonFilter<FiltreId> & FilterCheckbox => filter.type === 'checkboxes')
        })
    
        const selects = computed<(CommonFilter<FiltreId> & FilterSelect<SelectElement, SelectElementId>)[]>(() => {
          return props.filters.filter((filter): filter is CommonFilter<FiltreId> & FilterSelect<SelectElement, SelectElementId> => filter.type === 'select')
        })
    
        const etapes = computed<(CommonFilter<FiltreId> & FilterEtape)[]>(() => {
          return props.filters.filter((filter): filter is CommonFilter<FiltreId> & FilterEtape => filter.type === 'etape')
        })
    
        const labels = computed<FormatedLabel<FiltreId>[]>(() => {
          return props.filters.flatMap<FormatedLabel<FiltreId>>(filter => {
            if ((filter.type === 'checkboxes' || filter.type === 'select' || filter.type === 'autocomplete') && filter.value?.length) {
              return filter.value.map(v => {
                // TODO 2023-07-13 trouver comment mieux typer ça sans le 'as'
                const elements = filter.elements as {id: string, nom: string}[]
                const element = elements?.find(e => e.id === v)
    
                return {
                  id: filter.id,
                  name: filter.name,
                  value: v,
                  valueName: element && element.nom,
                }
              })
            } else if (filter.type === 'input' && filter.value) {
              return [{ id: filter.id, name: filter.name, value: filter.value }]
            } else if (filter.type === 'etape' && filter.value && filter.value.length) {
              return etapesLabelFormat(filter)
            }    
            return []
          })
        })

  return () => (<Accordion ref="accordion" opened={props.opened ?? false} slotSub={!!labels.value.length} slotDefault={true} class="mb-s" onToggle={props.toggle}>
        {{
        title: () => (
          <div style="display: flex; align-items: center">
            <div>Filtres</div>
            { props.subtitle ? <div class="pl-s small">{ props.subtitle }</div> : null }
          </div>
        ),
        sub: () => (<>{labels.value.length ? <div class={["flex", (props.opened ?? false) ? 'border-b-s' : null]}>
        <div class="px-m pt-m pb-s">
          {labels.value.map(label => <span
            key={`${label.id}-${label.valueName}`}
            class={['rnd-m', 'box', 'btn-flash', 'h6', 'pl-s', 'pr-xs', 'py-xs','bold', 'mr-xs', 'mb-xs', (props.opened ?? false) ? 'pr-s' : 'pr-xs']}
            onClick={() => labelRemove(label)}
            >{ label.name } : { label.valueName || label.value } {!(props.opened ?? false) ? <span class="inline-block align-y-top ml-xs"> <Icon size="S" name="x" color="white" role='img' aria-label={`Supprimer le filtre ${label.name}`} /> </span> : null }</span>)}
        </div>
        <ButtonIcon class="flex-right btn-alt p-m" onClick={labelsReset} icon="close" title="Réinitialiser les filtres" />
      </div>: null}</>),
      default: () => (
      <div class="px-m">
        <div class="tablet-blobs mt">
          {inputs.value.length || autocompletes.value.length ? <div class="tablet-blob-1-2 large-blob-1-3">
            {inputs.value.map(input => <div key={input.id}><FiltersInput filter={input} /></div>)}
            {autocompletes.value.map(input => <div key={input.id}><InputAutocomplete filter={input} /></div>)}
            <button class="btn-border small px-s p-xs rnd-xs mb" onClick={inputsErase}>Tout effacer</button>
          </div> : null}
          

          {checkboxes.value.map(filter => <FiltersCheckboxes key={filter.id} filter={filter} class="tablet-blob-1-2 large-blob-1-3" />)}
          {selects.value.map(filter => <FiltersSelects key={filter.id} filter={filter} class="tablet-blob-1-2 large-blob-1-3" />)}
          {etapes.value.map(filter => <FiltresEtapes key={filter.id} filter={filter} class="tablet-blob-1-2 large-blob-1-3" />)}
        </div>

        <button ref="button" class="btn-flash p-s rnd-xs full-x mb" onClick={props.validate}>
          Valider
        </button>
      </div>)
        }}



    
  </Accordion>)})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filters.props = ['filters','subtitle','opened','validate','toggle','class']
