import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DemarcheTypeId, isDemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDemarchesTypesByTitreType } from 'camino-common/src/static/titresTypesDemarchesTypes'
import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { DemarcheApiClient } from './demarche-api-client'
import { DemarcheId, DemarcheSlug } from 'camino-common/src/demarche'
import { DsfrInput } from '../_ui/dsfr-input'
import { TitreId } from 'camino-common/src/titres'

export interface Props {
  demarche: {
    titreId: TitreId
    id?: DemarcheId
    typeId?: DemarcheTypeId
    description?: string | null
  }
  titreNom: string
  titreTypeId: TitreTypeId
  tabId: 'travaux' | 'demarches'
  apiClient: Pick<DemarcheApiClient, 'updateDemarche' | 'createDemarche'>
  close: () => void
  reload: (demarcheSlug: DemarcheSlug) => void
}

// TODO 2023-12-19: question POH, pour ajouter des travaux, on propose de mettre un radio bouton dans cette popup. Est-ce encore d'actualité ?
export const DemarcheEditPopup = caminoDefineComponent<Props>(['demarche', 'titreNom', 'titreTypeId', 'tabId', 'apiClient', 'close', 'reload'], props => {
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

  const descriptionChange = (value: string) => {
    description.value = value
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

      <DsfrInput legend={{ main: 'Description' }} type={{ type: 'text' }} valueChanged={descriptionChange} initialValue={description.value} />
    </form>
  )

  const save = async () => {
    if (typeId.value) {
      const demarche = {
        titreId: props.demarche.titreId,
        typeId: typeId.value,
        description: description.value,
      }
      let demarcheSlug = null
      if (props.demarche.id) {
        demarcheSlug = await props.apiClient.updateDemarche({
          ...demarche,
          id: props.demarche.id,
        })
      } else {
        demarcheSlug = await props.apiClient.createDemarche(demarche)
      }
      props.reload(demarcheSlug)
    }
  }

  return () => <FunctionalPopup title={title.value} content={content} close={props.close} validate={{ action: save }} canValidate={!!typeId.value} />
})
