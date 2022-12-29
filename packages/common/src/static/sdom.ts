import { Definition } from '../definition.js'

export const SDOMZoneIds = {
  Zone0: '0',
  Zone0Potentielle: '0_potentielle',
  Zone1: '1',
  Zone2: '2'
} as const

export type SDOMZoneId = typeof SDOMZoneIds[keyof typeof SDOMZoneIds]

export type SDOMZone<T = SDOMZoneId> = Pick<Definition<T>, 'id' | 'nom'>

export const SDOMZones: { [key in SDOMZoneId]: Pick<SDOMZone<key>, 'id' | 'nom'> } = {
  '0': {
    id: '0',
    nom: 'ZONE 0, activité minière interdite'
  },
  '0_potentielle': {
    id: '0_potentielle',
    nom: 'ZONE 0, potentielle'
  },
  '1': {
    id: '1',
    nom: 'ZONE 1, activité minière interdite sauf exploitation souterraine et recherches aériennes'
  },
  '2': {
    id: '2',
    nom: 'ZONE 2, activité minière autorisée sous contrainte'
  }
}
