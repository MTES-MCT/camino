import { EtapeStatutId, isEtapeStatusOk, isEtapeStatusRejete, isFondamentalesStatutOk, isStatut } from './etapesStatuts'
import { test, expect } from 'vitest'

test('isStatut', () => {
  expect(isStatut('camino')).toBe(false)
  expect(isStatut('acc')).toBe(true)
})

test.each<EtapeStatutId>(['acc', 'fai', 'dep', 'com', 'fav', 'fre', 'ter', 'exe'])('isEtapeStatusOk renvoie true pour %s', statut => {
  expect(isEtapeStatusOk(statut)).toBe(true)
})

test('isEtapeStatusOk renvoie false pour les autres statuts', () => {
  expect(isEtapeStatusOk('rej')).toBe(false)
})

test.each<EtapeStatutId>(['rej', 'rei'])('isEtapeStatusRejete renvoie true pour %s', statut => {
  expect(isEtapeStatusRejete(statut)).toBe(true)
})

test('isEtapeStatusRejete renvoie false pour les autres statuts', () => {
  expect(isEtapeStatusRejete('acc')).toBe(false)
})

test.each<EtapeStatutId>(['acc', 'fai', 'fav'])('isFondamentalesStatutOk renvoie true pour %s', statut => {
  expect(isFondamentalesStatutOk(statut)).toBe(true)
})

test('isFondamentalesStatutOk renvoie false pour les autres statuts', () => {
  expect(isFondamentalesStatutOk('rej')).toBe(false)
})
