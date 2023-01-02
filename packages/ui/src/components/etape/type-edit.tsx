import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { CaminoDate } from 'camino-common/src/date'
import {
  EtapeStatut,
  EtapeStatutId
} from 'camino-common/src/static/etapesStatuts'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { computed, watch, ref, defineComponent, Prop } from 'vue'
import InputDate from '../_ui/input-date.vue'
import SimpleTypehead from '../_ui/typeahead.vue'

export type Props = {
  userIsAdmin: boolean
  etape: {
    statutId: EtapeStatutId | null
    incertitudes: { date: boolean }
    date?: CaminoDate
    type?: { id: EtapeTypeId }
  }
  etapesTypesIds: EtapeTypeId[]
  etapeIsDemandeEnConstruction?: boolean
}

type Emits = {
  completeUpdate: (e: boolean) => true
  'update:etape': (e: Props['etape']) => true
  typeUpdate: (e: EtapeTypeId) => true
}

const SelectDate = (etape: Props['etape']) => {
  return (
    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Date</h5>
      </div>
      <div class="tablet-blob-2-3">
        <InputDate v-model={etape.date} class="mb-s" />
        <div class="h6">
          {etape.date ? (
            <label>
              <input
                v-model={etape.incertitudes.date}
                type="checkbox"
                class="mr-xs"
              />
              Incertain
            </label>
          ) : null}
        </div>
      </div>

      <hr />
    </div>
  )
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
      // TODO comment mieux gérer la modification de la props
      emit('completeUpdate', complete.value)
      emit('update:etape', props.etape)
    }

    const etapesTypesIdsFiltered = computed<EtapeTypeId[]>(() =>
      props.etapesTypesIds.filter(id => {
        const etapeType = EtapesTypes[id]

        return etapeType.nom.toLowerCase().includes(etapeTypeSearch.value)
      })
    )

    const etapesStatuts = computed<EtapeStatut[]>(() =>
      props.etape.type?.id ? getEtapesStatuts(props.etape.type?.id) : []
    )

    const etapeTypeExistante = computed<EtapeTypeId[]>(() =>
      props.etape.type?.id ? [props.etape.type?.id] : []
    )

    const complete = computed<boolean>(() => {
      if (props.userIsAdmin) {
        return props.etapeIsDemandeEnConstruction
          ? !!(props.etape.type?.id && props.etape.date)
          : !!(props.etape.type?.id && props.etape.date && props.etape.statutId)
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
        {props.userIsAdmin ? SelectDate(props.etape) : null}

        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Type</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <SimpleTypehead
              id="select-etape-type"
              type="single"
              placeholder=""
              items={etapesTypesIdsFiltered.value}
              overrideItems={etapeTypeExistante.value}
              minInputLength={0}
              itemKey={item => item}
              itemChipLabel={item => EtapesTypes[item].nom}
              onSelectItem={(typeId: EtapeTypeId) => {
                props.etape.type = { id: typeId }
                etapeTypeSearch.value = ''
                emit('typeUpdate', typeId)
              }}
              onOnInput={(searchTerm: string) =>
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
