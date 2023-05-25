import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { HelpTooltip } from '../_ui/help-tooltip'
import { dateFormat } from '@/utils'
import { Tag } from '../_ui/tag'
import { Icon } from '@/components/_ui/icon'
import { computed, onMounted, ref, watch } from 'vue'
import { DocumentId, EntrepriseDocument, EntrepriseId, documentIdValidator, isEntrepriseId } from 'camino-common/src/entreprise'
import { DocumentsTypes, EntrepriseDocumentType, EntrepriseDocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { getEntries, getKeys } from 'camino-common/src/typescript-tools'
import { AddEntrepriseDocumentPopup } from '../entreprise/add-entreprise-document-popup'
import { EntrepriseApiClient } from '../entreprise/entreprise-api-client'
import { AsyncData, getDownloadRestRoute } from '@/api/client-rest'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'

type Entreprise = { id: EntrepriseId; nom: string }

interface Justificatif {
  id: DocumentId
}
interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  completeUpdate: (complete: boolean) => void
  entreprises: Entreprise[]
  justificatifs: Justificatif[]
  apiClient: Pick<EntrepriseApiClient, 'creerEntrepriseDocument' | 'getEntrepriseDocuments'>
}

interface InnerJustificatif {
  id: DocumentId | ''
  documents: EntrepriseDocument[]
  entrepriseDocumentType: EntrepriseDocumentType
}
export const JustificatifsEdit = caminoDefineComponent<Props>(['completeUpdate', 'tde', 'entreprises', 'justificatifs', 'apiClient'], props => {
  const entreprisesJustificatifsIndex = ref<Record<EntrepriseId, { justificatifs: InnerJustificatif[] }>>({})

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
    const justificatifs: EntrepriseDocument[] = []

    const documents = entrepriseDocuments.value
    if (documents.status === 'LOADED') {
      props.entreprises.forEach(entreprise => {
        documents.value[entreprise.id]?.forEach(document => {
          if (props.justificatifs.some(({ id }) => id === document.id)) {
            justificatifs.push(document)
          }
        })
      })

      return tdeEntrepriseDocuments.value.every(tdeEntrepriseDocument => tdeEntrepriseDocument.optionnel || justificatifs.find(({ type_id }) => type_id === tdeEntrepriseDocument.id))
    }
    return false
  })

  const reset = async () => {
    indexReset()
    justificatifsReset()
  }

  const indexReset = () => {
    const entrepriseDocumentsLoaded = entrepriseDocuments.value
    if (entrepriseDocumentsLoaded.status === 'LOADED') {
      entreprisesJustificatifsIndex.value = {}

      props.entreprises.forEach(e => {
        entreprisesJustificatifsIndex.value[e.id] = {
          justificatifs: [],
        }

        tdeEntrepriseDocuments.value.forEach(type => {
          const documents = entrepriseDocumentsLoaded.value[e.id]?.filter(d => d.type_id === type.id) ?? []
          const documentsIds = documents.map(({ id }) => id)

          const justificatifs = props.justificatifs.filter(j => documentsIds.includes(j.id))

          if (justificatifs.length) {
            justificatifs.forEach(j => {
              entreprisesJustificatifsIndex.value[e.id].justificatifs.push({
                id: j.id,
                entrepriseDocumentType: type,
                documents,
              })
            })
          } else if (!type.optionnel) {
            entreprisesJustificatifsIndex.value[e.id].justificatifs.push({
              id: '',
              entrepriseDocumentType: type,
              documents,
            })
          }
        })
      })
    }
  }

  const justificatifAdd = (entrepriseId: EntrepriseId, event: Event) => {
    if (isEventWithTarget(event) && entrepriseDocuments.value.status === 'LOADED') {
      const typeId = event.target.value
      const type = tdeEntrepriseDocuments.value.find(jt => jt.id === typeId)
      const documents = entrepriseDocuments.value.value[entrepriseId]?.filter(d => d.type_id === typeId) ?? []

      if (type) {
        entreprisesJustificatifsIndex.value[entrepriseId].justificatifs.push({
          id: '',
          entrepriseDocumentType: type,
          documents,
        })
      }
    }
  }

  const completeUpdate = () => {
    props.completeUpdate(complete.value)
  }

  const justificatifsUpdate = (justificatif: InnerJustificatif, entrepriseId: EntrepriseId, event: Event) => {
    if (isEventWithTarget(event)) {
      if (event.target.value === 'newDocument') {
        addPopup.value = { open: true, entrepriseId, entrepriseDocumentTypeId: justificatif.entrepriseDocumentType.id }
      } else {
        justificatif.id = documentIdValidator.parse(event.target.value)
        justificatifsReset()
      }
    }
  }

  const justificatifRemove = (entrepriseId: EntrepriseId, index: number) => {
    entreprisesJustificatifsIndex.value[entrepriseId].justificatifs.splice(index, 1)

    justificatifsReset()
  }

  const justificatifsReset = () => {
    props.justificatifs.splice(0, props.justificatifs.length)

    getKeys(entreprisesJustificatifsIndex.value, isEntrepriseId).forEach(eId => {
      entreprisesJustificatifsIndex.value[eId].justificatifs.forEach(({ id }) => {
        if (!id) return

        props.justificatifs.push({ id })
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
  watch(() => props.justificatifs, indexReset, { deep: true })

  onMounted(async () => {
    await loadEntrepriseDocuments()
    completeUpdate()
  })

  return () => (
    <>
      {props.entreprises.length ? (
        <div>
          {getEntries(entreprisesJustificatifsIndex.value, isEntrepriseId).map(([eId, e]) => (
            <div key={eId} class="mb-xs">
              <div class="flex">
                <h4>{entreprisesNoms.value[eId]}</h4>
              </div>

              <hr class="mb-s" />
              {e.justificatifs.map((j, index) => (
                <div key={j.id}>
                  <div class="tablet-blobs">
                    <div class="tablet-blob-1-3 flex flex-center">
                      {j.id ? (
                        <a class="mt-s" href={getDownloadRestRoute('/fichiers/:documentId', { documentId: j.id })} title={`Télécharger le document ${j.entrepriseDocumentType.nom}`} target="_blank">
                          {j.entrepriseDocumentType.nom}
                        </a>
                      ) : (
                        <h5 class="mt-s">{j.entrepriseDocumentType.nom}</h5>
                      )}
                      <span>{j.entrepriseDocumentType?.description ? <HelpTooltip text={j.entrepriseDocumentType?.description} class="ml-xs" /> : null}</span>
                      {j.id ? null : <Tag mini color="bg-warning" class="ml-xs" text="Manquant" />}
                    </div>
                    <div class="tablet-blob-2-3">
                      <div class="flex mb-s">
                        <select class="p-s" value={j.id} onChange={event => justificatifsUpdate(j, eId, event)}>
                          {j.documents.length ? (
                            <>
                              {j.documents.map(d => (
                                <option key={d.id} value={d.id} disabled={props.justificatifs.some(j => j.id === d.id)}>
                                  {DocumentsTypes[d.type_id].nom} : {d.description} ({dateFormat(d.date)})
                                </option>
                              ))}
                            </>
                          ) : (
                            <option></option>
                          )}
                          <option value="newDocument">Ajouter un nouveau justificatif</option>
                        </select>

                        {j.id ? (
                          <div class="flex-right flex flex-center ml-s">
                            <button class="btn-border py-s px-m rnd-xs" onClick={() => justificatifRemove(eId, index)}>
                              <Icon size="M" name="delete" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <hr class="mt-s mb-s" />
              <div>
                <div class="tablet-blobs">
                  <div class="tablet-blob-1-3">
                    <h5 class="mt-s">Ajouter un justificatif existant</h5>
                  </div>
                  <div class="tablet-blob-2-3">
                    <select class="p-s mb-s" value="undefined" onChange={event => justificatifAdd(eId, event)}>
                      <option value="undefined" disabled>
                        Sélectionner un type de justificatif
                      </option>
                      {tdeEntrepriseDocuments.value.map(jt => (
                        <option key={jt.id} value={jt.id} disabled={e.justificatifs.some(justificatif => jt.id === justificatif.entrepriseDocumentType.id && justificatif.id === '')}>
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
            creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
              const newDocumentId = await props.apiClient.creerEntrepriseDocument(entrepriseId, entrepriseDocumentInput)

              props.justificatifs.push({ id: newDocumentId })
              await loadEntrepriseDocuments()

              return newDocumentId
            },
          }}
          lockedEntrepriseDocumentTypeId={addPopup.value.entrepriseDocumentTypeId}
        />
      ) : null}
    </>
  )
})
