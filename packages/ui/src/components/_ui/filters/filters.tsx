import { HTMLAttributes, computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Accordion from '../accordion.vue'
import { FiltersInput } from './filters-input'
import { FiltersCheckboxes } from './filters-checkboxes'
import { InputAutocomplete, InputAutocompleteValues } from './filters-input-autocomplete'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { FiltresEtapes } from '../../demarches/filtres-etapes'
import { FilterEtapeValue } from './all-filters'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { RouteLocationNormalizedLoaded, Router, onBeforeRouteLeave } from 'vue-router'
import {
  AutocompleteCaminoFiltres,
  CaminoFiltres,
  CheckboxesCaminoFiltres,
  InputCaminoFiltres,
  allCaminoFiltres,
  caminoAutocompleteFiltres,
  caminoFiltres,
  caminoInputFiltres,
  isAutocompleteCaminoFiltre,
  isCheckboxeCaminoFiltre,
  isInputCaminoFiltre,
} from './camino-filtres'
import { CaminoRouterLink, routerQueryToString, routerQueryToStringArray } from '@/router/camino-router-link'

type FormatedLabel = { id: CaminoFiltres; name: string; value: string | string[]; valueName?: string | string[] }

type Props = {
  filters: readonly CaminoFiltres[]
  metas?: unknown
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  subtitle?: string
  opened?: boolean
  validate: (param: { [key in Props['filters'][number]]: (typeof caminoFiltres)[key]['validator']['_output'] }) => void
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
    administrationTypesIds: caminoFiltres.administrationTypesIds.validator.parse(routerQueryToStringArray(route.query.administrationTypesIds)),
    nomsAdministration: routerQueryToString(route.query.nomsAdministration, ''),
    nomsUtilisateurs: routerQueryToString(route.query.nomsUtilisateurs, ''),
    substancesIds: caminoFiltres.substancesIds.validator.parse(routerQueryToStringArray(route.query.substancesIds)),
    emails: routerQueryToString(route.query.emails, ''),
    roles: caminoFiltres.roles.validator.parse(routerQueryToStringArray(route.query.roles)),
    administrationIds: caminoFiltres.administrationIds.validator.parse(routerQueryToStringArray(route.query.administrationIds)),
    entreprisesIds: caminoFiltres.entreprisesIds.validator.parse(routerQueryToStringArray(route.query.entreprisesIds)),
    titresIds: caminoFiltres.titresIds.validator.parse(routerQueryToStringArray(route.query.titresIds)),
    typesIds: caminoFiltres.typesIds.validator.parse(routerQueryToStringArray(route.query.typesIds)),
    references: routerQueryToString(route.query.references, ''),
    communes: routerQueryToString(route.query.communes, ''),
    departements: caminoFiltres.departements.validator.parse(routerQueryToStringArray(route.query.departements)),
    regions: caminoFiltres.regions.validator.parse(routerQueryToStringArray(route.query.regions)),
    facadesMaritimes: caminoFiltres.facadesMaritimes.validator.parse(routerQueryToStringArray(route.query.facadesMaritimes)),
    domainesIds: caminoFiltres.domainesIds.validator.parse(routerQueryToStringArray(route.query.domainesIds)),
    statutsIds: caminoFiltres.statutsIds.validator.parse(routerQueryToStringArray(route.query.statutsIds)),
    activiteTypesIds: caminoFiltres.activiteTypesIds.validator.parse(routerQueryToStringArray(route.query.activiteTypesIds)),
    activiteStatutsIds: caminoFiltres.activiteStatutsIds.validator.parse(routerQueryToStringArray(route.query.activiteStatutsIds)),
    annees: caminoFiltres.annees.validator.parse(routerQueryToStringArray(route.query.annees)),
    nomsEntreprise: routerQueryToString(route.query.nomsEntreprise, ''),
    titresTerritoires: routerQueryToString(route.query.titresTerritoires, ''),
  }
  allCaminoFiltres.forEach(filter => {
    if (!filters.includes(filter)) {
      Reflect.deleteProperty(allValues, filter)
    }
  })
  return allValues
}

