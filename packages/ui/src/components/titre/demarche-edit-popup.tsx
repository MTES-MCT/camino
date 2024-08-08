import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getDemarchesTypesByTitreType } from 'camino-common/src/static/titresTypesDemarchesTypes'
import { DemarcheApiClient } from './demarche-api-client'
import { DemarcheId, DemarcheSlug } from 'camino-common/src/demarche'
import { DsfrInput } from '../_ui/dsfr-input'
import { TitreId } from 'camino-common/src/validators/titres'
import { DsfrSelect } from '../_ui/dsfr-select'
import { isNonEmptyArray } from 'camino-common/src/typescript-tools'
import { CaminoError } from 'camino-common/src/zod-tools'
import { CaminoApiAlert } from '../_ui/alert'

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
export const DemarcheEditPopup = defineComponent<Props>(props => {
  const typeId = ref<DemarcheTypeId | null>(props.demarche.typeId ?? null)
  const description = ref<string>(props.demarche.description ?? '')
  const error = ref<CaminoError<string> | null>(null)

  const title = computed(() => {
    return `${props.demarche.id ? 'Modification de la' : "Ajout d'une"} démarche ${props.tabId === 'travaux' ? 'de travaux' : ''}`
  })

  const typesLabel = computed(() => {
    return getDemarchesTypesByTitreType(props.titreTypeId)
      .filter(t => (props.tabId === 'travaux' ? t.travaux : !t.travaux))
      .map(t => ({ id: t.id, label: t.nom }))
  })

  const selectDemarcheTypeId = (e: DemarcheTypeId | null) => {
    typeId.value = e
  }

  const descriptionChange = (value: string) => {
    description.value = value
  }
  const content = () => (
    <form>
      {isNonEmptyArray(typesLabel.value) ? (
        <DsfrSelect legend={{ main: 'Type de la démarche' }} required={true} disabled={!!props.demarche.id} items={typesLabel.value} initialValue={typeId.value} valueChanged={selectDemarcheTypeId} />
      ) : null}
      <DsfrInput legend={{ main: 'Description' }} type={{ type: 'text' }} valueChanged={descriptionChange} initialValue={description.value} />

      {error.value !== null ? <CaminoApiAlert class="fr-mt-2w" caminoApiError={error.value} /> : null}
    </form>
  )

  const save = async () => {
    error.value = null
    if (typeId.value) {
      const demarche = {
        titreId: props.demarche.titreId,
        typeId: typeId.value,
        description: description.value,
      }
      if (props.demarche.id) {
        const demarcheSlug = await props.apiClient.updateDemarche({
          ...demarche,
          id: props.demarche.id,
        })
        props.reload(demarcheSlug)
      } else {
        const result = await props.apiClient.createDemarche(demarche)
        if ('slug' in result) {
          props.reload(result.slug)
        } else {
          error.value = result
        }
      }
    }
  }

  return () => <FunctionalPopup title={title.value} content={content} close={props.close} validate={{ action: save }} canValidate={!!typeId.value} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheEditPopup.props = ['demarche', 'titreNom', 'titreTypeId', 'tabId', 'apiClient', 'close', 'reload']
