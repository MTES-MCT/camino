import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { AVIS_VISIBILITY_IDS, AvisStatutIds, AvisTypeId, AvisTypes, AvisVisibilityId, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { TempDocumentName } from 'camino-common/src/document'
import { NonEmptyArray, Nullable, isNotNullNorUndefined, map } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'
import { EtapeAvisModification, TempEtapeAvis, etapeAvisModificationValidator, tempEtapeAvisValidator } from 'camino-common/src/etape'
import { useState } from '../../utils/vue-tsx-utils'
import { DsfrSelect } from '../_ui/dsfr-select'
import { TypeaheadSmartSingle } from '../_ui/typeahead-smart-single'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { User, isEntrepriseOrBureauDEtude } from 'camino-common/src/roles'
import { getAvisVisibilityLabel } from './etape-avis'

interface Props {
  close: (document: EtapeAvisModification | null) => void
  avisTypeIds: NonEmptyArray<AvisTypeId>
  initialAvis: EtapeAvisModification | null
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
  user: User
}

export const AddEtapeAvisPopup = defineComponent<Props>(props => {
  const etapeAvisTypeId = ref<AvisTypeId | null>(props.avisTypeIds.length === 1 ? props.avisTypeIds[0] : null)
  const etapeAvisFile = ref<File | null>(null)
  const avisDescription = ref<string>(props.initialAvis?.description ?? '')
  const [avisDate, setAvisDate] = useState(props.initialAvis?.date ?? null)
  const [avisStatutId, setAvisStatutId] = useState(props.initialAvis?.avis_statut_id ?? null)
  const [avisVisibilityId, setAvisVisibilityId] = useState(props.initialAvis?.avis_visibility_id ?? null)

  const tempAvisName = ref<TempDocumentName | undefined>(isNotNullNorUndefined(props.initialAvis) && 'temp_document_name' in props.initialAvis ? props.initialAvis.temp_document_name : undefined)

  const visibilityChoices = computed<{ itemId: AvisVisibilityId; legend: { main: string } }[]>(() => {
    return AVIS_VISIBILITY_IDS.filter(visibility => {
      if (isEntrepriseOrBureauDEtude(props.user) && visibility === AvisVisibilityIds.Administrations) {
        return false
      }

      return true
    }).map(visibility => ({ itemId: visibility, legend: { main: getAvisVisibilityLabel(visibility) } }))
  })
  const descriptionChange = (value: string) => {
    avisDescription.value = value
  }

  const updateAvisTypeId = (avisTypeId: AvisTypeId | null) => {
    etapeAvisTypeId.value = avisTypeId
  }

  const visibilityChange = (value: AvisVisibilityId) => {
    setAvisVisibilityId(value)
  }
  const content = () => (
    <form>
      {props.avisTypeIds.length === 1 ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <div class="fr-select-group">
              <label class="fr-label" for="type">
                Type d'avis
              </label>
              <TypeaheadSmartSingle initialValue={props.initialAvis?.avis_type_id} possibleValues={props.avisTypeIds.map(id => AvisTypes[id])} valueIdSelected={updateAvisTypeId} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <InputFile
            accept={['pdf']}
            uploadFile={file => {
              etapeAvisFile.value = file
            }}
          />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Description' }} initialValue={avisDescription.value} type={{ type: 'text' }} valueChanged={descriptionChange} />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Date' }} type={{ type: 'date' }} initialValue={avisDate.value} valueChanged={setAvisDate} />
        </div>

        <div class="fr-fieldset__element">
          <DsfrSelect legend={{ main: 'Statut' }} items={map(AvisStatutIds, avis => ({ id: avis, label: avis }))} initialValue={avisStatutId.value} valueChanged={setAvisStatutId} />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInputRadio legend={{ main: 'Visibilité' }} elements={visibilityChoices.value} initialValue={avisVisibilityId.value} valueChanged={visibilityChange} />
        </div>
      </fieldset>
    </form>
  )

  const tempAvis = computed<Nullable<Omit<TempEtapeAvis, 'temp_document_name'>>>(() => ({
    avis_type_id: etapeAvisTypeId.value,
    description: avisDescription.value,
    date: avisDate.value,
    avis_statut_id: avisStatutId.value,
    avis_visibility_id: avisVisibilityId.value,
    has_file: false,
  }))

  const canSave = computed<boolean>(() => {
    return tempEtapeAvisValidator.omit({ temp_document_name: true }).safeParse(tempAvis.value).success && (etapeAvisFile.value !== null || isNotNullNorUndefined(props.initialAvis))
  })

  return () => (
    <FunctionalPopup
      title={props.avisTypeIds.length === 1 ? `${isNotNullNorUndefined(props.initialAvis) ? 'Éditer' : 'Ajouter'} ${AvisTypes[props.avisTypeIds[0]].nom}` : "Ajout d'un document"}
      content={content}
      close={() => {
        props.close(null)
      }}
      validate={{
        action: async () => {
          if (etapeAvisFile.value !== null) {
            tempAvisName.value = await props.apiClient.uploadTempDocument(etapeAvisFile.value)
          }
          const value = { ...props.initialAvis, ...tempAvis.value, temp_document_name: tempAvisName.value }

          const parsed = etapeAvisModificationValidator.safeParse(value)

          if (parsed.success) {
            props.close(parsed.data)
          } else {
            console.error(parsed.error)
          }
        },
      }}
      canValidate={canSave.value}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
AddEtapeAvisPopup.props = ['close', 'apiClient', 'avisTypeIds', 'initialAvis', 'user']
