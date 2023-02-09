import {
  isTitreType,
  TitresTypes,
  TitreTypeId
} from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { computed, defineComponent, inject, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import {
  DemarcheTypeId,
  isDemarcheTypeId
} from 'camino-common/src/static/demarchesTypes'
import { getDemarchesTypesByTitreType } from 'camino-common/src/static/titresTypesDemarchesTypes'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { DemarcheApiClient } from './demarche-api-client'
import { useStore } from 'vuex'

export interface Props {
  demarche: {
    titreId: string
    id?: string
    typeId?: DemarcheTypeId
    description?: string
  }
  titreNom: string
  titreTypeId: TitreTypeId
  tabId: string
  apiClient: Omit<DemarcheApiClient, 'deleteDemarche'>
  close: () => void
  reload: () => void
  displayMessage: () => void
}

export const DemarcheEditPopup = defineComponent<
  Omit<Props, 'reload' | 'displayMessage'>
>({
  props: [
    'demarche',
    'titreNom',
    'titreTypeId',
    'tabId',
    'apiClient',
    'close'
  ] as unknown as undefined,
  setup(props) {
    const store = useStore()
    return () => (
      <PureDemarcheEditPopup
        apiClient={props.apiClient}
        close={props.close}
        demarche={props.demarche}
        titreTypeId={props.titreTypeId}
        titreNom={props.titreNom}
        tabId={props.tabId}
        reload={() =>
          store.dispatch('titre/get', props.demarche.titreId, { root: true })
        }
        displayMessage={() =>
          store.dispatch(
            'messageAdd',
            { value: `le titre a été mis à jour`, type: 'success' },
            { root: true }
          )
        }
      />
    )
  }
})

export const PureDemarcheEditPopup = defineComponent<Props>({
  props: [
    'demarche',
    'titreNom',
    'titreTypeId',
    'tabId',
    'apiClient',
    'close',
    'reload',
    'displayMessage'
  ] as unknown as undefined,
  setup(props) {
    const matomo = inject('matomo', null)
    const typeId = ref<DemarcheTypeId | null>(props.demarche.typeId ?? null)
    const description = ref<string>(props.demarche.description ?? '')

    const titreTypeNom = computed(() => {
      return isTitreType(props.titreTypeId)
        ? TitresTypesTypes[TitresTypes[props.titreTypeId].typeId].nom
        : ''
    })

    const title = computed(() => {
      return `${
        props.demarche.id ? 'Modification de la' : "Ajout d'une"
      } démarche ${props.tabId === 'travaux' ? 'de travaux' : ''}`
    })

    const types = computed(() => {
      return getDemarchesTypesByTitreType(props.titreTypeId).filter(t =>
        props.tabId === 'travaux' ? t.travaux : !t.travaux
      )
    })

    const selectDemarcheTypeId = (e: Event) => {
      if (isEventWithTarget(e)) {
        if (isDemarcheTypeId(e.target.value)) {
          typeId.value = e.target.value
        } else {
          typeId.value = null
        }
      }
    }

    const updateDescription = (e: Event) => {
      if (isEventWithTarget(e)) {
        description.value = e.target.value
      }
    }

    const content = () => (
      <div>
        <div class="tablet-blobs">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Type</h5>
          </div>
          <div class="mb tablet-blob-2-3">
            <select
              class="p-s mr"
              disabled={!!props.demarche.id}
              onChange={selectDemarcheTypeId}
            >
              {!props.demarche?.typeId ? <option>-</option> : null}
              {types.value.map(demarcheType => (
                <option
                  key={demarcheType.id}
                  value={demarcheType.id}
                  selected={props.demarche?.typeId === demarcheType.id}
                >
                  {demarcheType.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div class="tablet-blobs mb-s">
          <div class="tablet-blob-1-3 tablet-pt-s pb-s">
            <h5>Description</h5>
            <p class="h6 italic mb-0 flex-right mt-xs">Optionnel</p>
          </div>
          <input
            onInput={updateDescription}
            type="text"
            class="tablet-blob-2-3 p-s"
            value={description.value}
          />
        </div>
      </div>
    )

    const save = async () => {
      if (typeId.value) {
        const demarche = {
          titreId: props.demarche.titreId,
          typeId: typeId.value,
          description: description.value
        }
        if (props.demarche.id) {
          await props.apiClient.updateDemarche({
            ...demarche,
            id: props.demarche.id
          })
        } else {
          await props.apiClient.createDemarche(demarche)
        }
        props.displayMessage()
        props.reload()
      }
      if (matomo) {
        // @ts-ignore
        matomo.trackEvent(
          'titre-sections',
          `titre-${props.tabId}-enregistrer`,
          props.demarche.id
        )
      }
    }
    return () => (
      <FunctionalPopup
        title={title.value}
        content={content}
        close={props.close}
        validate={{ action: save, can: !!typeId.value }}
      />
    )
  }
})
