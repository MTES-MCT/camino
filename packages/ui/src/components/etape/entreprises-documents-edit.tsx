import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { HelpTooltip } from '../_ui/help-tooltip'
import { dateFormat } from '@/utils'
import { Tag } from '../_ui/tag'
import { computed, onMounted, ref, watch } from 'vue'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId, entrepriseDocumentIdValidator, isEntrepriseId } from 'camino-common/src/entreprise'
import { DocumentsTypes, EntrepriseDocumentType, EntrepriseDocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { getEntries, getKeys, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { AddEntrepriseDocumentPopup } from '../entreprise/add-entreprise-document-popup'
import { AsyncData, getDownloadRestRoute } from '@/api/client-rest'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { EtapeId } from 'camino-common/src/etape'
import { LoadingElement } from '../_ui/functional-loader'
import { ButtonIcon } from '../_ui/button-icon'
import { ApiClient } from '@/api/api-client'

type Entreprise = { id: EntrepriseId; nom: string }

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  completeUpdate: (etapeEntrepriseDocumentIds: EntrepriseDocumentId[], complete: boolean) => void
  entreprises: Entreprise[]
  etapeId: EtapeId
  apiClient: Pick<ApiClient, 'creerEntrepriseDocument' | 'getEntrepriseDocuments' | 'getEtapeEntrepriseDocuments' | 'uploadTempDocument'>
}

interface InnerEntrepriseDocument {
  id: EntrepriseDocumentId | ''
  documents: EntrepriseDocument[]
  entrepriseDocumentType: EntrepriseDocumentType
}

export const EntrepriseDocumentsEdit = caminoDefineComponent<Props>(['completeUpdate', 'tde', 'entreprises', 'etapeId', 'apiClient'], props => {
  const etapeEntrepriseDocumentIds = ref<AsyncData<EntrepriseDocumentId[]>>({ status: 'LOADING' })

  const loadEtapeEntrepriseDocuments = async () => {
    etapeEntrepriseDocumentIds.value = { status: 'LOADING' }
    try {
      const etapeDocuments = await props.apiClient.getEtapeEntrepriseDocuments(props.etapeId)

      etapeEntrepriseDocumentIds.value = { status: 'LOADED', value: etapeDocuments.map(({ id }) => id) }
    } catch (e: any) {
      console.error('error', e)
      etapeEntrepriseDocumentIds.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }

  onMounted(async () => {
    await loadEtapeEntrepriseDocuments()
  })

  return () => (
    <LoadingElement
      data={etapeEntrepriseDocumentIds.value}
      renderItem={items => (
        <InternalEntrepriseDocumentsEdit
          completeUpdate={props.completeUpdate}
          tde={props.tde}
          entreprises={props.entreprises}
          etapeId={props.etapeId}
          apiClient={props.apiClient}
          etapeEntrepriseDocumentIds={items}
        />
      )}
    />
  )
})

const InternalEntrepriseDocumentsEdit = caminoDefineComponent<Props & { etapeEntrepriseDocumentIds: EntrepriseDocumentId[] }>(
  ['completeUpdate', 'tde', 'entreprises', 'etapeId', 'apiClient', 'etapeEntrepriseDocumentIds'],
  props => {
    const entreprisesEntrepriseDocumentsIndex = ref<Record<EntrepriseId, { entreprisedocuments: InnerEntrepriseDocument[] }>>({})
    const etapeEntrepriseDocumentIds = ref<EntrepriseDocumentId[]>(props.etapeEntrepriseDocumentIds)

    const addPopup = ref<{ open: false } | { open: true; entrepriseId: EntrepriseId; entrepriseDocumentTypeId: EntrepriseDocumentTypeId }>({ open: false })
    const entreprisesNoms = computed<Record<EntrepriseId, string>>(() => {
      return props.entreprises.reduce<Record<EntrepriseId, string>>((acc, e) => {
        acc[e.id] = e.nom

        return acc
      }, {})
    })
    const tdeEntrepriseDocuments = computed<EntrepriseDocumentType[]>(() => {
      return getEntrepriseDocuments(props.tde.titreTypeId, props.tde.demarcheTypeId, props.tde.etapeTypeId)
    })
    const entrepriseDocuments = ref<AsyncData<{ [key in EntrepriseId]?: EntrepriseDocument[] }>>({ status: 'LOADING' })

    const loadEntrepriseDocuments = async () => {
      entrepriseDocuments.value = { status: 'LOADING' }
      try {
        const loadingEntrepriseDocuments: Record<EntrepriseId, EntrepriseDocument[]> = {}
        for (const entreprise of props.entreprises) {
          loadingEntrepriseDocuments[entreprise.id] = await props.apiClient.getEntrepriseDocuments(entreprise.id)
        }
        entrepriseDocuments.value = { status: 'LOADED', value: loadingEntrepriseDocuments }
        await reset()
      } catch (e: any) {
        console.error('error', e)
        entrepriseDocuments.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }

    const complete = computed<boolean>(() => {
      const entreprisedocuments: EntrepriseDocument[] = []
      const documents = entrepriseDocuments.value
      if (documents.status === 'LOADED') {
        props.entreprises.forEach(entreprise => {
          documents.value[entreprise.id]?.forEach(document => {
            if (etapeEntrepriseDocumentIds.value.some(id => id === document.id)) {
              entreprisedocuments.push(document)
            }
          })
        })

        return tdeEntrepriseDocuments.value.every(
          tdeEntrepriseDocument => tdeEntrepriseDocument.optionnel || entreprisedocuments.find(({ entreprise_document_type_id }) => entreprise_document_type_id === tdeEntrepriseDocument.id)
        )
      }

      return false
    })

    const reset = async () => {
      indexReset()
      entreprisedocumentsReset()
    }

    const indexReset = () => {
      const entrepriseDocumentsLoaded = entrepriseDocuments.value
      if (entrepriseDocumentsLoaded.status === 'LOADED') {
        entreprisesEntrepriseDocumentsIndex.value = {}

        props.entreprises.forEach(e => {
          entreprisesEntrepriseDocumentsIndex.value[e.id] = {
            entreprisedocuments: [],
          }

          tdeEntrepriseDocuments.value.forEach(type => {
            const documents = entrepriseDocumentsLoaded.value[e.id]?.filter(d => d.entreprise_document_type_id === type.id) ?? []
            const documentsIds = documents.map(({ id }) => id)

            const entrepriseDocumentIds = etapeEntrepriseDocumentIds.value.filter(id => documentsIds.includes(id))

            if (entrepriseDocumentIds.length) {
              entrepriseDocumentIds.forEach(id => {
                entreprisesEntrepriseDocumentsIndex.value[e.id].entreprisedocuments.push({
                  id,
                  entrepriseDocumentType: type,
                  documents,
                })
              })
            } else if (!type.optionnel) {
              entreprisesEntrepriseDocumentsIndex.value[e.id].entreprisedocuments.push({
                id: '',
                entrepriseDocumentType: type,
                documents,
              })
            }
          })
        })
      }
    }

    const entreprisedocumentAdd = (entrepriseId: EntrepriseId, event: Event) => {
      if (isEventWithTarget(event) && entrepriseDocuments.value.status === 'LOADED') {
        const typeId = event.target.value
        const type = tdeEntrepriseDocuments.value.find(jt => jt.id === typeId)
        const documents = entrepriseDocuments.value.value[entrepriseId]?.filter(d => d.entreprise_document_type_id === typeId) ?? []

        if (type) {
          entreprisesEntrepriseDocumentsIndex.value[entrepriseId].entreprisedocuments.push({
            id: '',
            entrepriseDocumentType: type,
            documents,
          })
        }
      }
    }

    const completeUpdate = () => {
      props.completeUpdate(etapeEntrepriseDocumentIds.value, complete.value)
    }

    const entreprisedocumentsUpdate = (entreprisedocument: InnerEntrepriseDocument, entrepriseId: EntrepriseId, event: Event) => {
      if (isEventWithTarget(event)) {
        if (event.target.value === 'newDocument') {
          addPopup.value = { open: true, entrepriseId, entrepriseDocumentTypeId: entreprisedocument.entrepriseDocumentType.id }
        } else {
          entreprisedocument.id = entrepriseDocumentIdValidator.parse(event.target.value)
          entreprisedocumentsReset()
          completeUpdate()
        }
      }
    }

    const entreprisedocumentRemove = (entrepriseId: EntrepriseId, index: number) => {
      const documentToRemove = entreprisesEntrepriseDocumentsIndex.value[entrepriseId].entreprisedocuments[index]
      const docsOfSameTypeFound = entreprisesEntrepriseDocumentsIndex.value[entrepriseId].entreprisedocuments.filter(
        ({ entrepriseDocumentType }) => entrepriseDocumentType === documentToRemove.entrepriseDocumentType
      )
      if (docsOfSameTypeFound.length > 1) {
        entreprisesEntrepriseDocumentsIndex.value[entrepriseId].entreprisedocuments.splice(index, 1)
      } else {
        entreprisesEntrepriseDocumentsIndex.value[entrepriseId].entreprisedocuments[index].id = ''
      }

      entreprisedocumentsReset()
      completeUpdate()
    }

    const entreprisedocumentsReset = () => {
      etapeEntrepriseDocumentIds.value = []

      getKeys(entreprisesEntrepriseDocumentsIndex.value, isEntrepriseId).forEach(eId => {
        entreprisesEntrepriseDocumentsIndex.value[eId].entreprisedocuments.forEach(({ id }) => {
          if (isNullOrUndefined(id) || id === '') return

          etapeEntrepriseDocumentIds.value.push(id)
        })
      })
    }

    watch(() => complete.value, completeUpdate)
    watch(
      () => props.entreprises,
      async () => {
        await loadEntrepriseDocuments()
      },
      { deep: true }
    )
    watch(() => props.tde, reset, { deep: true })

    onMounted(async () => {
      await loadEntrepriseDocuments()
      completeUpdate()
    })

    return () => (
      <>
        {props.entreprises.length ? (
          <div>
            {getEntries(entreprisesEntrepriseDocumentsIndex.value, isEntrepriseId).map(([eId, e]) => (
              <div key={eId} class="mb-xs">
                <div class="flex">
                  <h4>{entreprisesNoms.value[eId]}</h4>
                </div>

                {e.entreprisedocuments.map((j, index) => (
                  <div key={j.id}>
                    <div class="tablet-blobs">
                      <div class="tablet-blob-1-3 flex flex-center">
                        {isNotNullNorUndefined(j.id) && j.id !== '' ? (
                          <a
                            class="mt-s"
                            href={getDownloadRestRoute('/fichiers/:documentId', { documentId: j.id })}
                            title={`Télécharger le document ${j.entrepriseDocumentType.nom} - nouvelle fenêtre`}
                            target="_blank"
                          >
                            {j.entrepriseDocumentType.nom}
                          </a>
                        ) : (
                          <h5 class="mt-s">{j.entrepriseDocumentType.nom}</h5>
                        )}
                        <span>
                          {isNotNullNorUndefined(j.entrepriseDocumentType) && isNotNullNorUndefined(j.entrepriseDocumentType.description) ? (
                            <HelpTooltip text={j.entrepriseDocumentType.description} class="ml-xs" />
                          ) : null}
                        </span>
                        {isNotNullNorUndefined(j.id) && j.id !== '' ? null : <Tag mini color="bg-warning" class="ml-xs" text="Manquant" />}
                      </div>
                      <div class="tablet-blob-2-3">
                        <div class="flex mb-s">
                          <select class="p-s" value={j.id} onChange={event => entreprisedocumentsUpdate(j, eId, event)}>
                            {j.documents.length ? (
                              <>
                                {j.documents.map(d => (
                                  <option key={d.id} value={d.id} disabled={etapeEntrepriseDocumentIds.value.some(id => id === d.id)}>
                                    {DocumentsTypes[d.entreprise_document_type_id].nom} : {d.description} ({dateFormat(d.date)})
                                  </option>
                                ))}
                              </>
                            ) : (
                              <option></option>
                            )}
                            <option value="newDocument">Ajouter un nouveau document d'entreprise</option>
                          </select>

                          {isNotNullNorUndefined(j.id) && j.id !== '' ? (
                            <div class="flex-right flex flex-center ml-s">
                              <ButtonIcon class="btn-border py-s px-m rnd-xs" onClick={() => entreprisedocumentRemove(eId, index)} icon="delete" title="Supprime le document d’entreprise" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-3">
                      <h5 class="mt-s">Ajouter un document d'entreprise existant</h5>
                    </div>
                    <div class="tablet-blob-2-3">
                      <select class="p-s mb-s" value="undefined" onChange={event => entreprisedocumentAdd(eId, event)}>
                        <option value="undefined" disabled>
                          Sélectionner un type de document d'entreprise
                        </option>
                        {tdeEntrepriseDocuments.value.map(jt => (
                          <option
                            key={jt.id}
                            value={jt.id}
                            disabled={e.entreprisedocuments.some(entreprisedocument => jt.id === entreprisedocument.entrepriseDocumentType.id && entreprisedocument.id === '')}
                          >
                            {jt.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun titulaire ou d'amodiataire associé à cette étape.</p>
        )}
        {addPopup.value.open ? (
          <AddEntrepriseDocumentPopup
            close={() => {
              addPopup.value = { open: false }
            }}
            entrepriseId={addPopup.value.entrepriseId}
            apiClient={{
              ...props.apiClient,
              creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput, tempDocumentName) => {
                const newDocumentId = await props.apiClient.creerEntrepriseDocument(entrepriseId, entrepriseDocumentInput, tempDocumentName)

                etapeEntrepriseDocumentIds.value.push(newDocumentId)
                await loadEntrepriseDocuments()
                completeUpdate()

                return newDocumentId
              },
            }}
            lockedEntrepriseDocumentTypeId={addPopup.value.entrepriseDocumentTypeId}
          />
        ) : null}
      </>
    )
  }
)
