import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { dateFormat } from '@/utils'
import { FunctionalComponent, computed, onMounted, ref, watch } from 'vue'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId, entrepriseDocumentIdValidator, isEntrepriseId } from 'camino-common/src/entreprise'
import { DocumentsTypes, EntrepriseDocumentType, EntrepriseDocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { getEntries, getKeys, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { AddEntrepriseDocumentPopup } from '../entreprise/add-entreprise-document-popup'
import { AsyncData, getDownloadRestRoute } from '@/api/client-rest'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { EtapeId } from 'camino-common/src/etape'
import { LoadingElement } from '../_ui/functional-loader'
import { ApiClient } from '@/api/api-client'
import { Alert } from '../_ui/alert'
import { DsfrButtonIcon, DsfrLink } from '../_ui/dsfr-button'
import { DsfrSelect, Item } from '../_ui/dsfr-select'

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

    const completeUpdate = () => {
      props.completeUpdate(etapeEntrepriseDocumentIds.value, complete.value)
    }

    const entreprisedocumentsUpdate = (entreprisedocument: InnerEntrepriseDocument, entrepriseId: EntrepriseId) => (documentId: EntrepriseDocumentId | 'newDocument' | null) => {
      if (documentId === 'newDocument') {
        addPopup.value = { open: true, entrepriseId, entrepriseDocumentTypeId: entreprisedocument.entrepriseDocumentType.id }
      } else {
        entreprisedocument.id = documentId ?? ''
        entreprisedocumentsReset()
        completeUpdate()
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
              <div key={eId} class="fr-table fr-mb-0">
                <table style={{ display: 'table' }}>
                  <caption>{entreprisesNoms.value[eId]}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Nom</th>
                      <th scope="col"></th>
                      <th scope="col" style={{ display: 'flex', justifyContent: 'end' }}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {e.entreprisedocuments.map((j, index) => (
                      <tr key={j.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                            {isNotNullNorUndefined(j.id) && j.id !== '' ? (
                              <DsfrLink
                                icon={null}
                                href={getDownloadRestRoute('/download/entrepriseDocuments/:documentId', { documentId: j.id })}
                                title={`Télécharger le document ${j.entrepriseDocumentType.nom} - nouvelle fenêtre`}
                                target="_blank"
                                label={j.entrepriseDocumentType.nom}
                              />
                            ) : (
                              <div class="fr-text--md">{j.entrepriseDocumentType.nom}</div>
                            )}
                            {isNotNullNorUndefined(j.entrepriseDocumentType.description) ? (
                              <span class="fr-text--xs" style={{ maxWidth: '300px' }}>
                                {j.entrepriseDocumentType.description}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <EntrepriseSelect entrepriseDocuments={j} onEntrepriseDocumentSelect={entreprisedocumentsUpdate(j, eId)} etapeEntrepriseDocumentIds={etapeEntrepriseDocumentIds.value} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isNotNullNorUndefined(j.id) && j.id !== '' ? (
                            <DsfrButtonIcon
                              icon="fr-icon-delete-bin-line"
                              class="fr-ml-1w"
                              title={`Supprimer le document d’entreprise ${j.entrepriseDocumentType.nom}`}
                              onClick={() => entreprisedocumentRemove(eId, index)}
                              buttonType="secondary"
                              buttonSize="sm"
                            />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <Alert title="Aucun titulaire ou amodiataire associé à cette étape." type="warning" small />
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

const EntrepriseSelect: FunctionalComponent<{
  entrepriseDocuments: InnerEntrepriseDocument
  etapeEntrepriseDocumentIds: EntrepriseDocumentId[]
  onEntrepriseDocumentSelect: (id: EntrepriseDocumentId | 'newDocument' | null) => void
}> = props => {
  const options: Item<EntrepriseDocumentId | 'newDocument'>[] = [
    ...props.entrepriseDocuments.documents.map(d => ({
      id: d.id,
      label: `${DocumentsTypes[d.entreprise_document_type_id].nom} : ${d.description} (${dateFormat(d.date)})`,
      disabled: props.etapeEntrepriseDocumentIds.some(id => id === d.id),
    })),
    { id: 'newDocument', label: "Ajouter un nouveau document d'entreprise", disabled: false },
  ]

  const legend = `Choix du document pour ${props.entrepriseDocuments.entrepriseDocumentType}`

  return (
    <>
      {isNotNullNorUndefinedNorEmpty(options) ? (
        <DsfrSelect
          initialValue={props.entrepriseDocuments.id === '' ? entrepriseDocumentIdValidator.parse('') : props.entrepriseDocuments.id}
          items={options}
          legend={{ main: legend, visible: false }}
          valueChanged={props.onEntrepriseDocumentSelect}
        />
      ) : null}
    </>
  )
}
