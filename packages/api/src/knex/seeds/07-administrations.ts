import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import seeding from '../seeding.js'

export const seed = seeding(async ({ insert }) => {
  const administrations = Object.values(ADMINISTRATION_IDS).map(id => ({ id }))
  await insert('administrations', administrations)
})