export const Filters = defineComponent((props: Props) => {
  const opened = computed<boolean>(() => {
    return props.opened ?? false
  })

  const urlQuery = computed(() => {
    return { name: props.route.name ?? undefined, query: { ...props.route.query, page: 1, ...nonValidatedValues.value } }
  })

  // TODO 2023-07-19 ugly hack pour que vue voit que les élements dans titresIds sont bien mis à jour
  // Il faut repenser tout ça, ce n'est pas un bon moyen de récupérer les éléments, mais on en a besoin pour calculer les labels...
  // C'est le seul composant qui à un load asynchrone et un search asynchrone
  const titresIds = ref([...caminoFiltres.titresIds.elements])
  const interval = setInterval(() => {
    if (JSON.stringify(titresIds.value) !== JSON.stringify(caminoFiltres.titresIds.elements)) {
      refreshLabels.value += 1
      titresIds.value = caminoFiltres.titresIds.elements
    }
  }, 1000)
  const refreshLabels = ref<number>(0)

  onBeforeRouteLeave(() => {
    stop()
    clearInterval(interval)
  })

  const validatedValues = computed(() => {
    return getInitialFiltres(props.route, props.filters)
  })

  const stop = watch(validatedValues, _ => {
    props.validate(validatedValues.value)
  })

  const nonValidatedValues = ref<{ [key in CaminoFiltres]: (typeof caminoFiltres)[key]['validator']['_output'] }>(getInitialFiltres(props.route, props.filters))
  const keyup = (e: KeyboardEvent) => {
    if ((e.which || e.keyCode) === 13 && opened.value) {
      props.updateUrlQuery.push(urlQuery.value)
    }
  }
  onMounted(() => {
    document.addEventListener('keyup', keyup)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyup)
  })

  const inputsErase = () => {
    caminoInputFiltres.forEach(filtre => {
      nonValidatedValues.value[filtre.id] = ''
    })
    caminoAutocompleteFiltres.forEach(filtre => {
      nonValidatedValues.value[filtre.id] = []
    })
  }

  const labelRemove = (label: FormatedLabel) => {
    if (!opened.value) {
      const labelId = label.id
      if (isInputCaminoFiltre(labelId)) {
        nonValidatedValues.value[labelId] = ''
      } else if (isAutocompleteCaminoFiltre(labelId) || isCheckboxeCaminoFiltre(labelId)) {
        const data = caminoFiltres[labelId].validator.parse([label.value])
        // @ts-ignore ici typescript est perdu
        const index = nonValidatedValues.value[labelId].indexOf(data[0])
        if (index !== -1) {
          nonValidatedValues.value[labelId].splice(index, 1)
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

      props.updateUrlQuery.push(urlQuery.value)
    }
  }

  const onFilterAutocomplete = (input: AutocompleteCaminoFiltres) => (items: InputAutocompleteValues) => {
    // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer en rendant InputAutocompleteValues generique)
    nonValidatedValues.value[input] = items
  }

  const labelsReset = () => {
    props.filters.forEach(filter => {
      if (isInputCaminoFiltre(filter)) {
        nonValidatedValues.value[filter] = ''
      } else if (Array.isArray(nonValidatedValues.value[filter])) {
        nonValidatedValues.value[filter] = []
      }
    })

    if (!opened.value) {
      props.updateUrlQuery.push(urlQuery.value)
    }
  }

  const inputs = computed<InputCaminoFiltres[]>(() => {
    return props.filters.filter(isInputCaminoFiltre)
  })
  const autocompletes = computed<AutocompleteCaminoFiltres[]>(() => {
    return props.filters.filter(isAutocompleteCaminoFiltre)
  })

  const checkboxes = computed<CheckboxesCaminoFiltres[]>(() => {
    return props.filters.filter(isCheckboxeCaminoFiltre)
  })

  // const etapes = computed<(CommonFilter<FiltreId, ElementType> & FilterEtape)[]>(() => {
  //   return props.filters.filter((filter): filter is CommonFilter<FiltreId, ElementType> & FilterEtape => filter.type === 'etape')
  // })

  const labels = computed<FormatedLabel[]>(() => {
    // TODO 2023-07-19 obligatoire pour que les labels se recalculent quand les trucs asynchrones (les titres) sont chargés...
    // eslint-disable-next-line no-unused-expressions
    refreshLabels.value
    return props.filters.flatMap(filter => {
      const filterType = caminoFiltres[filter]
      if (filterType.type === 'input' && nonValidatedValues.value[filter]) {
        return [{ id: filterType.id, name: filterType.name, value: nonValidatedValues.value[filter] }]
      }
      if ((filterType.type === 'autocomplete' || filterType.type === 'checkboxes') && nonValidatedValues.value[filter]) {
        return nonValidatedValues.value[filterType.id].map<FormatedLabel>(v => {
          // TODO 2023-07-13 trouver comment mieux typer ça sans le 'as'
          let elements: { id: string; nom: string }[] = []
          if ('elementsFormat' in filterType) {
            elements = filterType.elementsFormat(filterType.id, props.metas)
          } else {
            elements = filterType.elements as { id: string; nom: string }[]
          }
          const element = elements?.find(e => e.id === v)

          return {
            id: filterType.id,
            name: filterType.name,
            value: v,
            valueName: element && element.nom,
          }
        })
      }
      // else if (filter.type === 'etape' && filter.value && filter.value.length) {
      //   return etapesLabelFormat(filter)
      // }
      return []
    })
  })

  return () => (
    <Accordion ref="accordion" opened={opened.value} slotSub={!!labels.value.length} slotDefault={true} class="mb-s" onToggle={props.toggle}>
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
              <div class={['flex', opened.value ? 'border-b-s' : null]}>
                <div class="px-m pt-m pb-s">
                  {labels.value.map(label => (
                    <span
                      key={`${label.id}-${label.valueName}`}
                      class={['rnd-m', 'box', 'btn-flash', 'h6', 'pl-s', 'pr-xs', 'py-xs', 'bold', 'mr-xs', 'mb-xs', opened.value ? 'pr-s' : 'pr-xs']}
                      onClick={() => labelRemove(label)}
                    >
                      {label.name} : {label.valueName || label.value}{' '}
                      {!opened.value ? (
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
                      <FiltersInput
                        filter={input}
                        initialValue={nonValidatedValues.value[input]}
                        onFilterInput={value => {
                          nonValidatedValues.value[input] = value
                        }}
                      />
                    </div>
                  ))}
                  {autocompletes.value.map(input => (
                    <div key={input}>
                      <InputAutocomplete filter={input} metas={props.metas} initialValue={nonValidatedValues.value[input]} onFilterAutocomplete={onFilterAutocomplete(input)} />
                    </div>
                  ))}
                  <button class="btn-border small px-s p-xs rnd-xs mb" onClick={inputsErase}>
                    Tout effacer
                  </button>
                </div>
              ) : null}

              {checkboxes.value.map(filter => (
                <FiltersCheckboxes
                  key={filter}
                  filter={filter}
                  initialValues={nonValidatedValues.value[filter]}
                  valuesSelected={values => {
                    // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
                    nonValidatedValues.value[filter] = values
                  }}
                  class="tablet-blob-1-2 large-blob-1-3"
                />
              ))}
              {/* 
              {etapes.value.map(filter => (
                <FiltresEtapes key={filter.id} filter={filter} class="tablet-blob-1-2 large-blob-1-3" />
              ))} */}
            </div>

            <div class="dsfr">
              <CaminoRouterLink class="fr-link" to={urlQuery.value} title="Valider les filtres">
                Valider
              </CaminoRouterLink>
            </div>
          </div>
        ),
      }}
    </Accordion>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filters.props = ['filters', 'subtitle', 'opened', 'validate', 'toggle', 'class', 'route', 'updateUrlQuery', 'metas']
