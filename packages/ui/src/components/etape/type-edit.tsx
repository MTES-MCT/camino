import { EtapesStatuts, EtapeStatutId, ETAPES_STATUTS, isStatut } from 'camino-common/src/static/etapesStatuts'
import { EtapesTypes, ETAPES_TYPES, EtapeType, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { computed, ref, FunctionalComponent, watch } from 'vue'
import { TypeAhead } from '../_ui/typeahead'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeApiClient } from './etape-api-client'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { onlyUnique } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'

export type Props = {
  etape: {
    statutId: EtapeStatutId | null
    typeId: EtapeTypeId | null
    id?: string | null
  }
  etapeDate: CaminoDate
  demarcheId: DemarcheId
  apiClient: Pick<EtapeApiClient, 'getEtapesTypesEtapesStatuts'>
  onEtapeChange: (statutId: EtapeStatutId | null, typeId: EtapeTypeId | null) => void
}

interface SelectStatutProps {
  statutId: EtapeStatutId | null
  statutIds: EtapeStatutId[]
  onStatutChange: (statutId: EtapeStatutId | null) => void
}

const SelectStatut: FunctionalComponent<SelectStatutProps> = (props: SelectStatutProps): JSX.Element => {
  console.log(props)
  const etapeStatutIdSelected: EtapeStatutId | null = props.statutId

  return (
    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Statut</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <select onChange={event => props.onStatutChange(isEventWithTarget(event) && isStatut(event.target.value) ? event.target.value : null)} class="p-s">
            {props.statutIds.length > 1 && etapeStatutIdSelected === null ? <option value={null} selected={true}></option> : null}
            {props.statutIds.map(etapeStatutId => {
              const etapeStatut = EtapesStatuts[etapeStatutId]
              return (
                <option key={etapeStatut.id} value={etapeStatut.id} selected={etapeStatutIdSelected === etapeStatut.id} disabled={etapeStatutIdSelected === etapeStatut.id}>
                  {etapeStatut.nom}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <hr />
    </div>
  )
}

export const TypeEdit = caminoDefineComponent<Props>(['etape', 'etapeDate', 'demarcheId', 'apiClient', 'onEtapeChange'], props => {
  const etapeTypeSearch = ref<string>('')
  const etapeTypeId = ref<EtapeTypeId | null>(props.etape.typeId ?? null)
  const etapeStatutId = ref<EtapeStatutId | null>(props.etape.statutId)

  const possibleEtapes = ref<AsyncData<EtapeTypeEtapeStatutWithMainStep[]>>({ status: 'LOADING' })
  const possibleStatuts = ref<EtapeStatutId[]>([])
  // FIXME DECIDE IF WE KEEP IT OR NOT
  watch(
    () => props.etapeDate,
    async newEtapeDate => {
      try {
        possibleEtapes.value = { status: 'LOADED', value: await props.apiClient.getEtapesTypesEtapesStatuts(props.demarcheId, props.etape?.id ?? null, newEtapeDate) }
        if (etapeTypeId.value) {
          possibleStatuts.value = possibleEtapes.value.value.filter(possible => possible.etapeTypeId === etapeTypeId.value).map(({ etapeStatutId }) => etapeStatutId)
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

  const etapeTypeExistante = computed<Pick<EtapeType, 'id'>[]>(() => (etapeTypeId.value ? [{ id: etapeTypeId.value }] : []))

  const displayItemInList = (item: EtapeType, etapeTypeEtapeStatutWithMainStep: EtapeTypeEtapeStatutWithMainStep[]): JSX.Element => {
    const isMainStep = etapeTypeEtapeStatutWithMainStep.some(({ etapeTypeId, mainStep }) => etapeTypeId === item.id && mainStep)

    return isMainStep ? <strong>{item.nom}</strong> : <>{item.nom}</>
  }

  return () => (
    <LoadingElement
      data={possibleEtapes.value}
      renderItem={items => (
        <>
          {items.length > 0 ? (
            <>
              <div class="tablet-blobs">
                <div class="tablet-blob-1-3 tablet-pt-s pb-s">
                  <h5>Type</h5>
                </div>
                <div class="mb tablet-blob-2-3">
                  <TypeAhead
                    overrideItems={etapeTypeExistante.value}
                    props={{
                      id: 'select-etape-type',
                      type: 'single',
                      placeholder: '',
                      items: items
                        .sort((a, b) => (a.mainStep ? -1 : 1))
                        .map(({ etapeTypeId }) => EtapesTypes[etapeTypeId])
                        .filter(({ nom }) => {
                          return nom.toLowerCase().includes(etapeTypeSearch.value)
                        })
                        .filter(onlyUnique),
                      minInputLength: 0,
                      itemKey: 'id',
                      // FIXME itemChipLabel refresh everything on hover
                      itemChipLabel: item => item.nom,
                      displayItemInList: item => displayItemInList(item, items),
                      onSelectItem: (type: EtapeType | undefined) => {
                        if (type) {
                          etapeTypeSearch.value = ''
                          possibleStatuts.value = items.filter(({ etapeTypeId }) => etapeTypeId === type.id).map(({ etapeStatutId }) => etapeStatutId)
                          if (possibleStatuts.value.length === 1) {
                            etapeStatutId.value = possibleStatuts.value[0]
                          } else {
                            etapeStatutId.value = null
                          }

                          etapeTypeId.value = type.id
                          props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
                        }
                      },
                      onInput: (searchTerm: string) => (etapeTypeSearch.value = searchTerm),
                    }}
                  />
                </div>
              </div>
              <hr />

              {(etapeTypeId.value === ETAPES_TYPES.demande && etapeStatutId.value === ETAPES_STATUTS.EN_CONSTRUCTION) || possibleStatuts.value.length === 0 ? null : (
                <SelectStatut
                  statutIds={possibleStatuts.value}
                  statutId={etapeStatutId.value}
                  onStatutChange={statutId => {
                    etapeStatutId.value = statutId
                    props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
                  }}
                />
              )}
            </>
          ) : (
            <div class="dsfr tablet-blobs">
              <div class="tablet-blob-1-3"></div>
              <div class="mb tablet-blob-2-3">
                <Alert type="warning" title="Il n’y a aucune étape possible à cette date." description={() => <>Veuillez modifier la date pour pouvoir choisir une étape.</>} small={true} />
              </div>
            </div>
          )}
        </>
      )}
    />
  )
})
