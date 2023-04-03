import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed, inject, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DemarcheTypeId, isDemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDemarchesTypesByTitreType } from 'camino-common/src/static/titresTypesDemarchesTypes'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
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

export const DemarcheEditPopup = caminoDefineComponent<Omit<Props, 'reload' | 'displayMessage'>>(['demarche', 'titreNom', 'titreTypeId', 'tabId', 'apiClient', 'close'], props => {
  const store = useStore()
  return () => (
    <PureDemarcheEditPopup
      apiClient={props.apiClient}
      close={props.close}
      demarche={props.demarche}
      titreTypeId={props.titreTypeId}
      titreNom={props.titreNom}
      tabId={props.tabId}
      reload={() => store.dispatch('titre/get', props.demarche.titreId, { root: true })}
      displayMessage={() => store.dispatch('messageAdd', { value: `le titre a été mis à jour`, type: 'success' }, { root: true })}
    />
  )
})

export const PureDemarcheEditPopup = caminoDefineComponent<Props>(['demarche', 'titreNom', 'titreTypeId', 'tabId', 'apiClient', 'close', 'reload', 'displayMessage'], props => {
  const matomo = inject('matomo', null)
  const typeId = ref<DemarcheTypeId | null>(props.demarche.typeId ?? null)
  const description = ref<string>(props.demarche.description ?? '')

  const title = computed(() => {
    return `${props.demarche.id ? 'Modification de la' : "Ajout d'une"} démarche ${props.tabId === 'travaux' ? 'de travaux' : ''}`
  })

  const types = computed(() => {
    return getDemarchesTypesByTitreType(props.titreTypeId).filter(t => (props.tabId === 'travaux' ? t.travaux : !t.travaux))
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
    <form>
      <div class="fr-input-group">
        <label class="fr-label" for="demarcheType">
          Type de la démarche *
        </label>
        <select class="fr-select" id="demarcheType" name="demarcheType" required disabled={!!props.demarche.id} onChange={selectDemarcheTypeId}>
          {!props.demarche?.typeId ? (
            <option value="" selected disabled hidden>
              Selectionnez une option
            </option>
          ) : null}
          {types.value.map(demarcheType => (
            <option key={demarcheType.id} value={demarcheType.id} selected={props.demarche?.typeId === demarcheType.id}>
              {demarcheType.nom}
            </option>
          ))}
        </select>
      </div>
      <div class="fr-input-group">
        <label class="fr-label" for="description">
          Description
        </label>
        <input onInput={updateDescription} value={description.value} class="fr-input" name="description" id="description" type="text" />
      </div>
    </form>
  )

  const save = async () => {
    if (typeId.value) {
      const demarche = {
        titreId: props.demarche.titreId,
        typeId: typeId.value,
        description: description.value,
      }
      if (props.demarche.id) {
        await props.apiClient.updateDemarche({
          ...demarche,
          id: props.demarche.id,
        })
      } else {
        await props.apiClient.createDemarche(demarche)
      }
      props.displayMessage()
      props.reload()
    }
    if (matomo) {
      // @ts-ignore
      matomo.trackEvent('titre-sections', `titre-${props.tabId}-enregistrer`, props.demarche.id)
    }
  }
  return () => <FunctionalPopup title={title.value} content={content} close={props.close} validate={{ action: save, can: !!typeId.value }} />
})
