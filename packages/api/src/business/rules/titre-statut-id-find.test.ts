import { titreStatutIdFind } from './titre-statut-id-find'

import {
  titreDemarchesIndefini,
  titreDemarchesValide,
  titreDemarchesEchu,
  titreDemarchesOctroiInstruction,
  titreDemarchesOctroiDepose,
  titreDemarchesOctroiRejete,
  titreDemarchesOctroiClasse,
  titreDemarchesOctroiRetire,
  titreDemarchesInstruction,
  titrePERDemarchesProlongation
} from './__mocks__/titre-statut-id-find-titres'

describe("statut d'un titre", () => {
  const aujourdhui = '2020-12-01'

  test("le statut d'un titre sans démarche est “ind”", () => {
    expect(titreStatutIdFind(aujourdhui, undefined, '')).toEqual('ind')
  })

  test("le statut d'un titre avec des démarches dont le statut est “ind” est également “ind”", () => {
    expect(titreStatutIdFind(aujourdhui, titreDemarchesIndefini, '')).toEqual(
      'ind'
    )
  })

  test("le statut d'un titre dont la date de fin est dans le futur est “val”", () => {
    expect(titreStatutIdFind(aujourdhui, titreDemarchesValide, '')).toEqual(
      'val'
    )
  })

  test("le statut d'un titre dont la date de fin est dans le passé est “ech”", () => {
    expect(titreStatutIdFind(aujourdhui, titreDemarchesEchu, '')).toEqual('ech')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi en instruction est “dmi”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titreDemarchesOctroiInstruction, '')
    ).toEqual('dmi')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi déposé est “dmi”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titreDemarchesOctroiDepose, '')
    ).toEqual('dmi')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi rejeté est “dmc”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titreDemarchesOctroiRejete, '')
    ).toEqual('dmc')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi classé sans suite est “dmc”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titreDemarchesOctroiClasse, '')
    ).toEqual('dmc')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi retiré est “dmc”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titreDemarchesOctroiRetire, '')
    ).toEqual('dmc')
  })

  test("le statut d'un titre avec une démarche en instruction est “mod”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titreDemarchesInstruction, '')
    ).toEqual('mod')
  })

  test("le statut d'un titre PER M ou W avec une prolongation déposée est “mod”", () => {
    expect(
      titreStatutIdFind(aujourdhui, titrePERDemarchesProlongation, 'prm')
    ).toEqual('mod')
  })

  test.only("le statut d'un titre PER M ou W avec une prolongation2 déposée est “mod”", () => {
    expect(
      titreStatutIdFind(
        aujourdhui,
        [
          {
            id: 'm-pr-saint-pierre-2014-pro01',
            titreId: 'm-pr-saint-pierre-2014',
            type: { id: 'pr2', nom: 'unused', ordre: 1, etapesTypes: [] },
            typeId: 'pr2',
            statutId: 'eco',
            ordre: 3,
            etapes: [
              {
                date: '2020-06-01',
                typeId: 'mfr',
                statutId: 'fai',
                id: 'id',
                titreDemarcheId: 'm-pr-saint-pierre-2014-pro02'
              }
            ]
          },
          {
            id: 'm-pr-saint-pierre-2014-pro01',
            titreId: 'm-pr-saint-pierre-2014',
            type: { id: 'pr1', nom: 'unused', ordre: 1, etapesTypes: [] },
            typeId: 'pr1',
            statutId: 'acc',
            ordre: 2,
            etapes: [
              {
                date: '2020-01-01',
                typeId: 'dex',
                statutId: 'acc',
                id: 'id',
                titreDemarcheId: 'm-pr-saint-pierre-2014-pro01',
                ordre: 1,
                dateDebut: null,
                dateFin: '2020-10-01'
              }
            ]
          },
          {
            id: 'm-pr-saint-pierre-2014-oct01',
            titreId: 'm-pr-saint-pierre-2014',
            type: { id: 'oct', nom: 'unused', ordre: 2, etapesTypes: [] },
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                id: 'm-pr-saint-pierre-2014-oct01-dex01',
                titreDemarcheId: 'm-pr-saint-pierre-2014-oct01',
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: '1014-04-01',
                dateDebut: null,
                dateFin: '2020-04-01'
              }
            ]
          }
        ],
        'prm'
      )
    ).toEqual('mod')
  })
})
