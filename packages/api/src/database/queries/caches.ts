import { ICache, ICacheId } from '../../types.js'

import { Caches } from '../models/caches.js'

const cacheGet = async (id: ICacheId) => Caches.query().findById(id)

const cacheUpsert = async (cache: ICache) =>
  Caches.query().upsertGraph(cache, { insertMissing: true })

export { cacheGet, cacheUpsert }
