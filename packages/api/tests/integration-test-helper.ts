import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { DemarcheId } from 'camino-common/src/demarche'
import Titres from '../src/database/models/titres'
import TitresDemarches from '../src/database/models/titres-demarches'
import TitresEtapes from '../src/database/models/titres-etapes'
import { ITitre, ITitreDemarche, ITitreEtape } from '../src/types'
import { newTitreId, newDemarcheId, newEtapeId } from '../src/database/models/_format/id-create'
import { TitreId } from 'camino-common/src/validators/titres'
import { EtapeId } from 'camino-common/src/etape'

export type IEtapeInsert = Omit<ITitreEtape, 'concurrence' | 'hasTitreFrom' | 'demarcheIdsConsentement'> & { demarcheIdsConsentement?: DemarcheId[] }
type IDemarcheInsert = Omit<ITitreDemarche, 'etapes'> & { etapes?: IEtapeInsert[] }
export type ITitreInsert = Omit<ITitre, 'demarches'> & { demarches?: IDemarcheInsert[] }
export const insertTitreGraph = async (titreGraph: ITitreInsert): Promise<void> => {
  const { demarches, ...titre } = titreGraph
  await Titres.query().insert(titre)

  for (const demarcheGraph of demarches ?? []) {
    const { etapes, ...demarche } = demarcheGraph
    await TitresDemarches.query().insert(demarche)

    for (const etape of etapes ?? []) {
      await TitresEtapes.query().insert({ etapeFondamentaleId: etape.id, demarcheIdsConsentement: [], ...etape })
    }
  }
}

export const multiPolygonWith4Points: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-53.16822754488772, 5.02935254143807],
          [-53.15913163720232, 5.029382753429523],
          [-53.15910186841349, 5.020342601941031],
          [-53.168197650929095, 5.02031244452273],
          [-53.16822754488772, 5.02935254143807],
        ],
      ],
    ],
  },
}
export const createTitreWithDemarcheAndEtape = async (
  titre: Omit<ITitreInsert, 'id' | 'demarches'>,
  demarche: Omit<IDemarcheInsert, 'id' | 'etapes' | 'titreId'>,
  etape: Omit<IEtapeInsert, 'id' | 'titreDemarcheId'>
): Promise<{ titreId: TitreId; demarcheId: DemarcheId; etapeId: EtapeId }> => {
  const titreId = newTitreId()
  const demarcheId = newDemarcheId()
  const etapeId = newEtapeId()
  await insertTitreGraph({
    ...titre,
    id: titreId,
    demarches: [
      {
        ...demarche,
        id: demarcheId,
        titreId,
        etapes: [
          {
            ...etape,
            id: etapeId,
            titreDemarcheId: demarcheId,
          },
        ],
      },
    ],
  })
  return { demarcheId, etapeId, titreId }
}
