import { FunctionalComponent, HTMLAttributes, Ref, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { FiltersInput } from './filters-input'
import { FiltersCheckboxes } from './filters-checkboxes'
import { InputAutocomplete, InputAutocompleteValues } from './filters-input-autocomplete'
import { FiltresEtapes, FilterEtapeValue } from '../../demarches/filtres-etapes'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { onBeforeRouteLeave } from 'vue-router'
import './filters.css'
import { AutocompleteCaminoFiltres, EtapeCaminoFiltres, allCaminoFiltres, isAutocompleteCaminoFiltre, isCheckboxeCaminoFiltre, isEtapeCaminoFiltre, isInputCaminoFiltre } from './camino-filtres'

import { CaminoFiltre, caminoFiltres } from 'camino-common/src/filters'
import { routerQueryToString, routerQueryToStringArray } from '@/router/camino-router-link'
import { ApiClient } from '../../../api/api-client'
import { AsyncData } from '../../../api/client-rest'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Entreprise } from 'camino-common/src/entreprise'
import { CaminoRouteLocation, CaminoRouteNames, CaminoVueRoute } from '@/router/routes'
import { CaminoRouter } from '@/typings/vue-router'
import { DsfrButton } from '../dsfr-button'
import { createDebounce } from '@/utils/debounce'

type FormatedLabel = { id: CaminoFiltre; name: string; value: string | string[] | FilterEtapeValue; valueName?: string | string[] }

