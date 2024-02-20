import seeding from '../seeding.js'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes.js'

const documentsTypes = Object.values(DocumentsTypes)
export const seed = seeding(async ({ insert }) => {
  await Promise.all([insert('documentsTypes', documentsTypes)])
})
