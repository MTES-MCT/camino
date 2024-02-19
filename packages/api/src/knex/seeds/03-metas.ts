import seeding from '../seeding.js'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes.js'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes.js'
import { TitresTypes } from 'camino-common/src/static/titresTypes.js'

const addOrdre = (value: object, index: number) => ({ ...value, ordre: index })

const titresTypesTypes = sortedTitreTypesTypes.map(addOrdre)
const etapesTypes = Object.values(EtapesTypes).map(addOrdre)
const documentsTypes = Object.values(DocumentsTypes)
const titresTypes = Object.values(TitresTypes)
export const seed = seeding(async ({ insert }) => {
  await Promise.all([insert('titresTypesTypes', titresTypesTypes), insert('etapesTypes', etapesTypes), insert('documentsTypes', documentsTypes)])
  await Promise.all([insert('titresTypes', titresTypes)])
})
