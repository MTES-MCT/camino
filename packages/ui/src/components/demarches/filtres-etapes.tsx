import { EtapeType, EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { CaminoDate } from 'camino-common/src/date'
import { HTMLAttributes, computed, defineComponent, ref, watch } from 'vue'
import { EtapeCaminoFiltres } from '../_ui/filters/camino-filtres'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { isNotNullNorUndefined, map } from 'camino-common/src/typescript-tools'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { DsfrInput } from '../_ui/dsfr-input'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { capitalize } from 'camino-common/src/strings'
import { DsfrSelect } from '../_ui/dsfr-select'

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
  const dateDebutChanged = (n: number) => (date: CaminoDate | null) => {
    if (date !== clonedValues.value[n].dateDebut) {
      clonedValues.value[n].dateDebut = date
      props.valuesSelected(clonedValues.value)
    }
  }
  const dateFinChanged = (n: number) => (date: CaminoDate | null) => {
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

  const statutValueSelected = (n: number) => (newStatut: null | EtapeStatutId) => {
    clonedValues.value[n].statutId = newStatut ?? undefined
    props.valuesSelected(clonedValues.value)
  }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', fontWeight: 'normal', gap: '1rem' }}>
      {clonedValues.value.map((value, n) => (
        <div key={n} class="fr-p-2w fr-tile--shadow" style={{ display: 'flex', flexDirection: 'column', fontWeight: 'normal', gap: '1rem' }}>
          <div class="flex" style={{ alignItems: 'center' }}>
            <EtapeTypeSearch
              index={n}
              initialEtapeTypeId={value.typeId !== '' ? value.typeId : null}
              selectedEtapeType={etapeType => {
                value.typeId = etapeType
                valueReset(n)
              }}
            />
            <DsfrButtonIcon class="fr-ml-1w" onClick={() => valueRemove(n)} icon="fr-icon-delete-bin-line" title="Supprime la valeur" buttonType="tertiary" />
          </div>
          {value.typeId ? (
            <>
              <DsfrSelect
                class="fr-mb-0"
                required={false}
                initialValue={value.statutId ?? null}
                legend={{ main: 'Statut' }}
                items={map(getEtapesStatuts(value.typeId), ({ id, nom }) => ({ id, label: nom }))}
                valueChanged={statutValueSelected(n)}
              />
              <DsfrInput required={false} initialValue={value.dateDebut} legend={{ main: 'Après le' }} type={{ type: 'date' }} valueChanged={dateDebutChanged(n)} />
              <DsfrInput required={false} initialValue={value.dateFin} legend={{ main: 'Avant le' }} type={{ type: 'date' }} valueChanged={dateFinChanged(n)} />
            </>
          ) : null}
        </div>
      ))}

      {clonedValues.value.some(v => v.typeId === '') ? null : (
        <DsfrButtonIcon icon="fr-icon-add-line" buttonType="secondary" title="Ajouter un type d’étape" label="Ajouter un type d'étape" onClick={valueAdd} />
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
        itemChipLabel: item => capitalize(item.nom),
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
