import { TypeAhead } from '@/components/_ui/typeahead'
import { Domaine } from '@/components/_common/domaine'
import { TitresTypesTypes, TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { getDomaineId, getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { titresRechercherByReferences } from '@/api/titres'
import { useRouter } from 'vue-router'
import { ref, inject, FunctionalComponent } from 'vue'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { titreApiClient } from '../titre/titre-api-client'
import { capitalize } from 'camino-common/src/strings'

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

export const QuickAccessTitre = caminoDefineComponent<{ id: string; onSelectTitre: () => void }>(['id', 'onSelectTitre'], props => {
  const router = useRouter()
  const titres = ref<Titre[]>([])

  const matomo = inject('matomo', null)
  const search = async (searchTerm: string): Promise<void> => {
    const intervalle = 10

    let searchTitres = await titreApiClient.titresRechercherByNom(searchTerm)

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
      props.onSelectTitre()
    }
  }

  return () => <PureQuickAccessTitre titres={titres.value} onSearch={search} onSelectedTitre={onSelectedTitre} id={props.id} />
})

interface Props {
  id?: string
  titres: Titre[]
  onSelectedTitre: (titre: Titre | undefined) => void
  onSearch: (searchTerm: string) => void
}
interface DisplayTitreProps {
  titre: Pick<Titre, 'nom' | 'typeId'>
}
export const DisplayTitre: FunctionalComponent<DisplayTitreProps> = props => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <Domaine domaineId={getDomaineId(props.titre.typeId)} />
      <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-pl-2w">
        <span class="cap-first bold">{capitalize(props.titre.nom)}</span>
        <span> ({TitresTypesTypes[getTitreTypeType(props.titre.typeId)].nom}) </span>
      </div>
    </div>
  )
}

export const PureQuickAccessTitre = caminoDefineComponent<Props>(['id', 'titres', 'onSelectedTitre', 'onSearch'], props => {
  const display = (titre: Titre) => {
    return <DisplayTitre titre={titre} />
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
        id: props.id,
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
