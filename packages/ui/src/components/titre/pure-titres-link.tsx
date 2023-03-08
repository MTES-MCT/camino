import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { TypeAhead } from '@/components/_ui/typeahead'
import { computed, onMounted, ref, watch } from 'vue'
import { Statut } from '@/components/_common/statut'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { TitreLink } from 'camino-common/src/titres'
import { TitresStatuts, TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { LinkableTitre, TitresLinkConfig } from '@/components/titre/pure-titres-link-form-api-client'

interface Props {
  config: TitresLinkConfig
  loadLinkableTitres: () => Promise<LinkableTitre[]>
}
export const TitresLink = caminoDefineComponent<Props>(['config', 'loadLinkableTitres'], (props, context) => {
  const display = (item: LinkableTitre) => {
    return (
      <div class="flex flex-center">
        <Statut color={titreStatut(item.titreStatutId).couleur} nom={titreStatut(item.titreStatutId).nom} />
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
        if (selectedTitreList) {
          selectedTitres.value.push(...selectedTitreList)
        }
      }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }

  watch(
    () => props.loadLinkableTitres,
    async _ => {
      selectedTitres.value.splice(0, selectedTitres.value.length)
      onSelectItem(undefined)
      onSelectItems([])
      await init()
    }
  )

  onMounted(async () => {
    await init()
  })

  const titresFiltered = computed(() => {
    if (data.value.status === 'LOADED') {
      return search.value.length ? data.value.value.filter(({ nom }) => nom.toLowerCase().includes(search.value)) : data.value.value
    }
    return []
  })

  const onSearch = (searchLabel: string) => {
    search.value = searchLabel.toLowerCase()
  }

  const onSelectItem = (titre: TitreLink | undefined) => {
    context.emit('onSelectedTitre', titre)
  }
  const onSelectItems = (titres: TitreLink[]) => {
    context.emit('onSelectedTitres', titres)
  }

  const getDateDebutEtDateFin = (titre: LinkableTitre): string => {
    const titreLinkDemarches = titre.demarches.filter(({ phase }) => phase)
    const dateDebut = titreLinkDemarches.map(({ phase }) => phase?.dateDebut).sort()[0]
    const dateFin = titreLinkDemarches
      .map(({ phase }) => phase?.dateFin)
      .sort()
      .reverse()[0]

    return `${dateDebut} - ${dateFin}`
  }
  const titreStatut = (titreStatutId: TitreStatutId) => TitresStatuts[titreStatutId]

  return () => (
    <LoadingElement
      data={data.value}
      renderItem={_item => (
        <TypeAhead
          props={{
            id: 'titre-link-typeahead',
            itemKey: 'id',
            placeholder: props.config.type === 'single' ? 'Lier un titre' : 'Lier plusieurs titres',
            type: props.config.type,
            items: titresFiltered.value,
            itemChipLabel: item => item.nom,
            overrideItems: selectedTitres.value,
            minInputLength: 1,
            onSelectItem,
            onSelectItems,
            onInput: onSearch,
            displayItemInList: display,
          }}
        />
      )}
    />
  )
})
