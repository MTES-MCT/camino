import { ITitreDemarche, IPropId } from '../../types.js'

import { titreContenuTitreEtapeFind,  titrePropTitreEtapeFind } from './titre-prop-etape-find.js'

import {
  titreDemarchesOctPointsMut,
  titreDemarchesOctPointsVides,
  titreDemarchesOctMutPoints,
  titreDemarchesOctPointsMutInstruction,
  titreDemarchesOctAccDpuRej,
  titreDemarchesOctMfrPoints,
  titreDemarchesOctAmodiatairesPassee,
  titreDemarchesOctAmodiatairesValide,
  titreDemarchesOctAmodiatairesMod,
  titreDemarchesProPointsModPhaseEch,
  titreDemarchesProPointsModPhaseVal,
  titreDemarchesMutPointsMod,
  titreDemarchesProModPhaseEch,
  titreDemarchesOctTitulairesACO,
} from './__mocks__/titre-prop-etape-find-demarches.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
const currentDate = toCaminoDate('2023-04-06')

describe("id de l'étape d'une propriété valide (dé-normalise)", () => {
  test("trouve l'id de la dernière étape acceptée de la démarche d'octroi acceptée ayant la propriété 'points'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesOctPointsMut.demarches, titreDemarchesOctPointsMut.statutId)?.id).toEqual('h-cx-courdemanges-1989-oct01-dpu01')
  })

  test("ne trouve pas d'id si la dernière étape acceptée de la dernière démarche acceptée possède une propriété 'points' vide", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesOctPointsVides.demarches, titreDemarchesOctPointsVides.statutId)).toBeNull()
  })

  test("trouve l'id de la dernière étape acceptée de la démarche de mutation acceptée ayant la propriété 'points'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesOctMutPoints.demarches, titreDemarchesOctMutPoints.statutId)?.id).toEqual('h-cx-courdemanges-1986-mut01-dpu01')
  })

  test("ne trouve pas d'id si aucune étape acceptée ne contient la propriété 'communes'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'communes', titreDemarchesOctMutPoints.demarches, titreDemarchesOctMutPoints.statutId)).toBeNull()
  })

  test("trouve l'id de la dernière étape acceptée de la dernière démarche d'octroi en instruction ayant la propriété 'points'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesOctPointsMutInstruction.demarches, titreDemarchesOctPointsMutInstruction.statutId)?.id).toEqual('h-cx-courdemanges-1985-oct01-dpu01')
  })

  test("ne trouve pas d'id si l'étape est rejetée", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesOctAccDpuRej.demarches, titreDemarchesOctAccDpuRej.statutId)).toBeNull()
  })

  test("trouve l'id de la dernière étape de formalisation de la demande de la dernière démarche d'octroi acceptée ayant la propriété 'points'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesOctMfrPoints.demarches, titreDemarchesOctMfrPoints.statutId)?.id).toEqual('h-cx-courdemanges-1983-oct01-mfr01')
  })

  test("trouve l'id de la dernière étape de dpu d'une démarche de prolongation ou de demande de titre en instruction car l'étape contient un périmètre et le titre a le statut 'modification en instance' et aucune phase n'est valide", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesProPointsModPhaseEch.demarches, titreDemarchesProPointsModPhaseEch.statutId)?.id).toEqual('h-cx-courdemanges-1981-pro01-dpu01')
  })

  test("ne trouve pas l'id de la dernière étape de dpu d'une démarche de prolongation ou de demande de titre en instruction car l'étape contient un périmètre et le titre a le statut 'modification en instance' mais la phase est encore valide", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesProPointsModPhaseVal.demarches, titreDemarchesProPointsModPhaseVal.statutId)).toBeNull()
  })

  test("ne trouve pas l'id de la dernière étape de dpu car aucune démarche de prolongation ou de demande de titre en instruction ne contient de périmètre et le titre a le statut 'modification en instance'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'points', titreDemarchesMutPointsMod.demarches, titreDemarchesMutPointsMod.statutId)).toBeNull()
  })

  test.each(['points', 'surface', 'communes'] as IPropId[])(
    "trouve l'id de la dernière étape de n’importe quel type d'une démarche de prolongation ou de demande de titre en instruction car l'étape contient la propriété %s et le titre a le statut 'modification en instance' et aucune phase n'est valide",
    propId => {
      expect(titrePropTitreEtapeFind(currentDate, propId, titreDemarchesProModPhaseEch.demarches, titreDemarchesProModPhaseEch.statutId)?.id).toEqual('h-cx-courdemanges-1981-pro01-dpu01')
    }
  )

  test.each(['titulaires', 'administrations', 'substances'] as IPropId[])("ne trouve pas l'id de la mod car la propriété %s n’est pas modifiée par cette étape", propId => {
    expect(titrePropTitreEtapeFind(currentDate, propId, titreDemarchesProModPhaseEch.demarches, titreDemarchesProModPhaseEch.statutId)?.id).toEqual('h-cx-courdemanges-1981-oct01-dpu01')
  })

  test("trouve l'id de l’unique étape de la démarche d’octroi contenant la propriété 'titulaires'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'titulaires', titreDemarchesOctTitulairesACO.demarches, titreDemarchesOctTitulairesACO.statutId)?.id).toEqual('h-cx-courdemanges-1982-oct01-mfr01')
  })

  // amodiataires

  test("trouve pas d'id si la démarche de l'étape contenant la propriété 'amodiataires' a une phase valide", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'amodiataires', titreDemarchesOctAmodiatairesPassee.demarches, titreDemarchesOctAmodiatairesPassee.statutId)?.id).toBe('h-cx-courdemanges-1982-oct01-dpu01')
  })

  test("trouve l'id de dernière étape contenant la propriété 'amodiataires' dont la démarche précédente a une phase valide", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'amodiataires', titreDemarchesOctAmodiatairesValide.demarches, titreDemarchesOctAmodiatairesValide.statutId)?.id).toEqual('h-cx-courdemanges-1982-amo01-dpu01')
  })

  test("ne trouve pas l'id de la dernière étape contenant la propriété 'amodiataires'", () => {
    expect(titrePropTitreEtapeFind(currentDate, 'amodiataires', titreDemarchesOctAmodiatairesMod.demarches, titreDemarchesOctAmodiatairesMod.statutId)).toBeNull()
  })
})

