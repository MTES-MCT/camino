import { ActiviteDocumentsEdit } from './activite/activite-documents-edit'
import { getPeriode } from 'camino-common/src/static/frequence'
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { AsyncData } from '@/api/client-rest'
import { Activite, ActiviteDocumentId, ActiviteId, ActiviteIdOrSlug, TempActiviteDocument, activiteIdOrSlugValidator } from 'camino-common/src/activite'
import { useRouter } from 'vue-router'
import { LoadingElement } from './_ui/functional-loader'
import { ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { ActiviteDeposePopup } from './activite/depose-popup'
import { SectionWithValue } from 'camino-common/src/sections'
import { ApiClient, apiClient } from '../api/api-client'
import { SectionsEdit } from './_common/new-sections-edit'
import { DsfrButton, DsfrLink } from './_ui/dsfr-button'
import { capitalize } from 'camino-common/src/strings'
import { Alert } from './_ui/alert'

export const ActiviteEdition = defineComponent(() => {
  const matomo = inject('matomo', null)
  const router = useRouter()

  const activiteId = computed<ActiviteIdOrSlug>(() => {
    return activiteIdOrSlugValidator.parse(router.currentRoute.value.params.activiteId)
  })

  return () => (
    <PureActiviteEdition
      apiClient={{
        ...apiClient,
        updateActivite: async (activiteId, activiteTypeId, sectionsWithValue, activiteDocumentIds, newTempDocuments) => {
          await apiClient.updateActivite(activiteId, activiteTypeId, sectionsWithValue, activiteDocumentIds, newTempDocuments)
          if (matomo) {
            // @ts-ignore
            matomo.trackEvent('activite', 'activite-enregistrer', ActivitesTypes[activiteTypeId].nom)
          }
        },
      }}
      goBack={(activiteId: ActiviteId): void => {
        router.push({ name: 'activite', params: { activiteId } })
      }}
      activiteId={activiteId.value}
    />
  )
})

export interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getActivite' | 'deposerActivite' | 'updateActivite'>
  activiteId: ActiviteIdOrSlug
  goBack: (activiteId: ActiviteId) => void
}

export const PureActiviteEdition = defineComponent<Props>(props => {
  const events = ref<{ saveKeyUp: boolean }>({ saveKeyUp: true })
  const documentsComplete = ref<{ complete: boolean; activiteDocumentIds: ActiviteDocumentId[]; tempsDocuments: TempActiviteDocument[] }>({
    complete: false,
    activiteDocumentIds: [],
    tempsDocuments: [],
  })
  const sectionsComplete = ref<{ complete: boolean; sectionsWithValue: SectionWithValue[] }>({ complete: false, sectionsWithValue: [] })

  const data = ref<AsyncData<Activite>>({ status: 'LOADING' })

  const deposePopupVisible = ref(false)
  const deposePopupOpen = async () => {
    await save(false)
    deposePopupVisible.value = true
  }

  const closeDeposePopup = () => {
    deposePopupVisible.value = false
  }

  const keyUp = (e: KeyboardEvent) => {
    if ((e.which || e.keyCode) === 13 && events.value.saveKeyUp && !deposePopupVisible.value && data.value.status === 'LOADED') {
      // $refs['save-button'].focus()
      save(true)
    }
  }

  onMounted(async () => {
    await init()
    document.addEventListener('keyup', keyUp)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyUp)
  })

  const init = async () => {
    try {
      data.value = { status: 'LOADING' }
      const result = await props.apiClient.getActivite(props.activiteId)
      data.value = { status: 'LOADED', value: result }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }

  const save = async (goBack: boolean) => {
    if (data.value.status === 'LOADED') {
      try {
        await props.apiClient.updateActivite(
          data.value.value.id,
          data.value.value.type_id,
          sectionsComplete.value.sectionsWithValue,
          documentsComplete.value.activiteDocumentIds,
          documentsComplete.value.tempsDocuments
        )
        if (goBack) {
          props.goBack(data.value.value.id)
        }
      } catch (e: any) {
        console.error('error', e)
        data.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }

  const activiteDocumentsCompleteUpdate = (activiteDocumentIds: ActiviteDocumentId[], tempsDocuments: TempActiviteDocument[], complete: boolean) => {
    documentsComplete.value = { complete, activiteDocumentIds, tempsDocuments }
  }

  const sectionsUpdate = (complete: boolean, sectionsWithValue: SectionWithValue[]) => {
    sectionsComplete.value = { complete, sectionsWithValue }
  }

  return () => (
    <div class="dsfr">
      <h1>Activité</h1>
      <LoadingElement
        data={data.value}
        renderItem={activite => {
          return (
            <>
              <div>
                <p>
                  <DsfrLink
                    to={{ name: 'titre', params: { id: activite.titre.slug } }}
                    label={capitalize(activite.titre.nom)}
                    icon={null}
                    disabled={false}
                    title={`Retourner vers le titre ${activite.titre.nom}`}
                  />
                </p>

                <div class="flex">
                  <h2 class="mb-s">
                    <span>{capitalize(ActivitesTypes[activite.type_id].nom)}</span> (
                    {activite.periode_id && ActivitesTypes[activite.type_id].frequenceId ? <span>{getPeriode(ActivitesTypes[activite.type_id].frequenceId, activite.periode_id)} </span> : null}{' '}
                    {activite.annee})
                  </h2>
                </div>

                <Alert
                  type="info"
                  title="Besoin d'aide pour remplir ce rapport ?"
                  class="fr-mb-2w"
                  description={() => (
                    <>
                      <div>Tous les champs doivent être remplis même s’il n’y a pas eu d’extraction. Le cas échéant, indiquer seulement 0, puis enregistrer.</div>
                      <div>
                        En cas de problème,{' '}
                        <a target="_blank" class="fr-link" href="https://camino.gitbook.io/guide-dutilisation/a-propos/contact" rel="noopener noreferrer" title="Page contact - site externe">
                          Contactez-nous
                        </a>
                      </div>
                    </>
                  )}
                />

                {ActivitesTypes[activite.type_id].description ? <div class="h6" v-html={ActivitesTypes[activite.type_id].description} /> : null}

                <SectionsEdit sectionsWithValue={activite.sections_with_value} completeUpdate={sectionsUpdate} />

                <ActiviteDocumentsEdit apiClient={props.apiClient} activiteDocuments={activite.activite_documents} activiteTypeId={activite.type_id} completeUpdate={activiteDocumentsCompleteUpdate} />

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end' }} class="fr-pb-2w">
                  <DsfrButton title="Enregistrer" buttonType="secondary" buttonSize="lg" onClick={() => save(true)} class="fr-mr-2w" />
                  <DsfrButton
                    title="Enregistrer et déposer"
                    buttonType="primary"
                    buttonSize="lg"
                    disabled={!sectionsComplete.value.complete || !documentsComplete.value.complete}
                    onClick={deposePopupOpen}
                  />
                </div>
              </div>
              {deposePopupVisible.value ? (
                <ActiviteDeposePopup
                  close={closeDeposePopup}
                  activite={activite}
                  apiClient={{
                    ...props.apiClient,
                    deposerActivite: async activiteId => {
                      await props.apiClient.deposerActivite(activiteId)
                      props.goBack(activiteId)
                    },
                  }}
                />
              ) : null}
            </>
          )
        }}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureActiviteEdition.props = ['apiClient', 'activiteId', 'goBack']
