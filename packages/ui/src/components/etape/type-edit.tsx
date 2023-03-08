import { EtapeStatut, EtapeStatutId, isStatut } from 'camino-common/src/static/etapesStatuts'
import { EtapesTypes, EtapeType, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { computed, ref, FunctionalComponent } from 'vue'
import { TypeAhead } from '../_ui/typeahead'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'

export type Props = {
  etape: {
    statutId: EtapeStatutId | null
    type?: { id: EtapeTypeId }
  }
  etapesTypesIds: EtapeTypeId[]
  etapeIsDemandeEnConstruction?: boolean
  onEtapeChange: (statutId: EtapeStatutId | null, typeId: EtapeTypeId | null) => void
}

interface SelectStatutProps {
  statutId: EtapeStatutId | null
  typeId: EtapeTypeId | null
  onStatutChange: (statutId: EtapeStatutId | null) => void
}

const SelectStatut: FunctionalComponent<SelectStatutProps> = (props: SelectStatutProps): JSX.Element => {
  const etapesStatuts: EtapeStatut[] = props.typeId ? getEtapesStatuts(props.typeId) : []

  const etapeStatutIdSelected: EtapeStatutId | null = props.statutId

  return (
    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Statut</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <select onChange={event => props.onStatutChange(isEventWithTarget(event) && isStatut(event.target.value) ? event.target.value : null)} class="p-s">
            {etapesStatuts.length > 1 && etapeStatutIdSelected === null ? <option value={null} selected={true}></option> : null}
            {etapesStatuts.map(etapeStatut => (
              <option key={etapeStatut.id} value={etapeStatut.id} selected={etapeStatutIdSelected === etapeStatut.id} disabled={etapeStatutIdSelected === etapeStatut.id}>
                {etapeStatut.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr />
    </div>
  )
}

export const TypeEdit = caminoDefineComponent<Props>(['etape', 'etapesTypesIds', 'etapeIsDemandeEnConstruction', 'onEtapeChange'], props => {
  const etapeTypeSearch = ref<string>('')
  const etapeTypeId = ref<EtapeTypeId | null>(props.etape.type?.id ?? null)
  const etapeStatutId = ref<EtapeStatutId | null>(props.etape.statutId)

  const etapesTypesFiltered = computed<EtapeType[]>(() =>
    props.etapesTypesIds
      .map(id => EtapesTypes[id])
      .filter(({ nom }) => {
        return nom.toLowerCase().includes(etapeTypeSearch.value)
      })
  )

  const etapeTypeExistante = computed<Pick<EtapeType, 'id'>[]>(() => (etapeTypeId.value ? [{ id: etapeTypeId.value }] : []))

  return () => (
    <div>
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
              items: etapesTypesFiltered.value,
              minInputLength: 0,
              itemKey: 'id',
              itemChipLabel: item => item.nom,
              onSelectItem: (type: EtapeType | undefined) => {
                if (type) {
                  etapeTypeSearch.value = ''
                  const statuts = getEtapesStatuts(type.id)
                  if (statuts.length === 1) {
                    etapeStatutId.value = statuts[0].id
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

      {props.etapeIsDemandeEnConstruction ? null : (
        <SelectStatut
          typeId={etapeTypeId.value}
          statutId={etapeStatutId.value}
          onStatutChange={statutId => {
            etapeStatutId.value = statutId
            props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
          }}
        />
      )}
    </div>
  )
})
