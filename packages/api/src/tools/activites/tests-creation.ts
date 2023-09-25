import '../../init.js'
import { writeFileSync } from 'fs'
import { z } from 'zod'
import { knex } from '../../knex.js'
import { Section, sectionValidator } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { ActiviteId } from 'camino-common/src/activite.js'

const arraySectionValidator = z.array(sectionValidator)
const writeActivitesSectionsForTest = async () => {
  const activitesSections: {
    rows: {
      id: ActiviteId
      sections: Section[]
    }[]
  } = await knex.raw('select id, sections from titres_activites')

  const filteredSections = activitesSections.rows
    .filter(activite => {
      if (!arraySectionValidator.safeParse(activite.sections).success) {
        console.warn(`sections non valides pour l'activité ${activite.id} `)

        return false
      }

      return true
    })
    .map(({ sections }) => sections)

  const duplicatesSection = filteredSections.reduce<Record<string, Section[]>>((acc, sections) => {
    acc[JSON.stringify(sections)] = sections
    JSON.stringify(sections)

    return acc
  }, {})

  writeFileSync(`../../packages/common/src/static/titresTypes_demarchesTypes_etapesTypes/activites.sections.json`, JSON.stringify(Object.values(duplicatesSection)))
}

writeActivitesSectionsForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
