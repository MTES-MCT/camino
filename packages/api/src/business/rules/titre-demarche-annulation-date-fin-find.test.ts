import { ITitreEtape } from '../../types.js'
import { titreDemarcheAnnulationDateFinFind } from './titre-demarche-annulation-date-fin-find.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
describe("date de fin d'une démarche d'annulation", () => {
  test.each<EtapeTypeId>(['dex', 'dux', 'dim'])("retourne la date d'une démarche d'annulation si elle n'a pas de date de fin pour une %p", typeId => {
    const titreDemarcheAnnulationEtapes: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-ret01-dex01'),
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ret01'),
        typeId,
        statutId: 'acc',
        isBrouillon: false,
        ordre: 1,
        date: toCaminoDate('2013-05-21'),
      },
    ]
    expect(titreDemarcheAnnulationDateFinFind(titreDemarcheAnnulationEtapes)).toEqual('2013-05-21')
  })

  test.each<EtapeTypeId>(['dex', 'dux', 'dim'])("retourne la date de fin d'une démarche d'annulation si elle existe pour une %p", typeId => {
    const titreDemarcheAnnulationEtapesDateFin: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-ret01-dex01'),
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ret01'),
        typeId,
        statutId: 'acc',
        isBrouillon: false,
        ordre: 1,
        date: toCaminoDate('2013-05-21'),
        dateFin: toCaminoDate('2013-05-25'),
      },
    ]
    expect(titreDemarcheAnnulationDateFinFind(titreDemarcheAnnulationEtapesDateFin)).toEqual('2013-05-25')
  })

  test("retourne null si l'étape n'a ni date, ni date de fin", () => {
    // TODO 2022-05-10, c'est étrange, on va à l'encontre de typescript ici. Soit le typage est faux, soit le test ne sert à rien
    const titreDemarcheAnnulationEtapesSansDate: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-ret01-dex01'),
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ret01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        date: null,
      },
    ]
    expect(titreDemarcheAnnulationDateFinFind(titreDemarcheAnnulationEtapesSansDate)).toBeNull()
  })

  test("retourne la date de fin d'une ACO si elle existe", () => {
    const titreDemarcheACOFaitEtapesDateFin: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-ret01-dex01'),
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ret01'),
        typeId: 'aco',
        statutId: 'fai',
        isBrouillon: false,
        ordre: 1,
        date: toCaminoDate('2013-05-21'),
        dateFin: toCaminoDate('2013-05-25'),
      },
    ]
    expect(titreDemarcheAnnulationDateFinFind(titreDemarcheACOFaitEtapesDateFin)).toEqual('2013-05-25')
  })
})
