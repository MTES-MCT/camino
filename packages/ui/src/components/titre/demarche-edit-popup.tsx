import { isTitreType, TitresTypes, TitreTypeId } from "camino-common/src/static/titresTypes";
import { TitresTypesTypes } from "camino-common/src/static/titresTypesTypes";
import { computed, defineComponent, inject, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import { FunctionalPopup } from "../_ui/functional-popup";
import { sortedDemarchesTypes, DemarcheTypeId, isDemarcheTypeId } from "camino-common/src/static/demarchesTypes"
import { isEventWithTarget } from "@/utils/vue-tsx-utils";
import { DemarcheApiClient } from "./demarche-api-client";
import { AsyncData } from "@/api/client-rest";
import { LoadingElement } from "../_ui/functional-loader";

interface Props {
  demarche: { titreId: string, id?: string, typeId?: DemarcheTypeId, description?: string }
  titreNom: string
  titreTypeId: TitreTypeId
  tabId: string,
  apiClient: DemarcheApiClient
}

export const DemarcheEditPopup = defineComponent<Props>({
  props: ['demarche', 'titreNom', 'titreTypeId', 'tabId', 'apiClient'] as unknown as undefined,
  setup(props) {
    const store = useStore()
    const matomo = inject('matomo', null)


    const demarcheProcess = ref<AsyncData<null>>({status: "LOADED", value: null })
    const typeId = ref<DemarcheTypeId | null>(props.demarche.typeId ?? null)
    const description = ref<string>(props.demarche.description ?? '')


    const saveButton = ref<HTMLButtonElement | null>(null)

    const titreTypeNom = computed(() => {
      return isTitreType(props.titreTypeId)
        ? TitresTypesTypes[TitresTypes[props.titreTypeId].typeId].nom
        : ''
    })

    const label = computed(() => {
      return `${
        props.demarche.id ? 'Modification de la': "Ajout d'une" 
      } démarche ${props.tabId === 'travaux' ? 'de travaux' : ''}`
    })

    const messages = computed(() =>  {
      return store.state.popup.messages ?? []
    })

    const types = computed(() => {
      return sortedDemarchesTypes.filter(t =>
        props.tabId === 'travaux' ? t.travaux : !t.travaux
      )
    })

    const complete = computed<boolean>(()=> {
      return !!typeId.value
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

  const content  = () => (<div>
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
          {!props.demarche?.typeId ? (<option>-</option>) : null}
          {types.value.map(demarcheType => (<option
            key={demarcheType.id}
            value={demarcheType.id}
            selected={props.demarche?.typeId === demarcheType.id}
          >
            { demarcheType.nom }
          </option>))}
          
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
  </div>)
  const header = () => (<div>
    <h6>
      <span class="cap-first"><span class="cap-first"> { props.titreNom } </span><span class="color-neutral"> | </span><span class="cap-first">
          { titreTypeNom.value }
        </span>
      </span>
    </h6>
    <h2 class="cap-first">
      { label.value }
    </h2>
  </div>)
  const footer = () => (<div class="tablet-blobs">
      <div class="tablet-blob-1-3 mb tablet-mb-0">
        <button class="btn-border rnd-xs p-s full-x" onClick={cancel}>
          Annuler
        </button>
      </div>
      <div class="tablet-blob-2-3">
        <LoadingElement data={demarcheProcess.value} renderItem={() => <button
          ref={saveButton}
          disabled={!complete.value}
          class={`${!complete.value ? 'disabled': ''} btn btn-primary`}
          onClick={save}
        >
          Enregistrer
        </button>} />
      </div>
    </div>)

const save = async () => {
  if (typeId.value) {
    demarcheProcess.value = {status: 'LOADING'}

    try {
    const demarche = {titreId: props.demarche.titreId, typeId: typeId.value, description: description.value}
    if (props.demarche.id) {
      await props.apiClient.updateDemarche({...demarche, id: props.demarche.id})
    } else {
      await props.apiClient.createDemarche(demarche)
    }

    demarcheProcess.value = {status: 'LOADED', value: null}
  }  catch (e: any) {
    console.error('error', e)
    demarcheProcess.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }


  if (matomo) {
    // @ts-ignore
    matomo.trackEvent('titre-sections', `titre-${props.tabId}-enregistrer`, demarche.id)
  }
  }
}

const cancel = () => {
  store.commit('popupClose')
}

const keyup = (e: KeyboardEvent) =>  {
  if ((e.which || e.keyCode) === 27) {
    cancel()
  } else if ((e.which || e.keyCode) === 13) {
    if (complete.value) {
      saveButton.value?.focus()
      save()
    }
  }
}

onMounted(() => {
  document.addEventListener('keyup', keyup)
})

onUnmounted(() => {
  document.removeEventListener('keyup', keyup)
})

  return () => (<FunctionalPopup messages={messages.value} header={header} footer={footer} content={content} />)
}})
