import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { CaminoDate } from 'camino-common/src/date'
import {
  EtapeStatut,
  EtapeStatutId
} from 'camino-common/src/static/etapesStatuts'
import {
  EtapesTypes,
  EtapeType,
  EtapeTypeId
} from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { computed, watch, ref } from 'vue'
import { TypeAhead } from '../_ui/typeahead'

export type Props = {
  userIsAdmin: boolean
  etape: {
    statutId: EtapeStatutId | null
    type?: { id: EtapeTypeId }
  }
  etapesTypesIds: EtapeTypeId[]
  etapeIsDemandeEnConstruction?: boolean
}

type Emits = {
  completeUpdate: (e: boolean) => void
  'update:etape': (e: Props['etape']) => void
  typeUpdate: (e: EtapeTypeId) => void
}

const SelectStatut = (etape: Props['etape'], etapesStatuts: EtapeStatut[]) => {
  return (
    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Statut</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <select v-model={etape.statutId} class="p-s">
            {etapesStatuts.map(etapeStatut => (
              <option
                key={etapeStatut.id}
                value={etapeStatut.id}
                disabled={etape.statutId === etapeStatut.id}
              >
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

export const TypeEdit = caminoDefineComponent<Props, Emits>({
  setup(props: Props, { emit }) {
    const etapeTypeSearch = ref<string>('')

    const completeUpdate = () => {
      // TODO 2023-01-02: comment mieux gérer la modification de la props
      emit('completeUpdate', complete.value)
      emit('update:etape', props.etape)
    }

    const etapesTypesFiltered = computed<EtapeType[]>(() =>
      props.etapesTypesIds
        .map(id => EtapesTypes[id])
        .filter(({ nom }) => {
          return nom.toLowerCase().includes(etapeTypeSearch.value)
        })
    )

    const etapesStatuts = computed<EtapeStatut[]>(() =>
      props.etape.type?.id ? getEtapesStatuts(props.etape.type?.id) : []
    )

    const etapeTypeExistante = computed<Pick<EtapeType, 'id'>[]>(() =>
      props.etape.type?.id ? [{ id: props.etape.type?.id }] : []
    )

    const complete = computed<boolean>(() => {
      if (props.userIsAdmin) {
        return props.etapeIsDemandeEnConstruction
          ? !!props.etape.type?.id
          : !!(props.etape.type?.id && props.etape.statutId)
      }

      return !!props.etape.type?.id
    })

    watch(
      () => complete.value,
      () => completeUpdate()
    )
    watch(
      () => etapesStatuts.value,
      () => {
        if (etapesStatuts.value.length === 1) {
          props.etape.statutId = etapesStatuts.value[0].id
        } else {
          props.etape.statutId = null
        }
      }
    )

    completeUpdate()

    return () => (
      <div>
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Type</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <TypeAhead
              id="select-etape-type"
              type="single"
              placeholder=""
              items={etapesTypesFiltered.value}
              overrideItems={etapeTypeExistante.value}
              minInputLength={0}
              itemKey="id"
              itemChipLabel={item => item.nom}
              onSelectItem={(type: EtapeType | undefined) => {
                if (type) {
                  props.etape.type = { id: type.id }
                  etapeTypeSearch.value = ''
                  emit('typeUpdate', type.id)
                }
              }}
              onInput={(searchTerm: string) =>
                (etapeTypeSearch.value = searchTerm)
              }
            />
          </div>
        </div>
        <hr />

        {etapesStatuts.value.length && !props.etapeIsDemandeEnConstruction
          ? SelectStatut(props.etape, etapesStatuts.value)
          : null}
      </div>
    )
  }
})

TypeEdit.props = [
  'userIsAdmin',
  'etape',
  'etapesTypesIds',
  'etapeIsDemandeEnConstruction'
]
