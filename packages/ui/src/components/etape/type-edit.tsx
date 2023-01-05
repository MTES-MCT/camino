import {
  EtapeStatut,
  EtapeStatutId,
  isStatut
} from 'camino-common/src/static/etapesStatuts'
import {
  EtapesTypes,
  EtapeType,
  EtapeTypeId
} from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { computed, watch, ref, FunctionalComponent, defineComponent } from 'vue'
import { TypeAhead } from '../_ui/typeahead'

export type Props = {
  etape: {
    statutId: EtapeStatutId | null
    type?: { id: EtapeTypeId }
  }
  etapesTypesIds: EtapeTypeId[]
  etapeIsDemandeEnConstruction?: boolean
  onEtapeChange: (
    statutId: EtapeStatutId | null,
    typeId: EtapeTypeId | null
  ) => void
}

// FIXME 2023-01-03 : add to typescript vue type utils
const isEventWithTarget = (
  event: any
): event is InputEvent & { target: HTMLInputElement } => event.target

interface SelectStatutProps {
  statutId: EtapeStatutId | null
  typeId: EtapeTypeId | null
  onStatutChange: (statutId: EtapeStatutId | null) => void
}

const SelectStatut: FunctionalComponent<SelectStatutProps> = (
  props: SelectStatutProps
): JSX.Element => {
  const etapesStatuts: EtapeStatut[] = props.typeId
    ? getEtapesStatuts(props.typeId)
    : []

  let etapeStatutIdSelected: EtapeStatutId | null = props.statutId

  if (etapeStatutIdSelected === null && etapesStatuts.length === 1) {
    etapeStatutIdSelected = etapesStatuts[0].id
    props.onStatutChange(etapeStatutIdSelected)
  }

  return (
    <div>
      <div class="tablet-blobs">
        <div class="tablet-blob-1-3 tablet-pt-s pb-s">
          <h5>Statut</h5>
        </div>
        <div class="mb tablet-blob-2-3">
          <select
            onChange={event =>
              props.onStatutChange(
                isEventWithTarget(event) && isStatut(event.target.value)
                  ? event.target.value
                  : null
              )
            }
            class="p-s"
          >
            <option
              value={null}
              selected={etapeStatutIdSelected === null}
            ></option>
            {etapesStatuts.map(etapeStatut => (
              <option
                key={etapeStatut.id}
                value={etapeStatut.id}
                selected={etapeStatutIdSelected === etapeStatut.id}
                disabled={etapeStatutIdSelected === etapeStatut.id}
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

export const TypeEdit = defineComponent<Props>({
  setup(props: Props) {
    const etapeTypeSearch = ref<string>('')

    const etapesTypesFiltered = computed<EtapeType[]>(() =>
      props.etapesTypesIds
        .map(id => EtapesTypes[id])
        .filter(({ nom }) => {
          return nom.toLowerCase().includes(etapeTypeSearch.value)
        })
    )

    const etapeTypeExistante = computed<Pick<EtapeType, 'id'>[]>(() =>
      props.etape.type?.id ? [{ id: props.etape.type?.id }] : []
    )

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
                  etapeTypeSearch.value = ''
                  props.onEtapeChange(null, type.id)
                }
              }}
              onInput={(searchTerm: string) =>
                (etapeTypeSearch.value = searchTerm)
              }
            />
          </div>
        </div>
        <hr />

        {props.etapeIsDemandeEnConstruction ? null : (
          <SelectStatut
            typeId={props.etape?.type?.id ?? null}
            statutId={props.etape.statutId}
            onStatutChange={statutId =>
              props.onEtapeChange(statutId, props.etape.type?.id ?? null)
            }
          />
        )}
      </div>
    )
  }
})

TypeEdit.props = [
  'etape',
  'onEtapeChange',
  'etapesTypesIds',
  'etapeIsDemandeEnConstruction'
]
