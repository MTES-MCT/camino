import gql from 'graphql-tag'

import { apiGraphQLFetch } from './_client.js'
import { vi, describe, expect, beforeEach, afterEach, test } from 'vitest'

vi.mock('./fragments/utilisateur', () => ({
  fragmentUtilisateur: gql`
    fragment utilisateur on Utilisateur {
      id
      email
    }
  `
}))

console.info = vi.fn()
console.error = vi.fn()

describe('api client', () => {
  const { location } = window

  beforeEach(() => {
    delete window.location
    window.location = { reload: vi.fn() }
  })

  afterEach(() => {
    window.location = location
  })

  test('une réponse 200 du serveur ne génère pas d’erreur', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: { key: 'value' } }), {
      status: 200
    })

    const res = await apiGraphQLFetch(gql`
      query Statuts {
        statuts {
          nom
        }
      }
    `)()

    expect(res).toEqual('value')
  })

  test('une réponse 404 du serveur génère une erreur', async () => {
    fetch.mockResponse(JSON.stringify({ data: {} }), { status: 404 })

    let error
    try {
      await apiGraphQLFetch(
        gql`
          query Statuts {
            statuts {
              nom
            }
          }
        `
      )()
    } catch (e) {
      error = e
    }

    expect(error.message).toBe('HTTP 404 status.')
    expect(window.location.reload).not.toHaveBeenCalled()
  })
})
