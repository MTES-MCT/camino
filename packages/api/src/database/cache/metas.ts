import { IUnite } from '../../types'

import { unitesGet } from '../queries/metas'
import { Devise, sortedDevises } from 'camino-common/src/devise'

const metas: { unites: IUnite[]; devises: Devise[] } = {
  unites: [],
  devises: []
}

const metasInit = async () => {
  // utilisés pour la validation des sections d'étapes
  // /src/api/resolvers/format/titres-sections
  metas.devises = sortedDevises
  metas.unites = await unitesGet()
}

const metasGet = (metaName: 'devises' | 'unites') => metas[metaName]

export { metasInit, metasGet }
