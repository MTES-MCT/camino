import { describe, expect, test } from 'vitest'
import { getCategoriesForTaxeAurifereGuyane, getRedevanceCommunale, getRedevanceDepartementale } from './fiscalite';
import { anneePrecedente, anneeSuivante, getCurrentAnnee, toCaminoAnnee } from 'camino-common/src/date';
import Decimal from 'decimal.js';

describe('getRedevanceCommunale', () => {
  test('lance une erreur pour toute demande antérieure à 2017', () => {
    expect(() => getRedevanceCommunale(toCaminoAnnee('2015'), 'auru')).toThrowErrorMatchingInlineSnapshot(`[Error: Impossible de calculer la redevance pour cette année (données absentes)]`)
  });
  test('fallback sur les données fiscales de la dernière année pour l\'année courante (et futures)', () => {
    expect(getRedevanceCommunale(anneeSuivante(getCurrentAnnee()), 'auru')).toBeInstanceOf(Decimal)
    expect(getRedevanceCommunale(getCurrentAnnee(), 'auru')).toStrictEqual(getRedevanceCommunale(anneeSuivante(getCurrentAnnee()), 'auru'))
  })
  test('retourne la redevance communale pour l\'année demandée', () => {
      expect(getRedevanceCommunale(toCaminoAnnee('2017'), 'auru')).toBeInstanceOf(Decimal)
      expect(getRedevanceCommunale(toCaminoAnnee('2020'), 'auru')).toBeInstanceOf(Decimal)
      expect(getRedevanceCommunale(anneePrecedente(getCurrentAnnee()), 'auru')).toBeInstanceOf(Decimal)
      expect(getRedevanceCommunale(toCaminoAnnee('2017'), 'aloh')).toStrictEqual(new Decimal(540.3))
  })
})

describe('getRedevanceDepartementale', () => {
  test('lance une erreur pour toute demande antérieure à 2017', () => {
    expect(() => getRedevanceDepartementale(toCaminoAnnee('2015'), 'auru')).toThrowErrorMatchingInlineSnapshot(`[Error: Impossible de calculer la redevance pour cette année (données absentes)]`)
  });
  test('fallback sur les données fiscales de la dernière année pour l\'année courante (et futures)', () => {
    expect(getRedevanceDepartementale(anneeSuivante(getCurrentAnnee()), 'auru')).toBeInstanceOf(Decimal)
    expect(getRedevanceDepartementale(getCurrentAnnee(), 'auru')).toStrictEqual(getRedevanceDepartementale(anneeSuivante(getCurrentAnnee()), 'auru'))
  })
  test('retourne la redevance communale pour l\'année demandée', () => {
      expect(getRedevanceDepartementale(toCaminoAnnee('2017'), 'auru')).toBeInstanceOf(Decimal)
      expect(getRedevanceDepartementale(toCaminoAnnee('2020'), 'auru')).toBeInstanceOf(Decimal)
      expect(getRedevanceDepartementale(anneePrecedente(getCurrentAnnee()), 'auru')).toBeInstanceOf(Decimal)
      expect(getRedevanceDepartementale(toCaminoAnnee('2017'), 'aloh')).toStrictEqual(new Decimal(108))
  })
})

describe('getCategoriesForTaxeAurifereGuyane', () => {
  test('lance une erreur pour toute demande antérieure à 2017', () => {
    expect(() => getCategoriesForTaxeAurifereGuyane(toCaminoAnnee('2015'), 'pme')).toThrowErrorMatchingInlineSnapshot(`[Error: Impossible de calculer la redevance pour cette année (données absentes)]`)
    expect(() => getCategoriesForTaxeAurifereGuyane(toCaminoAnnee('2015'), 'autre')).toThrowErrorMatchingInlineSnapshot(`[Error: Impossible de calculer la redevance pour cette année (données absentes)]`)
  });
  test('fallback sur les données fiscales de la dernière année pour l\'année courante (et futures)', () => {
    expect(getCategoriesForTaxeAurifereGuyane(anneeSuivante(getCurrentAnnee()), 'pme')).toBeInstanceOf(Decimal)
    expect(getCategoriesForTaxeAurifereGuyane(getCurrentAnnee(), 'pme')).toStrictEqual(getCategoriesForTaxeAurifereGuyane(anneeSuivante(getCurrentAnnee()), 'pme'))
  })
  test('retourne la redevance communale pour l\'année demandée', () => {
      expect(getCategoriesForTaxeAurifereGuyane(toCaminoAnnee('2017'), 'pme')).toBeInstanceOf(Decimal)
      expect(getCategoriesForTaxeAurifereGuyane(toCaminoAnnee('2020'), 'pme')).toBeInstanceOf(Decimal)
      expect(getCategoriesForTaxeAurifereGuyane(anneePrecedente(getCurrentAnnee()), 'pme')).toBeInstanceOf(Decimal)
      expect(getCategoriesForTaxeAurifereGuyane(toCaminoAnnee('2017'), 'pme')).toStrictEqual(new Decimal(362.95))
  })
})
