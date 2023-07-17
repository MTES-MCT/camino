import { HTMLAttributes, computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import Accordion from '../accordion.vue'
import { FiltersInput } from './filters-input'
import { FiltersCheckboxes } from './filters-checkboxes'
import { InputAutocomplete } from './filters-input-autocomplete'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { FiltresEtapes } from '../../demarches/filtres-etapes'
import {  FilterEtapeValue } from './all-filters'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { AutocompleteCaminoFiltres, CaminoFiltres, InputCaminoFiltres, allCaminoFiltres, caminoAutocompleteFiltres, caminoFiltres, caminoInputFiltres, isAutocompleteCaminoFiltre, isInputCaminoFiltre } from './camino-filtres'
import { routerQueryToString, routerQueryToStringArray } from '@/router/camino-router-link'

type FormatedLabel = { id: CaminoFiltres; name: string; value: string | string[]; valueName?: string | string[] }

type Props = {
  filters: readonly CaminoFiltres[]
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  subtitle?: string
  opened?: boolean
  validate: (param: {[key in Props['filters'][number]]: typeof caminoFiltres[key]['validator']['_output']}) => void
  toggle: () => void
} & Pick<HTMLAttributes, 'class'>

const etapesLabelFormat = <FiltreId extends string>(f: { id: FiltreId; name: string; value: FilterEtapeValue[] }): { id: FiltreId; name: string; value: FilterEtapeValue; valueName: string }[] =>
  f.value
    .filter(value => value.typeId)
    .map(value => {
      let message = `type: ${EtapesTypes[value.typeId as EtapeTypeId].nom}`
      if (value.statutId) {
        message += `, statut: ${EtapesStatuts[value.statutId].nom}`
      }
      if (value.dateDebut) {
        message += `, après le ${value.dateDebut}`
      }
      if (value.dateFin) {
        message += `, avant le ${value.dateFin}`
      }
      return {
        id: f.id,
        name: f.name,
        value,
        valueName: message,
      }
    })

    export const getInitialFiltres = (route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>, filters: readonly CaminoFiltres[]) => {
      const allValues = {
        administrationTypesIds: caminoFiltres['administrationTypesIds'].validator.parse(routerQueryToStringArray(route.query.administrationTypesIds)),
        nomsAdministration: routerQueryToString(route.query.nomsAdministration, ''),
        nomsUtilisateurs: routerQueryToString(route.query.nomsUtilisateurs, ''),
        substancesIds: caminoFiltres['substancesIds'].validator.parse(routerQueryToStringArray(route.query.substancesIds)),
      }
      allCaminoFiltres.filter(filter => !filters.includes(filter)).forEach(filter => Reflect.deleteProperty(allValues, filter))
      return allValues
    }

export const Filters = defineComponent((props: Props) => {

  const opened = computed<boolean>(() => {
    return props.opened ?? false
  })
  const values = ref<{[key in CaminoFiltres]: typeof caminoFiltres[key]['validator']['_output']}>({
      administrationTypesIds: caminoFiltres['administrationTypesIds'].validator.parse(routerQueryToStringArray(props.route.query.administrationTypesIds)),
      nomsAdministration: routerQueryToString(props.route.query.nomsAdministration, ''),
      nomsUtilisateurs: routerQueryToString(props.route.query.nomsUtilisateurs, ''),
      substancesIds: caminoFiltres['substancesIds'].validator.parse(routerQueryToStringArray(props.route.query.substancesIds)),
    }
  )
  const keyup = (e: KeyboardEvent) => {
    if ((e.which || e.keyCode) === 13 && (props.opened ?? false)) {
      props.validate(values.value)
    }
  }
  onMounted(() => {
    document.addEventListener('keyup', keyup)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyup)
  })

  const inputsErase = () => {
    caminoInputFiltres.map(filtre => {
      values.value[filtre.id] = ''
    })
    caminoAutocompleteFiltres.map(filtre => {
      values.value[filtre.id] = []
    })
  }

  const labelRemove = (label: FormatedLabel) => {
    if (!opened.value) {
      if (isInputCaminoFiltre(label.id)) {
        values.value[label.id] = ''
      } else if (isAutocompleteCaminoFiltre(label.id)) {
        const data = caminoFiltres[label.id].validator.parse([label.value])
        const index = values.value[label.id].indexOf(data[0])
        if (index !== -1) {
          values.value[label.id].splice(index, 1)
        }
      }
      // if (Array.isArray(filter.value)) {
      //   if (filter.type === 'checkboxes' || filter.type === 'etape' || filter.type === 'autocomplete') {
      //     const index = filter.value.indexOf(label.value)
      //     if (index > -1) {
      //       filter.value.splice(index, 1)
      //     }
      //   }
      // } 
      

      props.validate(values.value)
    }
  }

  const labelsReset = () => {
    props.filters.forEach(filter => {
      if (isInputCaminoFiltre(filter)) {
        values.value[filter] = ''
      } else if (Array.isArray(values.value[filter])) {
        values.value[filter] = []
       } 
    })

    if (!(props.opened ?? false)) {
      props.validate(values.value)
    }
  }

  const inputs = computed<InputCaminoFiltres[]>(() => {
    return props.filters.filter(isInputCaminoFiltre)
  })
  const autocompletes = computed<AutocompleteCaminoFiltres[]>(() => {
    return props.filters.filter(isAutocompleteCaminoFiltre)
  })

  // const checkboxes = computed<(CommonFilter<FiltreId, ElementType> & FilterCheckbox)[]>(() => {
  //   return props.filters.filter((filter): filter is CommonFilter<FiltreId, ElementType> & FilterCheckbox => filter.type === 'checkboxes')
  // })

  // const etapes = computed<(CommonFilter<FiltreId, ElementType> & FilterEtape)[]>(() => {
  //   return props.filters.filter((filter): filter is CommonFilter<FiltreId, ElementType> & FilterEtape => filter.type === 'etape')
  // })

  const labels = computed<FormatedLabel[]>(() => {
    return props.filters.flatMap(filter => {
      const filterType = caminoFiltres[filter]
      if (filterType.type === 'input' && values.value[filter]) {
        return [{ id: filterType.id, name: filterType.name, value: values.value[filter] }]
      }
      if (filterType.type === 'autocomplete' && values.value[filter]) {
        return values.value[filterType.id].map<FormatedLabel>(v => {
              // TODO 2023-07-13 trouver comment mieux typer ça sans le 'as'
              const elements = filterType.elements
              const element = elements?.find(e => e.id === v)
    
              return {
                id: filterType.id,
                name: filterType.name,
                value: v,
                valueName: element && element.nom,
              }
            })
      }
      // } else if ((filter.type === 'checkboxes' || filter.type === 'autocomplete') && filter.value?.length) {
      //   return filter.value.map(v => {
      //     // TODO 2023-07-13 trouver comment mieux typer ça sans le 'as'
      //     const elements = filter.elements as { id: string; nom: string }[]
      //     const element = elements?.find(e => e.id === v)

      //     return {
      //       id: filter.id,
      //       name: filter.name,
      //       value: v,
      //       valueName: element && element.nom,
      //     }
      //   })
      // } 
      // else if (filter.type === 'etape' && filter.value && filter.value.length) {
      //   return etapesLabelFormat(filter)
      // }
      return []
    })
  })

  return () => (
    <Accordion ref="accordion" opened={props.opened ?? false} slotSub={!!labels.value.length} slotDefault={true} class="mb-s" onToggle={props.toggle}>
      {{
        title: () => (
          <div style="display: flex; align-items: center">
            <div>Filtres</div>
            {props.subtitle ? <div class="pl-s small">{props.subtitle}</div> : null}
          </div>
        ),
        sub: () => (
          <>
            {labels.value.length ? (
              <div class={['flex', props.opened ?? false ? 'border-b-s' : null]}>
                <div class="px-m pt-m pb-s">
                  {labels.value.map(label => (
                    <span
                      key={`${label.id}-${label.valueName}`}
                      class={['rnd-m', 'box', 'btn-flash', 'h6', 'pl-s', 'pr-xs', 'py-xs', 'bold', 'mr-xs', 'mb-xs', props.opened ?? false ? 'pr-s' : 'pr-xs']}
                      onClick={() => labelRemove(label)}
                    >
                      {label.name} : {label.valueName || label.value}{' '}
                      {!(props.opened ?? false) ? (
                        <span class="inline-block align-y-top ml-xs">
                          {' '}
                          <Icon size="S" name="x" color="white" role="img" aria-label={`Supprimer le filtre ${label.name}`} />{' '}
                        </span>
                      ) : null}
                    </span>
                  ))}
                </div>
                <ButtonIcon class="flex-right btn-alt p-m" onClick={labelsReset} icon="close" title="Réinitialiser les filtres" />
              </div>
            ) : null}
          </>
        ),
        default: () => (
          <div class="px-m">
            <div class="tablet-blobs mt">
              {inputs.value.length || autocompletes.value.length ? (
                <div class="tablet-blob-1-2 large-blob-1-3">
                  {inputs.value.map(input => (
                    <div key={input}>
                      <FiltersInput filter={input} initialValue={values.value[input]} onFilterInput={(value) => values.value[input] = value} />
                    </div>
                  ))}
                  {autocompletes.value.map(input => (
                    <div key={input}>
                      <InputAutocomplete filter={input} initialValue={values.value[input]} onFilterAutocomplete={(items) => values.value[input] = items}/>
                    </div>
                  ))}
                  <button class="btn-border small px-s p-xs rnd-xs mb" onClick={inputsErase}>
                    Tout effacer
                  </button>
                </div>
              ) : null}

              {/* {checkboxes.value.map(filter => (
                <FiltersCheckboxes key={filter.id} filter={filter} class="tablet-blob-1-2 large-blob-1-3" />
              ))}
              {etapes.value.map(filter => (
                <FiltresEtapes key={filter.id} filter={filter} class="tablet-blob-1-2 large-blob-1-3" />
              ))} */}
            </div>

            <button ref="button" class="btn-flash p-s rnd-xs full-x mb" onClick={() => props.validate(values.value)}>
              Valider
            </button>
          </div>
        ),
      }}
    </Accordion>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filters.props = ['filters', 'subtitle', 'opened', 'validate', 'toggle', 'class', 'route']
