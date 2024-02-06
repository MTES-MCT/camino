import { EtapeType, EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { InputDate } from '../_ui/input-date'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { CaminoDate } from 'camino-common/src/date'
import { HTMLAttributes, computed, defineComponent, ref, watch } from 'vue'
import { EtapeCaminoFiltres } from '../_ui/filters/camino-filtres'
import { caminoFiltres } from 'camino-common/src/filters'
import { EtapeStatutId, isStatut } from 'camino-common/src/static/etapesStatuts'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TypeAheadSingle } from '../_ui/typeahead-single'

export type FilterEtapeValue = {
  typeId: EtapeTypeId | ''
  statutId?: EtapeStatutId
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
}

type Props = {
  filter: EtapeCaminoFiltres
  initialValues: FilterEtapeValue[]
  valuesSelected: (values: FilterEtapeValue[]) => void
} & Pick<HTMLAttributes, 'class'>

export const FiltresEtapes = defineComponent<Props>(props => {
  watch(
    () => props.initialValues,
    newValues => {
      clonedValues.value = newValues.map(value => ({ ...value }))
    },
    { deep: true }
  )
  const clonedValues = ref<FilterEtapeValue[]>(props.initialValues.map(value => ({ ...value })))
  const fullFilter = computed(() => caminoFiltres[props.filter])
  const dateDebutChanged = (n: number, date: CaminoDate | null) => {
    if (date !== clonedValues.value[n].dateDebut) {
      clonedValues.value[n].dateDebut = date
      props.valuesSelected(clonedValues.value)
    }
  }
  const dateFinChanged = (n: number, date: CaminoDate | null) => {
    if (date !== clonedValues.value[n].dateFin) {
      clonedValues.value[n].dateFin = date
      props.valuesSelected(clonedValues.value)
    }
  }

  const valueAdd = () => {
    clonedValues.value.push({ typeId: '', dateDebut: null, dateFin: null })
    props.valuesSelected(clonedValues.value)
  }

  const valueRemove = (n: number) => {
    clonedValues.value.splice(n, 1)
    props.valuesSelected(clonedValues.value)
  }

  const valueReset = (n: number) => {
    delete clonedValues.value[n].statutId
    props.valuesSelected(clonedValues.value)
  }

  const statutValueSelected = (n: number, event: Event) => {
    if (isEventWithTarget(event)) {
      if (event.target.value === '') {
        delete clonedValues.value[n].statutId
      } else if (isStatut(event.target.value)) {
        clonedValues.value[n].statutId = event.target.value
      }
      props.valuesSelected(clonedValues.value)
    }
  }

  // TODO 2023-07-13 mettre un composant typeahead pour les types d'étapes plutôt qu'un select de l'enfer
  return () => (
    <div class={`mb ${props.class}`}>
      <h5>{fullFilter.value.name}</h5>
      <hr class="mb-s" />

      {clonedValues.value.map((value, n) => (
        <div key={n}>
          <div class="flex mb-s">
            <EtapeTypeSearch
              class="p-s mr-s"
              index={n}
              initialEtapeTypeId={value.typeId !== '' ? value.typeId : null}
              selectedEtapeType={etapeType => {
                value.typeId = etapeType
                valueReset(n)
              }}
            />
            <ButtonIcon class="btn py-s px-m rnd-xs" onClick={() => valueRemove(n)} icon="minus" title="Supprime la valeur" aria-label="Supprime la valeur" />
          </div>
          {value.typeId ? (
            <div>
              <div class="blobs mb-s">
                <div class="blob-1-4">
                  <h5 class="mb-0">Statut</h5>
                  <p class="h6 italic mb-0">Optionnel</p>
                </div>
                <div class="blob-3-4">
                  <select class="p-s mr-s cap-first" onChange={event => statutValueSelected(n, event)}>
                    <option value="">–</option>
                    {getEtapesStatuts(value.typeId).map(statut => (
                      <option key={statut.id} value={statut.id} selected={value.statutId === statut.id}>
                        {statut.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div class="blobs mb-s">
                <div class="blob-1-4">
                  <h5 class="mb-0">Après le</h5>
                  <p class="h6 italic mb-0">Optionnel</p>
                </div>
                <div class="blob-3-4">
                  <InputDate initialValue={value.dateDebut} dateChanged={date => dateDebutChanged(n, date)} />
                </div>
              </div>
              <div class="blobs mb-s">
                <div class="blob-1-4">
                  <h5 class="mb-0">Avant le</h5>
                  <p class="h6 italic mb-0">Optionnel</p>
                </div>
                <div class="blob-3-4">
                  <InputDate initialValue={value.dateFin} dateChanged={date => dateFinChanged(n, date)} />
                </div>
              </div>
            </div>
          ) : null}

          <hr class="mb-s" />
        </div>
      ))}

      {clonedValues.value.some(v => v.typeId === '') ? null : (
        <button class="btn rnd-xs py-s px-m full-x flex mb-s h6" title="Ajouter un type d’étape" aria-label="Ajouter un type d’étape" onClick={valueAdd}>
          <span class="mt-xxs">Ajouter un type d'étape</span>
          <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
        </button>
      )}
    </div>
  )
})

type EtapeTypeSearchProps = {
  index: number
  initialEtapeTypeId: EtapeTypeId | null
  selectedEtapeType: (etapeTypeId: EtapeTypeId) => void
  class?: HTMLAttributes['class']
}
const EtapeTypeSearch = defineComponent<EtapeTypeSearchProps>(props => {
  const overrideItem = computed(() => (props.initialEtapeTypeId !== null ? EtapesTypes[props.initialEtapeTypeId] : null))
  const etapeTypeSearch = ref<string>('')

  const onInputSearchEtapeType = (searchTerm: string) => {
    etapeTypeSearch.value = searchTerm
  }

  const onSelectItem = (type: EtapeType | undefined) => {
    etapeTypeSearch.value = ''
    if (isNotNullNorUndefined(type)) {
      props.selectedEtapeType(type.id)
    }
  }

  const items = computed<EtapeType[]>(() => {
    return Object.values(EtapesTypes)
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .filter(({ nom }) => {
        return nom.toLowerCase().includes(etapeTypeSearch.value)
      })
  })

  return () => (
    <TypeAheadSingle
      overrideItem={overrideItem.value}
      props={{
        id: `select-etape-type-${props.index}`,
        placeholder: "Type d'étape",
        items: items.value,
        minInputLength: 0,
        itemKey: 'id',
        itemChipLabel: item => item.nom,
        onSelectItem,
        onInput: onInputSearchEtapeType,
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
FiltresEtapes.props = ['filter', 'initialValues', 'valuesSelected', 'class']
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeTypeSearch.props = ['initialEtapeTypeId', 'selectedEtapeType', 'index']
