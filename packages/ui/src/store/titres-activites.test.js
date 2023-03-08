import { anneesGet } from './titres-activites'
import { vi, describe, expect, test } from 'vitest'

console.info = vi.fn()

describe("état d'une activité", () => {
  test('anneesGet', () => {
    expect(anneesGet(2003)).toEqual([
      { id: 2003, nom: 2003 },
      { id: 2002, nom: 2002 },
      { id: 2001, nom: 2001 },
      { id: 2000, nom: 2000 },
      { id: 1999, nom: 1999 },
      { id: 1998, nom: 1998 },
      { id: 1997, nom: 1997 },
    ])
  })
})
