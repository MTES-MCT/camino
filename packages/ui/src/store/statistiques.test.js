import statistiques from './statistiques'
import * as api from '../api/statistiques'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('../api/statistiques', () => ({
  statistiquesGranulatsMarins: vi.fn()
}))

console.info = vi.fn()

describe('page de statistiques', () => {
  let actions
  let mutations
  let store
  let statistiquesGranulatsMarins

  beforeEach(() => {
    statistiquesGranulatsMarins = {
      annees: [
        {
          StatistiquesGranulatsMarinsAnnee:
            'StatistiquesGranulatsMarinsAnnee2006'
        }
      ],
      surfaceExploration: 86383,
      surfaceExploitation: 20454,
      titresInstructionExploration: 0,
      titresValPrw: 2,
      titresInstructionExploitation: 2,
      titresValCxw: 21
    }

    statistiques.state = {
      granulatsMarins: {}
    }

    mutations = {
      loadingAdd: vi.fn(),
      loadingRemove: vi.fn()
    }
    actions = {
      apiError: vi.fn()
    }
    store = createStore({
      modules: { statistiques },
      mutations,
      actions
    })

    const app = createApp({})
    app.use(store)
  })

  test('récupère les statistiques sur les granulats marins', async () => {
    const apiMock = api.statistiquesGranulatsMarins.mockResolvedValue(
      statistiquesGranulatsMarins
    )
    await store.dispatch('statistiques/get', 'granulatsMarins')

    expect(mutations.loadingAdd).toHaveBeenCalled()
    expect(apiMock).toHaveBeenCalled()
    expect(mutations.loadingRemove).toHaveBeenCalled()
    expect(store.state.statistiques.granulatsMarins).toEqual(
      statistiquesGranulatsMarins
    )

    await store.dispatch('statistiques/get', 'pour avoir 100% de coverage')
  })
})
