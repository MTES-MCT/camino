import { IDevise } from '../../types'

import { devisesGet } from '../queries/metas'
import { Unite, UNITES } from 'camino-common/src/unites'

const metas = {
  devises: [] as IDevise[],
  unites: [] as Unite[]
}

// TODO 2022-05-19 A supprimer en attente de la suppression des devises
const metasInit = async () => {
  // utilisés pour la validation des sections d'étapes
  // /src/api/resolvers/format/titres-sections
  metas.devises = await devisesGet()
  metas.unites = UNITES
}

const metasGet = (metaName: 'devises' | 'unites') => metas[metaName]

export { metasInit, metasGet }
