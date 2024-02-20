import document from './document'
import * as api from '../api/documents'
import * as upload from '../api/_upload'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../api/documents', () => ({
  documentCreer: vi.fn(),
  documentModifier: vi.fn(),
  documentSupprimer: vi.fn(),
}))

vi.mock('../api/_upload', () => ({
  uploadCall: vi.fn(),
}))

console.info = vi.fn()

describe('documents', () => {
  let store
  let actions
  let mutations

  beforeEach(() => {
    vi.resetAllMocks()

    document.state = {
      preferences: { types: [] },
    }

    actions = {
      pageError: vi.fn(),
      apiError: vi.fn(),
      reload: vi.fn(),
      messageAdd: vi.fn(),
      test: vi.fn(),
    }

    mutations = {
      loadingAdd: vi.fn(),
      loadingRemove: vi.fn(),
      apiError: vi.fn(),
      popupLoad: vi.fn(),
      popupMessagesRemove: vi.fn(),
      popupClose: vi.fn(),
      popupMessageAdd: vi.fn(),
      fileLoad: vi.fn(),
    }

    store = createStore({
      actions,
      mutations,
      modules: {
        document,
        titre: {
          namespaced: true,
          mutations: { open: vi.fn() },
        },
      },
    })

    const app = createApp({})
    app.use(store)
  })

  test('ajoute un document', async () => {
    let document = {
      nom: 'champs',
      typeId: 1,
      fichier: true,
      fichierNouveau: new Blob(),
      nomTemporaire: undefined,
    }
    const apiMock = api.documentCreer.mockResolvedValue({
      nom: 'champs',
    })

    await store.dispatch('document/upsert', {
      document,
      route: { name: 'titre', id: 'titre-id', section: 'etapes' },
    })
    expect(upload.uploadCall).toHaveBeenCalled()
    const sentDocument = { ...document }
    delete sentDocument.fichierNouveau
    expect(apiMock).toHaveBeenCalledWith({ document: sentDocument })

    vi.resetAllMocks()

    await store.dispatch('document/upsert', {
      document,
      route: 'something',
    })
    expect(upload.uploadCall).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ document: sentDocument })

    vi.resetAllMocks()

    document = {
      nom: 'champs',
      typeId: 1,
      fichier: true,
      nomTemporaire: undefined,
    }
    await store.dispatch('document/upsert', {
      document,
      route: { name: 'titre', id: 'titre-id', section: 'travaux' },
    })
    expect(upload.uploadCall).not.toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ document })
  })

  test("retourne une erreur si l'API retourne une erreur lors de l'ajout d'un document", async () => {
    api.documentCreer.mockRejectedValueOnce(() => new Error('erreur api'))
    await store.dispatch('document/upsert', {
      document: { nom: 'champs', fichierNouveau: new Blob() },
    })

    expect(upload.uploadCall).toHaveBeenCalled()
    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })

  test('met à jour un document', async () => {
    let document = {
      nom: 'champs',
      id: 14,
      typeId: 1,
      fichier: true,
      fichierNouveau: new Blob(),
      nomTemporaire: undefined,
    }
    const apiMock = api.documentModifier.mockResolvedValue({
      id: 14,
      nom: 'champs',
    })

    await store.dispatch('document/upsert', {
      document,
      route: { name: 'titre', id: 'titre-id', section: 'etapes' },
    })
    expect(upload.uploadCall).toHaveBeenCalled()
    let sentDocument = { ...document }
    delete sentDocument.fichierNouveau
    delete sentDocument.typeId
    expect(apiMock).toHaveBeenCalledWith({ document: sentDocument })

    vi.resetAllMocks()

    await store.dispatch('document/upsert', {
      document,
      route: 'something',
    })
    expect(upload.uploadCall).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalledWith({ document: sentDocument })

    vi.resetAllMocks()

    document = {
      nom: 'champs',
      id: 14,
      typeId: 1,
      fichier: true,
      nomTemporaire: undefined,
    }
    await store.dispatch('document/upsert', {
      document,
      route: { name: 'titre', id: 'titre-id', section: 'travaux' },
    })
    expect(upload.uploadCall).not.toHaveBeenCalled()
    sentDocument = { ...document }
    delete sentDocument.typeId
    expect(apiMock).toHaveBeenCalledWith({ document: sentDocument })
  })

  test('ajoute un nouveau document si c’est un document temporaire', async () => {
    const document = {
      nom: 'champs',
      typeId: 1,
      fichier: true,
      fichierNouveau: new Blob(),
      nomTemporaire: undefined,
    }
    const apiMock = api.documentCreer.mockResolvedValue({
      id: 14,
      nom: 'champs',
    })

    await store.dispatch('document/upsert', {
      document,
      route: { name: 'titre', id: 'titre-id' },
    })
    expect(upload.uploadCall).toHaveBeenCalled()
    const sentDocument = { ...document }
    delete sentDocument.fichierNouveau
    expect(apiMock).toHaveBeenCalledWith({ document: sentDocument })
  })

  test('applique une action au lieu d’être redirigé', async () => {
    api.documentCreer.mockImplementationOnce(async () => {
      await store.dispatch('document/refreshAfterUpsert', {
        action: { name: 'test' },
      })
    })

    await store.dispatch('document/upsert', {
      document: { id: 14, nom: 'champs', typeId: 1 },
      action: { name: 'test' },
    })

    expect(actions.test).toHaveBeenCalled()
  })

  test("retourne une erreur si l'API retourne une erreur lors de la mise à jour d'un document", async () => {
    api.documentModifier.mockRejectedValue(new Error("erreur de l'api"))
    await store.dispatch('document/upsert', {
      document: { id: 14, nom: 'champs' },
    })

    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })

  test('supprime un document', async () => {
    const apiMock = api.documentSupprimer.mockResolvedValue(true)
    await store.dispatch('document/remove', {
      id: 62,
      route: { name: 'titre', id: 'titre-id' },
    })

    expect(apiMock).toHaveBeenCalledWith({ id: 62 })
    expect(mutations.popupClose).toHaveBeenCalled()
    await store.dispatch('document/remove', {
      id: 62,
    })

    expect(apiMock).toHaveBeenCalledWith({ id: 62 })
    expect(mutations.popupClose).toHaveBeenCalled()
  })

  test("retourne une erreur si l'API retourne une erreur lors de la suppression d'un document", async () => {
    const apiMock = api.documentSupprimer.mockRejectedValue(new Error("erreur de l'api"))
    await store.dispatch('document/remove', { id: 62 })

    expect(apiMock).toHaveBeenCalledWith({ id: 62 })
    expect(mutations.popupMessageAdd).toHaveBeenCalled()
  })
})
