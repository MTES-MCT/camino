import { EtapesStatuts, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { ETAPES_TYPES, EtapesTypes, EtapeType, EtapeTypeId, isEtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { computed, ref, FunctionalComponent, watch, HTMLAttributes, defineComponent } from 'vue'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeApiClient } from './etape-api-client'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeId, EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { DeepReadonly, NonEmptyArray, getKeys, isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefined, isNullOrUndefinedOrEmpty, map, onlyUnique } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { DsfrSelect, Item } from '../_ui/dsfr-select'
import type { JSX } from 'vue/jsx-runtime'

type Props = {
  etape: DeepReadonly<{
    statutId: EtapeStatutId | null
    typeId: EtapeTypeId | null
    id?: EtapeId | null
    date: CaminoDate
  }>
  demarcheId: DemarcheId
  apiClient: Pick<EtapeApiClient, 'getEtapesTypesEtapesStatuts'>
  onEtapeChange: (statutId: EtapeStatutId | null, typeId: EtapeTypeId | null) => void
} & Pick<HTMLAttributes, 'class'>

interface SelectStatutProps {
  statutId: EtapeStatutId | null
  statutIds: NonEmptyArray<EtapeStatutId>
  onStatutChange: (statutId: EtapeStatutId | null) => void
}

const SelectStatut: FunctionalComponent<SelectStatutProps> = (props: SelectStatutProps): JSX.Element | null => {
  const items: NonEmptyArray<Item<EtapeStatutId>> = map(props.statutIds, statutId => ({ id: statutId, label: EtapesStatuts[statutId].nom, disabled: props.statutId === statutId }))

  const initialValue = isNotNullNorUndefined(props.statutId) ? props.statutId : props.statutIds.length === 1 ? props.statutIds[0] : null

  return <DsfrSelect initialValue={initialValue} items={items} legend={{ main: 'Statut' }} required={true} id="select-etape-statut-id" valueChanged={props.onStatutChange} />
}

export const TypeEdit = defineComponent<Props>(props => {
  const etapeTypeSearch = ref<string>('')
  const etapeTypeId = ref<EtapeTypeId | null>(props.etape.typeId ?? null)
  const etapeStatutId = ref<EtapeStatutId | null>(props.etape.statutId)

  const possibleEtapes = ref<AsyncData<EtapeTypeEtapeStatutWithMainStep>>({ status: 'LOADING' })
  const possibleStatuts = ref<EtapeStatutId[]>([])
  watch(
    () => props.etape.date,
    async newEtapeDate => {
      try {
        possibleEtapes.value = { status: 'LOADED', value: await props.apiClient.getEtapesTypesEtapesStatuts(props.demarcheId, props.etape?.id ?? null, newEtapeDate) }
        const typeId = etapeTypeId.value
        if (isNotNullNorUndefined(typeId)) {
          updatePossibleStatuts(typeId)
        }
      } catch (e: any) {
        possibleEtapes.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened',
        }
      }
    },
    { immediate: true }
  )

  const updatePossibleStatuts = (typeId: EtapeTypeId) => {
    if (possibleEtapes.value.status === 'LOADED') {
      possibleStatuts.value = possibleEtapes.value.value[typeId]?.etapeStatutIds ?? []

      let newEtapeStatutId
      if (possibleStatuts.value.length === 1 || typeId === ETAPES_TYPES.participationDuPublic) {
        newEtapeStatutId = possibleStatuts.value[0]
      } else {
        newEtapeStatutId = possibleStatuts.value.find(value => value === etapeStatutId.value) ?? null
      }

      if (newEtapeStatutId !== etapeStatutId.value || typeId !== etapeTypeId.value) {
        etapeStatutId.value = newEtapeStatutId
        etapeTypeId.value = typeId
        props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
      }
    }

    return []
  }

  const etapeTypeExistante = computed<Pick<EtapeType, 'id'> | null>(() => (etapeTypeId.value ? { id: etapeTypeId.value } : null))

  const displayItemInList = (item: EtapeType, etapeTypeEtapeStatutWithMainStep: EtapeTypeEtapeStatutWithMainStep): JSX.Element => {
    const isMainStep = etapeTypeEtapeStatutWithMainStep[item.id]?.mainStep ?? false

    return isMainStep ? <strong>{item.nom}</strong> : <>{item.nom}</>
  }

  const noItemsText = computed<string | null>(() => {
    if (possibleEtapes.value.status === 'LOADED') {
      if (isNullOrUndefinedOrEmpty(Object.keys(possibleEtapes.value.value))) {
        if (isNotNullNorUndefined(props.etape.typeId)) {
          return `L'étape ${EtapesTypes[props.etape.typeId].nom} n'est pas possible à cette date`
        }

        return 'Il n’y a aucune étape possible à cette date.'
      }
      if (isNotNullNorUndefined(props.etape.typeId) && isNullOrUndefined(possibleEtapes.value.value[props.etape.typeId])) {
        return `L'étape ${EtapesTypes[props.etape.typeId].nom} n'est pas possible à cette date`
      }
    }

    return null
  })

  return () => (
    <LoadingElement
      class={props.class}
      data={possibleEtapes.value}
      renderItem={items => (
        <>
          {noItemsText.value === null ? (
            <div class={props.class}>
              <div class="fr-input-group">
                <label class="fr-label fr-mb-1w" for="select-etape-type">
                  Type *
                </label>
                <TypeAheadSingle
                  overrideItem={etapeTypeExistante.value}
                  disabled={isNotNullNorUndefined(etapeTypeId.value)}
                  props={{
                    id: 'select-etape-type',
                    placeholder: '',
                    items: [...getKeys(items, isEtapeTypeId)]
                      .sort((a, _b) => ((items[a]?.mainStep ?? false) ? -1 : 1))
                      .map(etapeTypeId => EtapesTypes[etapeTypeId])
                      .filter(({ nom }) => {
                        return nom.toLowerCase().includes(etapeTypeSearch.value)
                      })
                      .filter(onlyUnique),
                    minInputLength: 0,
                    itemKey: 'id',
                    itemChipLabel: item => item.nom,
                    displayItemInList: item => displayItemInList(item, items),
                    onSelectItem: (type: EtapeType | undefined) => {
                      if (type) {
                        etapeTypeSearch.value = ''
                        updatePossibleStatuts(type.id)
                      }
                    },
                    onInput: (searchTerm: string) => (etapeTypeSearch.value = searchTerm),
                  }}
                />
              </div>
              {!isNonEmptyArray(possibleStatuts.value) || etapeTypeId.value === ETAPES_TYPES.participationDuPublic ? null : (
                <SelectStatut
                  statutIds={possibleStatuts.value}
                  statutId={etapeStatutId.value}
                  onStatutChange={statutId => {
                    etapeStatutId.value = statutId
                    props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
                  }}
                />
              )}
            </div>
          ) : (
            <Alert type="warning" class="fr-mt-2w" title={noItemsText.value} description="Veuillez modifier la date pour pouvoir choisir une étape." />
          )}
        </>
      )}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TypeEdit.props = ['etape', 'apiClient', 'onEtapeChange', 'demarcheId', 'class']
