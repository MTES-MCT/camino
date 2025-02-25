import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { AVIS_TYPES, AVIS_VISIBILITY_IDS, AvisStatutId, AvisTypeId, AvisVisibilityId, AvisVisibilityIds, getAvisNom, getAvisStatut } from 'camino-common/src/static/avisTypes'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { TempDocumentName } from 'camino-common/src/document'
import { NonEmptyArray, Nullable, isNotNullNorUndefined, isNullOrUndefined, map } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'
import { EtapeAvisModification, TempEtapeAvis, etapeAvisModificationValidator, etapeAvisWithoutIdValidator } from 'camino-common/src/etape'
import { useState } from '../../utils/vue-tsx-utils'
import { DsfrSelect } from '../_ui/dsfr-select'
import { TypeaheadSmartSingle } from '../_ui/typeahead-smart-single'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { User, isEntrepriseOrBureauDEtude } from 'camino-common/src/roles'
import { getAvisVisibilityLabel } from './etape-avis'
import { DsfrTextarea } from '../_ui/dsfr-textarea'

interface Props {
  close: (document: EtapeAvisModification | null) => void
  avisTypeIds: NonEmptyArray<AvisTypeId>
  required: boolean
  initialAvis: EtapeAvisModification | null
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
  user: User
}

export const AddEtapeAvisPopup = defineComponent<Props>(props => {
  const [etapeAvisTypeId, setEtapeAvisTypeId] = useState(props.initialAvis?.avis_type_id ?? (props.avisTypeIds.length === 1 ? props.avisTypeIds[0] : null))
  const etapeAvisFile = ref<File | null>(null)
  const avisDescription = ref<string>(props.initialAvis?.description ?? '')
  const [avisDate, setAvisDate] = useState(props.initialAvis?.date ?? null)
  const [avisStatutId, setAvisStatutId] = useState<AvisStatutId | null>(props.initialAvis?.avis_statut_id ?? null)
  const [avisVisibilityId, setAvisVisibilityId] = useState(props.initialAvis?.avis_visibility_id ?? null)

  const tempAvisName = ref<TempDocumentName | undefined>(isNotNullNorUndefined(props.initialAvis) && 'temp_document_name' in props.initialAvis ? props.initialAvis.temp_document_name : undefined)

  const avisStatuts = computed<Readonly<NonEmptyArray<{ id: AvisStatutId; label: string }>>>(() => {
    return map(getAvisStatut(etapeAvisTypeId.value, props.required), id => ({ id, label: id }))
  })
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
    setEtapeAvisTypeId(avisTypeId)
    setAvisStatutId(null)
  }

  const visibilityChange = (value: AvisVisibilityId) => {
    setAvisVisibilityId(value)
  }
  const content = () => (
    <form>
      {props.avisTypeIds.length === 1 || isNotNullNorUndefined(props.initialAvis) ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <div class="fr-select-group">
              <label class="fr-label" for="avis_type">
                Type d'avis
              </label>
              <TypeaheadSmartSingle id="avis_type" possibleValues={props.avisTypeIds.map(id => ({ id: id, nom: getAvisNom(id) }))} valueIdSelected={updateAvisTypeId} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <InputFile
            required={false}
            accept={['pdf']}
            uploadFile={file => {
              etapeAvisFile.value = file
            }}
          />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInput id="nouvel_avis_date" legend={{ main: 'Date' }} required={true} type={{ type: 'date' }} initialValue={avisDate.value} valueChanged={setAvisDate} />
        </div>
        <div class="fr-fieldset__element">
          <DsfrSelect
            id="nouvel_avis_statut"
            legend={{ main: 'Statut' }}
            disabled={isNullOrUndefined(etapeAvisTypeId.value)}
            required={true}
            items={avisStatuts.value}
            initialValue={avisStatutId.value}
            valueChanged={setAvisStatutId}
          />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInputRadio
            id="avis_visibility"
            legend={{ main: 'Visibilité' }}
            required={true}
            elements={visibilityChoices.value}
            initialValue={avisVisibilityId.value}
            valueChanged={visibilityChange}
          />
        </div>
        <div class="fr-fieldset__element" style={{ order: etapeAvisTypeId.value === AVIS_TYPES.autreAvis ? -1 : undefined }}>
          <DsfrTextarea
            id="avis_description"
            required={etapeAvisTypeId.value === AVIS_TYPES.autreAvis}
            legend={{ main: 'Description' }}
            initialValue={avisDescription.value}
            valueChanged={descriptionChange}
          />
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
    return etapeAvisWithoutIdValidator.safeParse(tempAvis.value).success
  })

  return () => (
    <FunctionalPopup
      title={
        isNotNullNorUndefined(props.initialAvis)
          ? `Éditer ${getAvisNom(props.initialAvis.avis_type_id)}`
          : props.avisTypeIds.length === 1
            ? `Ajouter ${getAvisNom(props.avisTypeIds[0])}`
            : "Ajout d'un avis"
      }
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
AddEtapeAvisPopup.props = ['close', 'apiClient', 'avisTypeIds', 'initialAvis', 'user', 'required']
