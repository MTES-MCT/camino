import { HTMLAttributes, computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Accordion from '../accordion.vue'
import { FiltersInput } from './filters-input'
import { FiltersCheckboxes } from './filters-checkboxes'
import { InputAutocomplete, InputAutocompleteValues } from './filters-input-autocomplete'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { FiltresEtapes, FilterEtapeValue } from '../../demarches/filtres-etapes'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { RouteLocationNormalizedLoaded, Router, onBeforeRouteLeave } from 'vue-router'
import {
  AutocompleteCaminoFiltres,
  CheckboxesCaminoFiltres,
  EtapeCaminoFiltres,
  InputCaminoFiltres,
  allCaminoFiltres,
  caminoAutocompleteFiltres,
  caminoInputFiltres,
  isAutocompleteCaminoFiltre,
  isCheckboxeCaminoFiltre,
  isEtapeCaminoFiltre,
  isInputCaminoFiltre,
} from './camino-filtres'

import { CaminoFiltre, caminoFiltres } from 'camino-common/src/filters'
import { CaminoRouterLink, routerQueryToString, routerQueryToStringArray } from '@/router/camino-router-link'
import { ApiClient } from '../../../api/api-client'
import { AsyncData } from '../../../api/client-rest'
import { LoadingElement } from '../functional-loader'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

type FormatedLabel = { id: CaminoFiltre; name: string; value: string | string[] | FilterEtapeValue; valueName?: string | string[] }

type Props = {
  filters: readonly CaminoFiltre[]
  route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>
  updateUrlQuery: Pick<Router, 'push'>
  subtitle?: string
  opened?: boolean
  validate: (param: { [key in Props['filters'][number]]: (typeof caminoFiltres)[key]['validator']['_output'] }) => void
  toggle: () => void
  apiClient: Pick<ApiClient, 'getUtilisateurEntreprises' | 'titresRechercherByNom' | 'getTitresByIds'>
} & Pick<HTMLAttributes, 'class'>

const etapesLabelFormat = (filter: EtapeCaminoFiltres, values: FilterEtapeValue[]): FormatedLabel[] => {
  const fullFilter = caminoFiltres[filter]

  return values
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
        id: fullFilter.id,
        name: fullFilter.name,
        value,
        valueName: message,
      }
    })
}