describe("id de l'étape qui a un contenu", () => {
  test("retourne null si aucune étape n'est trouvé", () => {
    const etape1 = titreContenuTitreEtapeFind(currentDate, { sectionId: 'arm', elementId: 'mecanisee' }, [{ id: newDemarcheId('demarche-id'), etapes: [{ id: 'etape-id' }] }] as ITitreDemarche[], 'val')

    const etape2 = titreContenuTitreEtapeFind(currentDate, 
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          statutId: 'acc',
          etapes: [{ id: 'etape-id', statutId: 'fai' }],
        },
      ] as ITitreDemarche[],
      'val'
    )

    const etape3 = titreContenuTitreEtapeFind(currentDate, 
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: 'titre-id',
          typeId: 'pro',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2020-01-02'),
          etapes: [
            {
              id: 'etape-id',
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dpu',
              date: toCaminoDate('2020-01-01'),
              statutId: 'acc',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ],
      'mod'
    )

    expect(etape1).toBeNull()
    expect(etape2).toBeNull()
    expect(etape3).toBeNull()
  })

  test("retourne l'id de l'étape si elle existe", () => {
    const etape1 = titreContenuTitreEtapeFind(currentDate, 
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: 'titre-id',
          typeId: 'oct',
          etapes: [
            {
              id: 'etape-id',
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dpu',
              date: toCaminoDate('2020-01-03'),
              statutId: 'acc',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
        {
          id: 'demarche-id-2',
          titreId: 'titre-id',
          typeId: 'pro',
          etapes: [
            {
              id: 'etape-id-2',
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dex',
              date: '2020-01-01',
              statutId: 'dex',
            },
          ],
        },
      ] as ITitreDemarche[],
      'val'
    )

    const etape2 = titreContenuTitreEtapeFind(currentDate, 
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: 'titre-id',
          typeId: 'pro',
          etapes: [
            {
              id: 'etape-id',
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'dpu',
              date: toCaminoDate('2020-01-01'),
              statutId: 'acc',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ] as ITitreDemarche[],
      'mod'
    )

    expect(etape1?.id).toEqual('etape-id')
    expect(etape2?.id).toEqual('etape-id')
  })

  test("ne retourne pas l'id de la demande si le titre n’est pas en dmi", () => {
    const etape = titreContenuTitreEtapeFind(currentDate, 
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: 'titre-id',
          typeId: 'oct',
          etapes: [
            {
              id: 'etape-id',
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'mfr',
              date: toCaminoDate('2020-01-03'),
              statutId: 'aco',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ] as ITitreDemarche[],
      'val'
    )
    expect(etape).toBeNull()
  })

  test("retourne l'id de la demande si le titre est en dmi", () => {
    const etape = titreContenuTitreEtapeFind(currentDate, 
      { sectionId: 'arm', elementId: 'mecanisee' },
      [
        {
          id: newDemarcheId('demarche-id'),
          titreId: 'titre-id',
          typeId: 'oct',
          etapes: [
            {
              id: 'etape-id',
              titreDemarcheId: newDemarcheId('demarche-id'),
              typeId: 'mfr',
              date: toCaminoDate('2020-01-03'),
              statutId: 'aco',
              contenu: { arm: { mecanisee: true } },
            },
          ],
        },
      ] as ITitreDemarche[],
      'dmi'
    )
    expect(etape!.id).toEqual('etape-id')
  })
})
