import { Domaine } from '@/components/_common/domaine'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { titresRechercherByReferences } from '@/api/titres'
import { createDebounce } from '@/utils/debounce'
import { useRouter } from 'vue-router'
import { ref, FunctionalComponent, DeepReadonly, defineComponent } from 'vue'
import { titreApiClient, TitreForTitresRerchercherByNom } from '../titre/titre-api-client'
import { capitalize } from 'camino-common/src/strings'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { CaminoAnnee, getAnnee } from 'camino-common/src/date'
import { TypeAheadSingle } from '../_ui/typeahead-single'

export const QuickAccessTitre = defineComponent<{ id: string; onSelectTitre: () => void }>(props => {
  const router = useRouter()
  const titres = ref<TitreForTitresRerchercherByNom[]>([])

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

  const onSelectedTitre = (titre: DeepReadonly<TitreForTitresRerchercherByNom> | undefined) => {
    if (titre) {
      router.push({ name: 'titre', params: { id: titre.id } })
      props.onSelectTitre()
    }
  }

  return () => <PureQuickAccessTitre titres={titres.value} onSearch={search} onSelectedTitre={onSelectedTitre} id={props.id} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
QuickAccessTitre.props = ['id', 'onSelectTitre']

interface Props {
  id?: string
  titres: TitreForTitresRerchercherByNom[]
  onSelectedTitre: (titre: DeepReadonly<TitreForTitresRerchercherByNom> | undefined) => void
  alwaysOpen?: boolean
  onSearch: (searchTerm: string) => void
}
interface DisplayTitreProps {
  titre: DeepReadonly<Pick<TitreForTitresRerchercherByNom, 'nom' | 'typeId' | 'demarches'>>
}
export const DisplayTitre: FunctionalComponent<DisplayTitreProps> = props => {
  let annee: CaminoAnnee | null = null
  if (isNotNullNorUndefined(props.titre.demarches?.[0]?.demarcheDateDebut)) {
    annee = getAnnee(props.titre.demarches?.[0]?.demarcheDateDebut)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left' }}>
      <Domaine domaineId={getDomaineId(props.titre.typeId)} />
      <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-pl-2w">
        <span class="fr-text--bold">
          {capitalize(props.titre.nom)}
          {annee ? ` - ${annee}` : null}
        </span>
        <span class="fr-text">{capitalize(TitresTypesTypes[getTitreTypeType(props.titre.typeId)].nom)}</span>
      </div>
    </div>
  )
}

export const PureQuickAccessTitre = defineComponent<Props>(props => {
  const display = (titre: DeepReadonly<TitreForTitresRerchercherByNom>) => {
    return <DisplayTitre titre={titre} />
  }

  const overrideItem = ref<TitreForTitresRerchercherByNom | null>(null)
  const selectItem = (item: DeepReadonly<TitreForTitresRerchercherByNom> | undefined) => {
    overrideItem.value = null
    props.onSelectedTitre(item)
  }

  const debounce = createDebounce()

  return () => (
    <div class="fr-search-bar" id="search-473" role="search">
      <label class="fr-label" for="search-473-input">
        Rechercher
      </label>
      <TypeAheadSingle
        overrideItem={overrideItem.value}
        props={{
          id: props.id,
          itemKey: 'id',
          placeholder: 'Rechercher un titre',
          items: props.titres,
          minInputLength: 3,
          itemChipLabel: item => item.nom,
          onSelectItem: selectItem,
          onInput: event => debounce(() => props.onSearch(event)),
          displayItemInList: display,
          alwaysOpen: props.alwaysOpen ?? false,
        }}
      />
      <button class="fr-btn" title="Rechercher">
        Rechercher
      </button>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureQuickAccessTitre.props = ['id', 'titres', 'onSelectedTitre', 'onSearch', 'alwaysOpen']