export const getInitialFiltres = (route: Pick<RouteLocationNormalizedLoaded, 'query' | 'name'>, filters: readonly CaminoFiltre[]) => {
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
    demarchesTypesIds: caminoFiltres.demarchesTypesIds.validator.parse(routerQueryToStringArray(route.query.demarchesTypesIds)),
    travauxTypesIds: caminoFiltres.travauxTypesIds.validator.parse(routerQueryToStringArray(route.query.travauxTypesIds)),
    demarchesStatutsIds: caminoFiltres.demarchesStatutsIds.validator.parse(routerQueryToStringArray(route.query.demarchesStatutsIds)),
    etapesInclues: caminoFiltres.etapesInclues.validator.parse(JSON.parse(routerQueryToString(route.query.etapesInclues, '[]'))),
    etapesExclues: caminoFiltres.etapesExclues.validator.parse(JSON.parse(routerQueryToString(route.query.etapesExclues, '[]'))),
    annees: caminoFiltres.annees.validator.parse(routerQueryToStringArray(route.query.annees)),
    nomsEntreprise: routerQueryToString(route.query.nomsEntreprise, ''),
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
    const filtres = { ...nonValidatedValues.value }
    // TODO 2023-08-21 regarder du côté des zod redefine si on peut pas faire ça directement dans le validator
    if ('etapesInclues' in nonValidatedValues.value) {
      filtres.etapesInclues = JSON.stringify(nonValidatedValues.value.etapesInclues)
    }
    if ('etapesExclues' in nonValidatedValues.value) {
      filtres.etapesExclues = JSON.stringify(nonValidatedValues.value.etapesExclues)
    }

    return { name: props.route.name ?? undefined, query: { ...props.route.query, page: 1, ...filtres } }
  })

  onBeforeRouteLeave(() => {
    stop()
  })

  const validatedValues = computed(() => {
    return getInitialFiltres(props.route, props.filters)
  })

  const stop = watch(validatedValues, _ => {
    props.validate(validatedValues.value)

    // Dans le cas où une personne fait 'précédent' avec des filtres déjà présents dans l'url, on détecte uniquement le changement d'url, donc de validatedValue.
    // Il faut alors mettre à jour les nonValidatedValues pour que l'interface reste cohérente.
    // Mais, lors du premier affichage de la carte, la carte change l'url (met les coordonnées) et ça trigger un validatedValue, donc il faut vérifier et ne pas écraser nonValidatedValues sinon on se retrouve avec deux requêtes pour récupérer les entreprises en parallèle, et c'est ça les aborted qu'on voit
    if (JSON.stringify(nonValidatedValues.value) !== JSON.stringify(validatedValues.value)) {
      nonValidatedValues.value = validatedValues.value
    }
  })

  const nonValidatedValues = ref<{ [key in CaminoFiltre]: (typeof caminoFiltres)[key]['validator']['_output'] }>(getInitialFiltres(props.route, props.filters))

  const keyup = (e: KeyboardEvent) => {
    if ((e.which || e.keyCode) === 13 && opened.value) {
      props.updateUrlQuery.push(urlQuery.value)
    }
  }
  const entreprises = ref<Awaited<ReturnType<typeof props.apiClient.getUtilisateurEntreprises>>>([])
  const loading = ref<AsyncData<true>>({ status: 'LOADING' })
  onMounted(async () => {
    document.addEventListener('keyup', keyup)
    await refreshLabels()
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
      } else if (isAutocompleteCaminoFiltre(labelId) || isCheckboxeCaminoFiltre(labelId) || isEtapeCaminoFiltre(labelId)) {
        const data = caminoFiltres[labelId].validator.parse([label.value])
        const index: number = nonValidatedValues.value[labelId].indexOf(data[0])
        if (index !== -1) {
          nonValidatedValues.value[labelId].splice(index, 1)
        }
      }
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

  const etapes = computed<EtapeCaminoFiltres[]>(() => {
    return props.filters.filter(isEtapeCaminoFiltre)
  })

  const labels = ref<FormatedLabel[]>([])

  watch(
    nonValidatedValues,
    async () => {
      await refreshLabels()
    },
    { deep: true }
  )

  const refreshLabels = async () => {
    let titresIds: Awaited<ReturnType<typeof props.apiClient.getTitresByIds>> = { elements: [] }

    try {
      if (props.filters.includes('entreprisesIds') && entreprises.value.length === 0) {
        loading.value = { status: 'LOADING' }
        entreprises.value = await props.apiClient.getUtilisateurEntreprises()
      }

      if (nonValidatedValues.value.titresIds?.length > 0) {
        loading.value = { status: 'LOADING' }
        titresIds = await props.apiClient.getTitresByIds(nonValidatedValues.value.titresIds, 'filters')
      }
      loading.value = { status: 'LOADED', value: true }
    } catch (e: any) {
      console.error('error', e)
      loading.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
    labels.value = props.filters.flatMap<FormatedLabel>(filter => {
      const filterType = caminoFiltres[filter]
      if (filterType.type === 'input' && isNotNullNorUndefined(nonValidatedValues.value[filter]) && nonValidatedValues.value[filter] !== '') {
        return [{ id: filterType.id, name: filterType.name, value: nonValidatedValues.value[filter] }]
      }
      if ((filterType.type === 'autocomplete' || filterType.type === 'checkboxes') && isNotNullNorUndefined(nonValidatedValues.value[filter])) {
        return nonValidatedValues.value[filterType.id].map<FormatedLabel>(v => {
          let elements: { id: string; nom: string }[] = []
          if (filterType.id === 'titresIds') {
            elements = titresIds.elements
          } else if (filterType.id === 'entreprisesIds') {
            elements = entreprises.value
          } else {
            elements = filterType.elements
          }
          const element = elements?.find(e => e.id === v)

          return {
            id: filterType.id,
            name: filterType.name,
            value: v,
            valueName: element && element.nom,
          }
        })
      } else if (filterType.type === 'etape' && isNotNullNorUndefined(nonValidatedValues.value[filter])) {
        return etapesLabelFormat(filterType.id, nonValidatedValues.value[filter])
      }

      return []
    })
  }

  return () => (
    <Accordion
      ref="accordion"
      opened={opened.value}
      slotSub={loading.value.status === 'LOADING' || loading.value.status === 'ERROR' || labels.value?.length > 0}
      slotDefault={true}
      class="mb-s"
      onToggle={props.toggle}
    >
      {{
        title: () => (
          <div style="display: flex; align-items: center">
            <div>Filtres</div>
            {isNotNullNorUndefined(props.subtitle) ? <div class="pl-s small">{props.subtitle}</div> : null}
          </div>
        ),
        sub: () => (
          <LoadingElement
            data={loading.value}
            renderItem={_item => (
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
            )}
          />
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
                      <InputAutocomplete filter={input} apiClient={props.apiClient} initialValue={nonValidatedValues.value[input]} onFilterAutocomplete={onFilterAutocomplete(input)} />
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

              {etapes.value.map(filter => (
                <FiltresEtapes
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
            </div>

            <div class="dsfr">
              <CaminoRouterLink class="fr-btn fr-mb-2w" to={urlQuery.value} title="Valider les filtres">
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
Filters.props = ['filters', 'subtitle', 'opened', 'validate', 'toggle', 'class', 'route', 'updateUrlQuery', 'apiClient']
