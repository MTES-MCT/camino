import { TypeAhead } from '@/components/_ui/typeahead'
import { Domaine } from '@/components/_common/domaine'
import { TitresTypesTypes, TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { getDomaineId, getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { titresRechercherByNom, titresRechercherByReferences } from '@/api/titres'
import { useRouter } from 'vue-router'
import { defineComponent, ref, inject } from 'vue'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export interface Titre {
  id: string
  nom: string

  typeId: TitreTypeId
  type?: {
    type: {
      id: TitreTypeTypeId
    }
  }
}

export const QuickAccessTitre = defineComponent({
  setup() {
    const router = useRouter()
    const titres = ref<Titre[]>([])

    const matomo = inject('matomo', null)
    const search = async (searchTerm: string): Promise<void> => {
      const intervalle = 10

      let searchTitres = await titresRechercherByNom({
        intervalle,
        noms: searchTerm,
      })

      if (searchTitres.elements.length === 0) {
        searchTitres = await titresRechercherByReferences({
          intervalle,
          references: searchTerm,
        })
      }
      titres.value.splice(0, titres.value.length, ...searchTitres.elements)
    }

    const onSelectedTitre = (titre: Titre | undefined) => {
      if (titre) {
        if (matomo) {
          // @ts-ignore
          matomo.trackEvent('navigation', 'navigation-rapide', titre.id)
        }
        router.push({ name: 'titre', params: { id: titre.id } })
      }
    }

    return () => <PureQuickAccessTitre titres={titres.value} onSearch={search} onSelectedTitre={onSelectedTitre} />
  },
})

interface Props {
  titres: Titre[]
  onSelectedTitre: (titre: Titre | undefined) => void
  onSearch: (searchTerm: string) => void
}
export const PureQuickAccessTitre = caminoDefineComponent<Props>(['titres', 'onSelectedTitre', 'onSearch'], props => {
  const display = (item: Titre) => {
    return (
      <div class="flex flex-center">
        <Domaine domaineId={getDomaineId(item.typeId)} class="mr-s" />
        <span class="cap-first bold">{item.nom}</span>
        <span class="ml-xs"> ({TitresTypesTypes[getTitreTypeType(item.typeId)].nom}) </span>
      </div>
    )
  }

  const createDebounce = () => {
    let timeout: ReturnType<typeof setTimeout>
    return function (fnc: Function, delayMs = 500) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        fnc()
      }, delayMs)
    }
  }

  const overrideItems = ref<Titre[]>([])
  const selectItem = (item: Titre | undefined) => {
    overrideItems.value = []
    props.onSelectedTitre(item)
  }

  const debounce = createDebounce()

  return () => (
    <TypeAhead
    overrideItems={overrideItems.value}

      props={{
        id: 'quick-access-titre',
        itemKey: 'id',
        placeholder: 'Rechercher un titre',
        type: 'single',
        items: props.titres,
        minInputLength: 3,
        itemChipLabel: item => item.nom,
        onSelectItem: selectItem,
        onInput: event => debounce(() => props.onSearch(event)),
        displayItemInList: display,
      }}
    />
  )
})
