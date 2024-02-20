import titreEtapeEdition from './titre-etape-edition'
import * as api from '../api/titres-etapes'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

import {
  titreEtapeMetas,
  titreEtapeMetasRes,
  titreEtapeMetasRes2,
  titreEtapeEdited,
  titreEtapeHeritage1,
  titreEtapeHeritageRes1,
  titreEtapeHeritageRes2,
  titreEtapeHeritage2,
} from './__mocks__/titre-etape'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'

vi.mock('../api/titres-etapes', () => ({
  etape: vi.fn(),
  etapeHeritage: vi.fn(),
  titreEtapeMetas: vi.fn(),
  etapeCreer: vi.fn(),
  etapeModifier: vi.fn(),
}))

console.info = vi.fn()

describe('étapes', () => {
  let store
  let actions
  let mutations

  beforeEach(() => {
    titreEtapeEdition.state = {
      element: null,
      metas: {
        demarche: {},
        substances: [],
        entreprises: [],
      },
      heritageLoaded: false,
      loaded: false,
    }

    actions = {
      pageError: vi.fn(),
      apiError: vi.fn(),
      reload: vi.fn(),
      messageAdd: vi.fn(),
      dateUpdate: vi.fn(),
    }

    mutations = {
      loadingAdd: vi.fn(),
      loadingRemove: vi.fn(),
      apiError: vi.fn(),
      popupLoad: vi.fn(),
      popupMessagesRemove: vi.fn(),
      popupClose: vi.fn(),
      popupMessageAdd: vi.fn(),
    }

    store = createStore({
      actions,
      mutations,
      modules: {
        titreEtapeEdition,
        titre: { namespaced: true, mutations: { open: vi.fn() } },
      },
    })

    const app = createApp({})
    app.use(store)
  })

  test('récupère les métas pour éditer une étape', async () => {
    const apiMockMetas = api.titreEtapeMetas.mockResolvedValue(titreEtapeMetas)
    const apiMockEtape = api.etape.mockResolvedValue({
      id: 'etape-id',
      titreDemarcheId: 'demarche-id',
      date: '2020-01-01',
    })

    await store.dispatch('titreEtapeEdition/init', {
      id: 'etape-id',
      titreDemarcheId: 'demarche-id',
    })

    expect(apiMockMetas).toHaveBeenCalled()
    expect(apiMockEtape).toHaveBeenCalled()
    expect(store.state.titreEtapeEdition.metas).toEqual(titreEtapeMetasRes)
    expect(store.state.titreEtapeEdition.element).toEqual(titreEtapeEdited)
    expect(mutations.loadingRemove).toHaveBeenCalled()
  })

  test('récupère les métas pour créer une étape', async () => {
    const apiMockMetas = api.titreEtapeMetas.mockResolvedValue(titreEtapeMetas)

    await store.dispatch('titreEtapeEdition/init', {
      titreDemarcheId: 'demarche-id',
    })

    expect(apiMockMetas).toHaveBeenCalled()
    expect(store.state.titreEtapeEdition.metas).toEqual(titreEtapeMetasRes2)
    expect(mutations.loadingRemove).toHaveBeenCalled()
  })

  test("retourne une erreur si l'api ne répond pas", async () => {
    const apiMock = api.titreEtapeMetas.mockRejectedValue(new Error("erreur de l'api"))

    await store.dispatch('titreEtapeEdition/init', { etape: {} })

    expect(apiMock).toHaveBeenCalled()
    expect(mutations.loadingRemove).toHaveBeenCalled()
    expect(actions.pageError).toHaveBeenCalled()
  })

  test("récupère l'héritage d'une étape", async () => {
    store.state.titreEtapeEdition.element = {
      id: 'etape-id',
      typeId: 'etape-type-id',
      date: '2020-01-02',
      titreDemarcheId: 'demarche-id',
    }

    store.state.titreEtapeEdition.metas.demarche = { id: 'demarche-id' }

    const apiMock1 = api.etapeHeritage.mockResolvedValue(titreEtapeHeritageRes1)
    await store.dispatch('titreEtapeEdition/heritageGet', {
      typeId: 'etape-type-id',
    })

    expect(apiMock1).toHaveBeenCalled()
    expect(store.state.titreEtapeEdition.element).toEqual(titreEtapeHeritage1)

    const apiMock2 = api.etapeHeritage.mockResolvedValue(titreEtapeHeritageRes1)
    await store.dispatch('titreEtapeEdition/heritageGet', {
      typeId: 'etape-type-id',
    })

    expect(apiMock2).toHaveBeenCalled()
    expect(store.state.titreEtapeEdition.element).toEqual(titreEtapeHeritage1)

    store.state.titreEtapeEdition.element = {
      date: '2020-01-01',
      typeId: 'mfr',
      titreDemarcheId: 'demarche-id',
      heritageProps: {},
    }

    const apiMock3 = api.etapeHeritage.mockResolvedValue({
      typeId: 'mcp',
    })
    await store.dispatch('titreEtapeEdition/heritageGet', {
      typeId: 'etape-type-id',
      titreDemarcheId: 'demarche-id',
      date: '2020-01-02',
    })

    expect(apiMock3).toHaveBeenCalled()
    expect(store.state.titreEtapeEdition.element).toEqual({
      date: '2020-01-01',
      statutId: '',
      titreDemarcheId: 'demarche-id',
      typeId: 'mcp',
    })

    const apiMock4 = api.etapeHeritage.mockResolvedValue(titreEtapeHeritageRes2)
    await store.dispatch('titreEtapeEdition/heritageGet', {
      typeId: 'mfr',
      titreDemarcheId: 'demarche-id',
      date: '2020-01-02',
    })

    expect(apiMock4).toHaveBeenCalled()
    expect(store.state.titreEtapeEdition.element).toEqual(titreEtapeHeritage2)
  })

  test("retourne une erreur si l'API retourne une erreur lors de la récupération de l'héritage", async () => {
    api.etapeHeritage.mockRejectedValue(new Error('erreur api'))
    await store.dispatch('titreEtapeEdition/heritageGet', {
      typeId: 'etape-type-id',
      titreDemarcheId: 'demarche-id',
      date: '2020-01-02',
    })

    expect(actions.apiError).toHaveBeenCalled()
  })

  test('créé une étape', async () => {
    store.state.titreEtapeEdition.metas.demarche = { id: 'demarche-id' }
    api.etapeCreer.mockResolvedValue({ id: 14, nom: 'champs', type: {} })
    await store.dispatch('titreEtapeEdition/upsert', {
      etape: {
        nom: 'champs',
        type: {},
      },
    })

    store.commit('titreEtapeEdition/reset')

    expect(store.state.titreEtapeEdition.element).toBeNull()
  })

  test("retourne une erreur si l'API retourne une erreur lors de la création d'une étape", async () => {
    api.etapeCreer.mockRejectedValue(new Error('erreur api'))
    await store.dispatch('titreEtapeEdition/upsert', {
      nom: 'champs',
    })

    expect(actions.apiError).toHaveBeenCalled()
  })

  test('met à jour une étape', async () => {
    store.state.titreEtapeEdition.metas.demarche = { id: 'demarche-id' }
    api.etapeModifier.mockResolvedValue({ id: 14, nom: 'champs', type: {} })
    await store.dispatch('titreEtapeEdition/upsert', {
      etape: {
        id: 14,
        nom: 'champs',
        type: {},
      },
    })
  })

  test("retourne une erreur si l'API retourne une erreur lors de la mise à jour d'une étape", async () => {
    api.etapeModifier.mockRejectedValue(new Error("erreur de l'api"))
    await store.dispatch('titreEtapeEdition/upsert', {
      etape: {
        id: 14,
        nom: 'champs',
      },
    })

    expect(actions.apiError).toHaveBeenCalled()
  })

  test('ajoute un nouveau document', async () => {
    store.state.titreEtapeEdition.element = {
      documents: [],
      typeId: ETAPES_TYPES.decisionDeLadministration,
    }

    store.state.titreEtapeEdition.metas = {
      demarche: {
        typeId: DEMARCHES_TYPES_IDS.MutationPartielle,
        titre: {
          typeId: TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE,
        },
      },
    }
    await store.dispatch('titreEtapeEdition/documentAdd', {
      document: { id: 'document-id', typeId: DOCUMENTS_TYPES_IDS.arrete },
    })

    expect(store.state.titreEtapeEdition.element.documents).toHaveLength(1)
  })

  test('remplace un document existant par un nouveau', async () => {
    store.state.titreEtapeEdition.element = {
      documents: [{ id: 'document-id1', typeId: DOCUMENTS_TYPES_IDS.arrete }],
      typeId: ETAPES_TYPES.decisionDeLadministration,
    }

    store.state.titreEtapeEdition.metas = {
      demarche: {
        typeId: DEMARCHES_TYPES_IDS.MutationPartielle,
        titre: {
          typeId: TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE,
        },
      },
    }
    await store.dispatch('titreEtapeEdition/documentAdd', {
      document: { id: 'document-id2', typeId: DOCUMENTS_TYPES_IDS.arrete },
      idOld: 'document-id1',
    })

    expect(store.state.titreEtapeEdition.element.documents).toHaveLength(1)
    expect(store.state.titreEtapeEdition.element.documents[0].id).toEqual('document-id2')
  })

  test('supprime un document', async () => {
    store.state.titreEtapeEdition.element = {
      documents: [
        { id: 'document-id1', typeId: DOCUMENTS_TYPES_IDS.arrete },
        { id: 'document-id2', typeId: DOCUMENTS_TYPES_IDS.arrete },
      ],
      typeId: ETAPES_TYPES.decisionDeLadministration,
    }

    store.state.titreEtapeEdition.metas = {
      demarche: {
        typeId: DEMARCHES_TYPES_IDS.MutationPartielle,
        titre: {
          typeId: TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE,
        },
      },
    }
    await store.dispatch('titreEtapeEdition/documentRemove', {
      id: 'document-id2',
    })

    expect(store.state.titreEtapeEdition.element.documents).toHaveLength(1)
    expect(store.state.titreEtapeEdition.element.documents[0].id).toEqual('document-id1')
  })
})
