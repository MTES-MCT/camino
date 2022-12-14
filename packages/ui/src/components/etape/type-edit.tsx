import { CaminoDate } from 'camino-common/src/date'
import {
  EtapeStatut,
  EtapeStatutId
} from 'camino-common/src/static/etapesStatuts'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { UnionToIntersection } from 'chart.js/types/utils'
import { computed, watch, ref } from 'vue'
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

// FIXME est-ce qu’on peut mieux typer que ça ?
declare type EmitFn<
  Options,
  Event extends keyof Options = keyof Options
> = UnionToIntersection<
  {
    [key in Event]: Options[key] extends (...args: infer Args) => any
      ? (event: key, ...args: Args) => void
      : never
  }[Event]
>

type Emit = EmitFn<{
  completeUpdate: (e: boolean) => true
  'update:etape': (e: Props['etape']) => true
  typeUpdate: (e: EtapeTypeId) => true
}>

// FIXME si on met ça dans la function, ça ne marche pas
const etapeTypeSearch = ref<string>('')

export function TypeEdit(
  { etape, userIsAdmin, etapesTypesIds, etapeIsDemandeEnConstruction }: Props,
  { emit }: { emit: Emit }
) {
  const completeUpdate = () => {
    // FIXME comment mieux gérer la modification de la props
    emit('completeUpdate', complete.value)
    emit('update:etape', etape)
  }

  const etapesTypesIdsFiltered = computed<EtapeTypeId[]>(() =>
    etapesTypesIds.filter(id => {
      const etapeType = EtapesTypes[id]

      return etapeType.nom.toLowerCase().includes(etapeTypeSearch.value)
    })
  )

  const etapesStatuts = computed<EtapeStatut[]>(() =>
    etape.type?.id ? getEtapesStatuts(etape.type?.id) : []
  )
  const complete = computed<boolean>(() => {
    if (userIsAdmin) {
      return etapeIsDemandeEnConstruction
        ? !!(etape.type?.id && etape.date)
        : !!(etape.type?.id && etape.date && etape.statutId)
    }

    return !!etape.type?.id
  })

  // FIXME d’après les logs sur storybook on se fait spammer par completeUpdate
  watch(
    () => complete.value,
    () => completeUpdate()
  )
  watch(
    () => etapesStatuts.value,
    () => {
      if (etapesStatuts.value.length === 1) {
        etape.statutId = etapesStatuts.value[0].id
      } else {
        etape.statutId = null
      }
    }
  )

  completeUpdate()

  return (
    <div>
      {userIsAdmin ? (
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
      ) : null}

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
            overrideItems={[etape.type?.id]}
            minInputLength={0}
            // FIXME dans les params de SimpleTypeahead, le typage n’est pas découvert tout seul
            itemKey={item => item as EtapeTypeId}
            itemChipLabel={item => EtapesTypes[item as EtapeTypeId].nom}
            onSelectItem={(typeId: EtapeTypeId) => {
              etape.type = { id: typeId }
              emit('typeUpdate', typeId)
            }}
            onOnInput={(searchTerm: string) =>
              (etapeTypeSearch.value = searchTerm)
            }
          />
        </div>
      </div>
      <hr />

      {etapesStatuts.value.length && !etapeIsDemandeEnConstruction ? (
        <div>
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 tablet-pt-s pb-s">
              <h5>Statut</h5>
            </div>
            <div class="mb tablet-blob-2-3">
              <select v-model={etape.statutId} class="p-s">
                {etapesStatuts.value.map(etapeStatut => (
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
      ) : null}
    </div>
  )
}
