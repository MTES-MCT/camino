import { dateFormat } from 'camino-common/src/date'
import { FunctionalComponent, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId, entrepriseDocumentIdValidator, isEntrepriseId } from 'camino-common/src/entreprise'
import { DocumentsTypes, EntrepriseDocumentType, EntrepriseDocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { getEntries, getEntriesHardcore, getKeys, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, map, stringArrayEquals } from 'camino-common/src/typescript-tools'
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
import { SelectedEntrepriseDocument } from 'camino-common/src/permissions/etape-form'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'
import { fr } from '@codegouvfr/react-dsfr'

type Entreprise = { id: EntrepriseId; nom: string }

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  completeUpdate: (etapeEntrepriseDocuments: SelectedEntrepriseDocument[]) => void
  entreprises: Entreprise[]
  etapeId: EtapeId | null
  apiClient: Pick<ApiClient, 'creerEntrepriseDocument' | 'getEntrepriseDocuments' | 'getEtapeEntrepriseDocuments' | 'uploadTempDocument'>
}

interface InnerEntrepriseDocument {
  id: EntrepriseDocumentId | ''
  documents: EntrepriseDocument[]
  entrepriseDocumentType: EntrepriseDocumentType
}

export const EntrepriseDocumentsEdit = defineComponent<Props>(props => {
  const etapeEntrepriseDocumentIds = ref<AsyncData<EntrepriseDocumentId[]>>({ status: 'LOADING' })

  const loadEtapeEntrepriseDocuments = async () => {
    etapeEntrepriseDocumentIds.value = { status: 'LOADING' }
    try {
      if (isNotNullNorUndefined(props.etapeId)) {
        const etapeDocuments = await props.apiClient.getEtapeEntrepriseDocuments(props.etapeId)
        etapeEntrepriseDocumentIds.value = { status: 'LOADED', value: etapeDocuments.map(({ id }) => id) }
      } else {
        etapeEntrepriseDocumentIds.value = { status: 'LOADED', value: [] }
      }
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

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EntrepriseDocumentsEdit.props = ['completeUpdate', 'tde', 'entreprises', 'etapeId', 'apiClient']

const InternalEntrepriseDocumentsEdit = defineComponent<Props & { etapeEntrepriseDocumentIds: EntrepriseDocumentId[] }>(props => {
  const entreprisesEntrepriseDocumentsIndex = ref<Record<EntrepriseId, InnerEntrepriseDocument[]>>({})
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
    const loadingEntrepriseDocuments: Record<EntrepriseId, EntrepriseDocument[]> = {}
    for (const entreprise of props.entreprises) {
      const documents = await props.apiClient.getEntrepriseDocuments(entreprise.id)
      if ('message' in documents) {
        entrepriseDocuments.value = { status: 'NEW_ERROR', error: documents }
      } else {
        loadingEntrepriseDocuments[entreprise.id] = documents
      }
    }
    if (entrepriseDocuments.value.status !== 'NEW_ERROR') {
      entrepriseDocuments.value = { status: 'LOADED', value: loadingEntrepriseDocuments }
    }

    indexReset()
    entreprisedocumentsReset()
  }

  const indexReset = () => {
    const entrepriseDocumentsLoaded = entrepriseDocuments.value
    if (entrepriseDocumentsLoaded.status === 'LOADED') {
      entreprisesEntrepriseDocumentsIndex.value = {}

      props.entreprises.forEach(e => {
        entreprisesEntrepriseDocumentsIndex.value[e.id] = []

        tdeEntrepriseDocuments.value.forEach(type => {
          const documents = entrepriseDocumentsLoaded.value[e.id]?.filter(d => d.entreprise_document_type_id === type.id) ?? []
          const documentsIds = documents.map(({ id }) => id)

          const entrepriseDocumentIds = etapeEntrepriseDocumentIds.value.filter(id => documentsIds.includes(id))

          if (entrepriseDocumentIds.length) {
            entrepriseDocumentIds.forEach(id => {
              entreprisesEntrepriseDocumentsIndex.value[e.id].push({
                id,
                entrepriseDocumentType: type,
                documents,
              })
            })
          } else if (!type.optionnel) {
            entreprisesEntrepriseDocumentsIndex.value[e.id].push({
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
    props.completeUpdate(
      getEntriesHardcore(entreprisesEntrepriseDocumentsIndex.value).flatMap(([entrepriseId, innerEntrepriseDocument]) =>
        innerEntrepriseDocument
          .filter((document): document is Omit<InnerEntrepriseDocument, 'id'> & { id: EntrepriseDocumentId } => isNotNullNorUndefinedNorEmpty(document.id))
          .map(innerDocument => ({ entrepriseId, id: innerDocument.id, documentTypeId: innerDocument.entrepriseDocumentType.id }))
      )
    )
  }

  const entreprisedocumentsUpdate = (entreprisedocument: InnerEntrepriseDocument, entrepriseId: EntrepriseId) => (documentId: EntrepriseDocumentId | 'newDocument' | null) => {
    if (documentId === 'newDocument') {
      addPopup.value = { open: true, entrepriseId, entrepriseDocumentTypeId: entreprisedocument.entrepriseDocumentType.id }
    } else {
      entreprisedocument.id = documentId ?? ''
      entreprisedocumentsReset()
    }
  }

  const entreprisedocumentRemove = (entrepriseId: EntrepriseId, index: number) => () => {
    const documentToRemove = entreprisesEntrepriseDocumentsIndex.value[entrepriseId][index]
    const docsOfSameTypeFound = entreprisesEntrepriseDocumentsIndex.value[entrepriseId].filter(({ entrepriseDocumentType }) => entrepriseDocumentType === documentToRemove.entrepriseDocumentType)
    if (docsOfSameTypeFound.length > 1) {
      entreprisesEntrepriseDocumentsIndex.value[entrepriseId].splice(index, 1)
    } else {
      entreprisesEntrepriseDocumentsIndex.value[entrepriseId][index].id = ''
    }

    entreprisedocumentsReset()
  }

  const entreprisedocumentsReset = () => {
    etapeEntrepriseDocumentIds.value = []

    getKeys(entreprisesEntrepriseDocumentsIndex.value, isEntrepriseId).forEach(eId => {
      entreprisesEntrepriseDocumentsIndex.value[eId].forEach(({ id }) => {
        if (isNullOrUndefined(id) || id === '') return

        etapeEntrepriseDocumentIds.value.push(id)
      })
    })
    completeUpdate()
  }

  watch(
    () => props.entreprises,
    async (old, newValue) => {
      if (
        !stringArrayEquals(
          old.map(({ id }) => id),
          newValue.map(({ id }) => id)
        )
      ) {
        await loadEntrepriseDocuments()
      }
    }
  )
  onMounted(async () => {
    await loadEntrepriseDocuments()
  })

  const addEntrepriseDocumentType = (entrepriseId: EntrepriseId) => (entrepriseDocumentTypeId: EntrepriseDocumentTypeId | null) => {
    const entrepriseDocumentType = tdeEntrepriseDocuments.value.find(({ id }) => id === entrepriseDocumentTypeId)
    if (isNotNullNorUndefined(entrepriseDocumentType)) {
      const entrepriseDocumentsLoaded = entrepriseDocuments.value
      if (entrepriseDocumentsLoaded.status === 'LOADED') {
        const documents = entrepriseDocumentsLoaded.value[entrepriseId]?.filter(d => d.entreprise_document_type_id === entrepriseDocumentTypeId) ?? []

        entreprisesEntrepriseDocumentsIndex.value[entrepriseId].push({ id: '', documents, entrepriseDocumentType })
      }
    }
  }

  type ColumnId = 'nom' | 'select' | 'actions'

  const columns: Column<ColumnId>[] = [
    { id: 'nom', contentTitle: 'Nom' },
    { id: 'select', contentTitle: 'Document selectionné' },
    { id: 'actions', contentTitle: 'Action' },
  ]

  const rows = (eId: EntrepriseId, entrepriseDocuments: InnerEntrepriseDocument[]): TableRow<ColumnId>[] => {
    const myRows: TableRow<ColumnId>[] = entrepriseDocuments.map<TableRow<ColumnId>>((j, index) => ({
      id: `${index}`,
      link: null,
      columns: {
        nom: {
          type: 'jsx',
          value: index,
          jsxElement: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }} key={j.id}>
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
                <span class={[fr.cx('fr-text--xs')]} style={{ maxWidth: '300px' }}>
                  {j.entrepriseDocumentType.description}
                </span>
              ) : null}
            </div>
          ),
        },
        select: {
          type: 'jsx',
          value: index,
          jsxElement: <EntrepriseSelect entrepriseDocuments={j} onEntrepriseDocumentSelect={entreprisedocumentsUpdate(j, eId)} etapeEntrepriseDocumentIds={etapeEntrepriseDocumentIds.value} />,
        },
        actions: {
          type: 'jsx',
          value: index,
          jsxElement:
            isNotNullNorUndefined(j.id) && j.id !== '' ? (
              <DsfrButtonIcon
                icon="fr-icon-delete-bin-line"
                class="fr-ml-1w"
                title={`Supprimer le document d’entreprise ${j.entrepriseDocumentType.nom}`}
                onClick={entreprisedocumentRemove(eId, index)}
                buttonType="secondary"
                buttonSize="sm"
              />
            ) : (
              <div></div>
            ),
        },
      },
    }))

    if (isNotNullNorUndefinedNorEmpty(tdeEntrepriseDocuments.value)) {
      myRows.push({
        id: `add${eId}`,
        link: null,
        columns: {
          nom: {
            type: 'jsx',
            value: 'addEid',
            jsxElement: (
              <DsfrSelect
                items={map(tdeEntrepriseDocuments.value, ({ id, nom }) => ({ id, label: nom }))}
                legend={{ main: 'Ajouter un nouveau type de document', visible: false }}
                valueChanged={addEntrepriseDocumentType(eId)}
                initialValue={null}
              />
            ),
          },
          actions: { type: 'text', value: '' },
          select: { type: 'text', value: '' },
        },
      })
    }

    return myRows
  }
  return () => (
    <>
      {props.entreprises.length ? (
        <div>
          {getEntries(entreprisesEntrepriseDocumentsIndex.value, isEntrepriseId).map(([eId, e]) => (
            <TableSimple key={eId} caption={{ value: entreprisesNoms.value[eId], visible: true }} columns={columns} rows={rows(eId, e)} />
          ))}
        </div>
      ) : (
        <Alert class="fr-mt-2w" title="Aucun titulaire ou amodiataire associé à cette étape." type="warning" small />
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
              const newDocument = await props.apiClient.creerEntrepriseDocument(entrepriseId, entrepriseDocumentInput, tempDocumentName)

              if ('message' in newDocument) {
                return newDocument
              }
              etapeEntrepriseDocumentIds.value.push(newDocument.id)
              const documentsToUpdate = entreprisesEntrepriseDocumentsIndex.value[entrepriseId].filter(({ entrepriseDocumentType }) => entrepriseDocumentType.id === entrepriseDocumentInput.typeId)

              if (isNotNullNorUndefined(documentsToUpdate) && documentsToUpdate.length > 0) {
                documentsToUpdate.forEach(({ documents }) =>
                  documents.push({
                    id: newDocument.id,
                    description: entrepriseDocumentInput.description,
                    date: entrepriseDocumentInput.date,
                    entreprise_document_type_id: entrepriseDocumentInput.typeId,
                    entreprise_id: entrepriseId,
                    can_delete_document: true,
                  })
                )

                if (documentsToUpdate.length === 1) {
                  documentsToUpdate[0].id = newDocument.id
                } else {
                  const documentNotSet = documentsToUpdate.find(({ id }) => id === '')
                  if (isNotNullNorUndefined(documentNotSet)) {
                    documentNotSet.id = newDocument.id
                  } else {
                    documentsToUpdate[0].id = newDocument.id
                  }
                }
              }

              completeUpdate()

              return newDocument
            },
          }}
          lockedEntrepriseDocumentTypeId={addPopup.value.entrepriseDocumentTypeId}
        />
      ) : null}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
InternalEntrepriseDocumentsEdit.props = ['completeUpdate', 'tde', 'entreprises', 'etapeId', 'apiClient', 'etapeEntrepriseDocumentIds']

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
