import { IEntreprise, IHeritageProps, ITitreEtape } from '../../types.js'

import { titreEtapeHeritagePropsFind } from './titre-etape-heritage-props-find.js'

import { objectClone } from '../../tools/index.js'
import { describe, test, expect } from 'vitest'
import { newEtapeId } from '../../database/models/_format/id-create.js'

import { ETAPE_HERITAGE_PROPS, EtapeHeritageProps } from 'camino-common/src/heritage.js'

/* eslint-disable @typescript-eslint/ban-ts-comment */

describe('retourne l’étape en fonction de son héritage', () => {
  test('l’étape n’est pas modifiée si elle n’a pas d’étape précédente et qu’elle n’a aucun héritage d’actif', () => {
    const titreEtape = {
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    expect(titreEtapeHeritagePropsFind(titreEtape)).toEqual({
      hasChanged: false,
      titreEtape,
    })
  })

  test.each<[EtapeHeritageProps, any, any]>([
    ['duree', 10, 20],
    ['dateDebut', '2020-01-01', '2023-01-01'],
    ['dateFin', '2021-01-01', '2021-03-01'],
  ])('l’étape est modifiée si elle a une étape précédente et qu’elle au moins un héritage non renseigné', (propId, heritageValeur, etapeValeur) => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape
    // @ts-ignore
    titreEtapePrecedente[propId] = heritageValeur

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps![propId].actif = true
    // @ts-ignore
    titreEtape[propId] = etapeValeur
    titreEtape.id = newEtapeId('titreEtapeId')

    const titreEtapeNew = objectClone(titreEtape) as ITitreEtape
    // @ts-ignore
    titreEtapeNew[propId] = heritageValeur
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtapeNew.heritageProps![prop].etapeId = titreEtapePrecedente.id))

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      titreEtape: titreEtapeNew,
    })
  })

  test('l’étape n’est pas modifiée si pas de changement sur les titulaires', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      titulaires: [{ id: 'toto' }, { id: 'tata' }] as IEntreprise[],
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps!.titulaires.actif = true
    titreEtape.id = newEtapeId('titreEtapeId')
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: false,
      titreEtape,
    })
  })

  test.each<EtapeHeritageProps>(['titulaires', 'amodiataires'])('l’étape est modifiée si changement sur les $propId', propId => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape
    // @ts-ignore
    titreEtapePrecedente[propId] = [{ id: 'toto' }, { id: 'tata' }]

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps![propId].actif = true
    titreEtape.id = newEtapeId('titreEtapeId')
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))
    // @ts-ignore
    titreEtape[propId] = [{ id: 'haha' }, { id: 'toto' }]

    const titreEtapeNew = objectClone(titreEtape) as ITitreEtape
    // @ts-ignore
    titreEtapeNew[propId] = [{ id: 'toto' }, { id: 'tata' }]

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      titreEtape: titreEtapeNew,
    })
  })

  test('l’étape est modifiée si changement sur les substances', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape
    titreEtapePrecedente.substances = ['auru', 'arge']

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps!.substances.actif = true
    titreEtape.id = newEtapeId('titreEtapeId')
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))
    titreEtape.substances = ['nacl', 'arge']

    const titreEtapeNew = objectClone(titreEtape) as ITitreEtape
    titreEtapeNew.substances = ['auru', 'arge']

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      titreEtape: titreEtapeNew,
    })
  })

  test('l’étape est modifiée si il y a un titulaire en moins', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      titulaires: [{ id: 'toto' }] as IEntreprise[],
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps!.titulaires.actif = true
    titreEtape.titulaires = [{ id: 'haha' }, { id: 'toto' }] as IEntreprise[]
    titreEtape.id = newEtapeId('titreEtapeId')
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))

    const titreEtapeNew = objectClone(titreEtape) as ITitreEtape
    titreEtapeNew.titulaires = [{ id: 'toto' }] as IEntreprise[]

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      titreEtape: titreEtapeNew,
    })
  })

  test('l’étape est modifiée si on récupère l’héritage déjà présent sur l’étape précédente', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      titulaires: [{ id: 'toto' }, { id: 'tata' }] as IEntreprise[],
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: true, etapeId: newEtapeId('premiereEtapeId') }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.id = newEtapeId('titreEtapeId')
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))

    const titreEtapeNew = objectClone(titreEtape) as ITitreEtape
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtapeNew.heritageProps![prop].etapeId = newEtapeId('premiereEtapeId')))

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      titreEtape: titreEtapeNew,
    })
  })

  test('l’étape n’est pas modifiée si pas de changement sur le perimetre', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      geojson4326Perimetre: {type: 'Feature', properties: {}, geometry: {type: 'MultiPolygon', coordinates: [[[[1, 2]]]]}},
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps!.perimetre.actif = true
    titreEtape.id = newEtapeId('titreEtapeId')
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: false,
      titreEtape,
    })
  })

  test('l’étape est modifiée si changement sur le perimetre', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      geojson4326Perimetre: {type: 'Feature', properties: {}, geometry: {type: 'MultiPolygon', coordinates: [[[[1, 2]]]]}},
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const titreEtape = objectClone(titreEtapePrecedente) as ITitreEtape
    titreEtape.heritageProps!.perimetre.actif = true
    titreEtape.id = newEtapeId('titreEtapeId')
    titreEtape.geojson4326Perimetre = {type: 'Feature', properties: {}, geometry: {type: 'MultiPolygon', coordinates: [[[[1, 2], [3,4]]]]}}
    ETAPE_HERITAGE_PROPS.forEach(prop => (titreEtape.heritageProps![prop].etapeId = titreEtapePrecedente.id))

    const newTitreEtape = objectClone(titreEtape) as ITitreEtape
    newTitreEtape.geojson4326Perimetre = objectClone(titreEtapePrecedente.geojson4326Perimetre)

    const result = titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)

    expect(result.hasChanged).toBeTruthy()
  })

  test('l’héritage est désactivé si l’étape précédente n’existe plus', () => {
    const titreEtape = {
      id: 'titreEtapeId',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: true, etapeId: newEtapeId('prevTitreEtapeId') }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const newTitreEtape = objectClone(titreEtape) as ITitreEtape
    newTitreEtape.heritageProps = ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
      acc[prop] = { actif: false, etapeId: undefined }

      return acc
    }, {} as IHeritageProps)

    expect(titreEtapeHeritagePropsFind(titreEtape, null)).toEqual({
      hasChanged: true,
      titreEtape: newTitreEtape,
    })
  })

  test('l’héritage est réinitialisé si l’héritage n’existe pas', () => {
    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
        acc[prop] = { actif: false, etapeId: null }

        return acc
      }, {} as IHeritageProps),
    } as ITitreEtape

    const titreEtape = {
      id: 'titreEtapeId',
    } as ITitreEtape

    const newTitreEtape = objectClone(titreEtape) as ITitreEtape
    newTitreEtape.heritageProps = ETAPE_HERITAGE_PROPS.reduce((acc, prop) => {
      acc[prop] = { actif: false, etapeId: titreEtapePrecedente.id }

      return acc
    }, {} as IHeritageProps)

    expect(titreEtapeHeritagePropsFind(titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      titreEtape: newTitreEtape,
    })
  })
})
