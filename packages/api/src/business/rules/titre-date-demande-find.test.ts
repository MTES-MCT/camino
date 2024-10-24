import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create'
import { ITitreDemarche } from '../../types'
import { titreDateDemandeFind } from './titre-date-demande-find'

import { describe, expect, test } from 'vitest'

const titreDemarcheOctEtapeMen = [
  {
    id: 'h-cx-courdemanges-1988-oct01',
    titreId: 'h-cx-courdemanges-1988',
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        id: 'h-cx-courdemanges-1988-oct01-dpu01',
        titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
        typeId: 'men',
        statutId: 'dep',
        ordre: 1,
        date: '1988-03-11',
      },
    ],
  },
] as ITitreDemarche[]

const titreDemarcheOctSansEtapes = [
  {
    id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    titreId: newTitreId('h-cx-courdemanges-1988'),
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [],
  },
] as ITitreDemarche[]

const titreDemarcheOctSansEtapeMen = [
  {
    id: 'h-cx-courdemanges-1988-oct01',
    titreId: 'h-cx-courdemanges-1988',
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        id: 'h-cx-courdemanges-1988-oct01-dpu01',
        titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: '1988-03-11',
      },
    ],
  },
] as ITitreDemarche[]
describe("cherche la date de demande initiale d'un titre", () => {
  test("retourne null si le titre n'a pas de démarches", () => {
    expect(titreDateDemandeFind([])).toBeNull()
  })

  test("retourne la date de l'étape de dépôt de la demande d'une démarche", () => {
    expect(titreDateDemandeFind(titreDemarcheOctEtapeMen)).toBe('1988-03-11')
  })

  test("retourne null si la démarche d'octroi d'un titre n'a pas d'étapes'", () => {
    expect(titreDateDemandeFind(titreDemarcheOctSansEtapes)).toBeNull()
  })

  test("retourne null si la démarche d'octroi d'un titre n'a pas d'étape de dépôt de la demande'", () => {
    expect(titreDateDemandeFind(titreDemarcheOctSansEtapeMen)).toBeNull()
  })
})