type Props = {
  filters: readonly CaminoFiltre[]
  route: CaminoRouteLocation
  updateUrlQuery: Pick<CaminoRouter, 'push'>
  subtitle?: string
  validate: (param: { [key in Props['filters'][number]]: (typeof caminoFiltres)[key]['validator']['_output'] }) => void
  apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getInitialFiltres = (route: CaminoRouteLocation, filters: readonly CaminoFiltre[]) => {
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
  const urlQuery = computed<CaminoVueRoute<CaminoRouteNames>>(() => {
    const filtres = { ...nonValidatedValues.value }
    // TODO 2023-08-21 regarder du côté des zod redefine si on peut pas faire ça directement dans le validator
    if ('etapesInclues' in nonValidatedValues.value) {
      filtres.etapesInclues = JSON.stringify(nonValidatedValues.value.etapesInclues)
    }
    if ('etapesExclues' in nonValidatedValues.value) {
      filtres.etapesExclues = JSON.stringify(nonValidatedValues.value.etapesExclues)
    }

    return { name: props.route.name ?? undefined, query: { ...props.route.query, page: 1, ...filtres }, params: {} }
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

  const initialFiltres = getInitialFiltres(props.route, props.filters)

  const nonValidatedValues = ref<{ [key in CaminoFiltre]: (typeof caminoFiltres)[key]['validator']['_output'] }>(getInitialFiltres(props.route, props.filters))

  const loading = ref<AsyncData<true>>({ status: 'LOADING' })
  onMounted(async () => {
    await refreshLabels()
  })

  const labelsReset = () => {
    props.filters.forEach(filter => {
      if (isInputCaminoFiltre(filter)) {
        nonValidatedValues.value[filter] = ''
      } else if (Array.isArray(nonValidatedValues.value[filter])) {
        nonValidatedValues.value[filter] = []
      }
    })
  }

  const labels = ref<FormatedLabel[]>([])

  const debounce = createDebounce()

  watch(urlQuery, (newValue, old) => {
    // TODO 2024-10-29 la pagination redéclenche la computed urlQuery, qui trigger un updateUrlQuery qui remet la pagination à 1...
    if (JSON.stringify(old) !== JSON.stringify(newValue)) {
      debounce(() => props.updateUrlQuery.push(newValue), 500)
    }
  })

  const refreshLabels = async () => {
    let titresIds: Awaited<ReturnType<typeof props.apiClient.getTitresByIds>> = { elements: [] }

    try {
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
          let elements: Readonly<{ id: string; nom: string }[]> = []
          if (filterType.id === 'titresIds') {
            elements = titresIds.elements
          } else if (filterType.id === 'entreprisesIds') {
            elements = props.entreprises
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
    <nav class="fr-sidemenu fr-pr-2w" aria-labelledby="fr-sidemenu-title">
      <div class="fr-sidemenu__inner fr-pt-3w fr-pl-2w fr-pb-3w fr-pr-2w">
        <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
          Filtres
        </button>
        <div class="fr-collapse" id="fr-sidemenu-wrapper">
          <div class="fr-sidemenu__title" id="fr-sidemenu-title">
            Filtres {props.subtitle}
          </div>

          <ul class="fr-sidemenu__list" style={{ display: 'flex', flexDirection: 'column' }}>
            {props.filters.map((filter, index) => (
              <li class="fr-sidemenu__item" key={filter} style={{ order: isNotNullNorUndefinedNorEmpty(initialFiltres[filter]) ? -1 : index }}>
                <button class="fr-sidemenu__btn" aria-expanded={index < 6 || isNotNullNorUndefinedNorEmpty(nonValidatedValues.value[filter])} aria-controls={`fr-sidemenu-item-${filter}`}>
                  {caminoFiltres[filter].name}
                </button>
                <div class={['fr-collapse', 'filter-collapsable']} id={`fr-sidemenu-item-${filter}`}>
                  <DisplayFiltre filtre={filter} nonValidatedValues={nonValidatedValues} apiClient={props.apiClient} entreprises={props.entreprises} />
                </div>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'end' }} class="fr-mt-2w">
            <DsfrButton buttonType="secondary" icon={undefined} title="Réinitialiser les filtres" onClick={labelsReset} />
          </div>
        </div>
      </div>
    </nav>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Filters.props = ['filters', 'subtitle', 'validate', 'class', 'route', 'updateUrlQuery', 'apiClient', 'entreprises']
type MyProp = {
  filtre: CaminoFiltre
  nonValidatedValues: Ref<{ [key in CaminoFiltre]: (typeof caminoFiltres)[key]['validator']['_output'] }>
  apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'>
  entreprises: Entreprise[]
}
const DisplayFiltre: FunctionalComponent<MyProp> = props => {
  const onFilterAutocomplete = (input: AutocompleteCaminoFiltres) => (items: InputAutocompleteValues) => {
    // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer en rendant InputAutocompleteValues generique)
    props.nonValidatedValues.value[input] = items
  }

  return (
    <div class="fr-py-2w">
      {isInputCaminoFiltre(props.filtre) ? (
        <FiltersInput
          filter={props.filtre}
          initialValue={props.nonValidatedValues.value[props.filtre]}
          onFilterInput={value => {
            props.nonValidatedValues.value[props.filtre] = value
          }}
        />
      ) : null}
      {isAutocompleteCaminoFiltre(props.filtre) ? (
        <InputAutocomplete
          entreprises={props.entreprises}
          filter={props.filtre}
          apiClient={props.apiClient}
          initialValue={props.nonValidatedValues.value[props.filtre]}
          onFilterAutocomplete={onFilterAutocomplete(props.filtre)}
        />
      ) : null}
      {isCheckboxeCaminoFiltre(props.filtre) ? (
        <FiltersCheckboxes
          key={props.filtre}
          filter={props.filtre}
          initialValues={props.nonValidatedValues.value[props.filtre]}
          valuesSelected={values => {
            // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
            props.nonValidatedValues.value[props.filtre] = values
          }}
        />
      ) : null}

      {isEtapeCaminoFiltre(props.filtre) ? (
        <FiltresEtapes
          key={props.filtre}
          filter={props.filtre}
          initialValues={props.nonValidatedValues.value[props.filtre]}
          valuesSelected={values => {
            // @ts-ignore typescript est perdu ici (probablement un distributive qu'il faut supprimer)
            props.nonValidatedValues.value[props.filtre] = values
          }}
        />
      ) : null}
    </div>
  )
}
