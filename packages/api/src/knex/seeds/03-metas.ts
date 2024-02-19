import seeding from '../seeding.js'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes.js'

const addOrdre = (value: object, index: number) => ({ ...value, ordre: index })

const etapesTypes = Object.values(EtapesTypes).map(addOrdre)
const documentsTypes = Object.values(DocumentsTypes)
export const seed = seeding(async ({ insert }) => {
  await Promise.all([insert('etapesTypes', etapesTypes), insert('documentsTypes', documentsTypes)])
})
