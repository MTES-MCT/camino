import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { computed, onMounted, ref } from 'vue'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { TitreLink } from 'camino-common/src/titres'
import { LinkableTitre, TitresLinkConfig } from '@/components/titre/titres-link-form-api-client'
import { TitreStatut } from '../_common/titre-statut'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { TypeAheadMultiple } from '../_ui/typeahead-multiple'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

interface Props {
  config: TitresLinkConfig
  loadLinkableTitres: () => Promise<LinkableTitre[]>
  onSelectTitres: (titres: TitreLink[]) => void
}
export const TitresLink = caminoDefineComponent<Props>(['config', 'loadLinkableTitres', 'onSelectTitres'], props => {
  const display = (item: LinkableTitre) => {
    return (
      <div class="flex flex-center dsfr">
        <TitreStatut titreStatutId={item.titreStatutId} />
        <span class="cap-first bold ml-m">{item.nom}</span>
        <span class="ml-m" style="margin-left: auto">
          {getDateDebutEtDateFin(item)}
        </span>
      </div>
    )
  }

  const search = ref<string>('')
  const selectedTitres = ref<TitreLink[]>([])
  const data = ref<AsyncData<LinkableTitre[]>>({ status: 'LOADING' })

  const selectedTitre = computed<TitreLink | null>(() => (isNotNullNorUndefinedNorEmpty(selectedTitres.value) ? selectedTitres.value[0] : null))
  const init = async () => {
    try {
      data.value = { status: 'LOADING' }

      const titresLinkables = await props.loadLinkableTitres()

      data.value = { status: 'LOADED', value: titresLinkables }
      const titreIds: string[] = []
      if (props.config.type === 'single' && props.config.selectedTitreId !== null) {
        titreIds.push(props.config.selectedTitreId)
      }
      if (props.config.type === 'multiple') {
        titreIds.push(...props.config.selectedTitreIds)
      }

      if (titreIds.length) {
        const selectedTitreList = data.value.value.filter(({ id }) => titreIds.includes(id))
        selectedTitres.value.push(...selectedTitreList)
      }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  onMounted(async () => {
    await init()
  })

  const titresFiltered = computed(() => {
    if (data.value.status === 'LOADED') {
      return search.value.length ? data.value.value.filter(({ nom, id }) => nom.toLowerCase().includes(search.value) || selectedTitres.value.some(t => t.id === id)) : data.value.value
    }

    return []
  })

  const onSearch = (searchLabel: string) => {
    search.value = searchLabel.toLowerCase()
  }

  const getDateDebutEtDateFin = (titre: LinkableTitre): string => {
    const dateDebut = titre.demarches
      .filter(({ demarcheDateDebut }) => !!demarcheDateDebut)
      .map(({ demarcheDateDebut }) => demarcheDateDebut)
      .sort()[0]
    const dateFin = titre.demarches
      .filter(({ demarcheDateFin }) => !!demarcheDateFin)
      .map(({ demarcheDateFin }) => demarcheDateFin)
      .sort()
      .reverse()[0]

    return `${dateDebut} - ${dateFin}`
  }
  const onSelectOneItem = (item: TitreLink | undefined) => {
    if (isNotNullNorUndefined(item)) {
      props.onSelectTitres([item])
    } else {
      props.onSelectTitres([])
    }
  }

  return () => (
    <LoadingElement
      data={data.value}
      renderItem={_item => (
        <>
          {props.config.type === 'single' ? (
            <TypeAheadSingle
              overrideItem={selectedTitre.value}
              props={{
                id: 'titre-link-typeahead',
                itemKey: 'id',
                placeholder: 'Lier un titre',
                items: titresFiltered.value,
                itemChipLabel: item => item.nom,
                minInputLength: 1,
                onSelectItem: onSelectOneItem,
                onInput: onSearch,
                displayItemInList: display,
              }}
            />
          ) : (
            <TypeAheadMultiple
              overrideItems={selectedTitres.value}
              props={{
                id: 'titre-link-typeahead',
                itemKey: 'id',
                placeholder: 'Lier plusieurs titres',
                items: titresFiltered.value,
                itemChipLabel: item => item.nom,
                minInputLength: 1,
                onSelectItems: props.onSelectTitres,
                onInput: onSearch,
                displayItemInList: display,
              }}
            />
          )}
        </>
      )}
    />
  )
})
