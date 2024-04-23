import { actions, mutations } from './index'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { vi, describe, expect, beforeEach, test } from 'vitest'

vi.mock('./meta', () => ({ default: { meta: vi.fn() } }))

console.info = vi.fn()
console.error = vi.fn()

describe("état général de l'application", () => {
  let state
  let store
  let modules

  beforeEach(() => {
    vi.resetAllMocks()
    modules = {
      titre: {
        namespaced: true,
        state: { element: null },
        actions: {
          get: vi.fn(),
        },
      },
    }

    state = {
      messages: [],
    }

    store = createStore({
      modules,
      state,
      actions,
      mutations,
    })

    const app = createApp({})
    app.use(store)

    localStorage.clear()
  })

  test('ajoute un message', () => {
    const message = { id: 42, message: 'message très important' }
    store.commit('messageAdd', message)

    expect(state.messages).toEqual([message])
  })

  test('supprime un message', () => {
    const message = { id: 42, message: 'message très important' }
    store.commit('messageAdd', message)
    store.commit('messageRemove', 42)

    expect(state.messages).toEqual([])
  })
})

describe("état général de l'application", () => {
  let state
  let store

  beforeEach(() => {
    state = {
      messages: [],
    }

    localStorage.clear()
  })

  test('supprime un message', async () => {
    vi.useFakeTimers()
    vi.setSystemTime('2022-01-01')
    const messageRemoveMock = vi.fn()
    mutations.messageRemove = messageRemoveMock
    store = createStore({ actions, state, mutations })
    const message = { id: 14, message: 'message important' }
    await store.dispatch('messageAdd', message)

    const res = state.messages.pop()
    expect(res.message).toEqual('message important')
    expect(res.id).toBeLessThanOrEqual(Date.now())
    vi.advanceTimersByTime(4500)
    // expect(setTimeout).toHaveBeenCalled()
    // expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4500)
    expect(messageRemoveMock).toHaveBeenCalled()
  })
})
