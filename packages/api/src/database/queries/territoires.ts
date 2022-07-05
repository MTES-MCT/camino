import { ICommune, IForet, ISDOMZone } from '../../types'

import Communes from '../models/communes'
import Forets from '../models/forets'
import SDOMZones from '../models/sdom-zones'

const communesGet = async (): Promise<ICommune[]> => Communes.query()

const communesUpsert = async (communes: ICommune[]) =>
  Communes.query().upsertGraph(communes, { insertMissing: true })

const foretsGet = async () => Forets.query()

const foretsUpsert = async (forets: IForet[]) =>
  Forets.query().upsertGraph(forets, { insertMissing: true })

const sdomZonesGet = async () => SDOMZones.query()

const sdomZonesUpsert = async (sdomZones: ISDOMZone[]) =>
  SDOMZones.query().upsertGraph(sdomZones, { insertMissing: true })

export {
  communesUpsert,
  communesGet,
  foretsGet,
  foretsUpsert,
  sdomZonesGet,
  sdomZonesUpsert
}
