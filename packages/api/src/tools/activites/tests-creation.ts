import '../../init'
import { writeFileSync } from 'fs'
import { z } from 'zod'
import { knex } from '../../knex'
import { Section, sectionValidator } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { ActiviteId } from 'camino-common/src/activite'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { CaminoAnnee } from 'camino-common/src/date'

const arraySectionValidator = z.array(sectionValidator)
const writeActivitesSectionsForTest = async () => {
  const activitesSections: {
    rows: {
      id: ActiviteId
      type_id: ActivitesTypesId
      sections: Section[]
      annee: CaminoAnnee
    }[]
  } = await knex.raw('select id, sections, type_id, annee from titres_activites')

  const filteredSections = activitesSections.rows
    .filter(activite => {
      const parsed = arraySectionValidator.safeParse(activite.sections)
      if (!parsed.success) {
        console.warn(parsed.error)
        throw new Error(`sections non valides pour l'activité ${activite.id} ${activite.type_id} ${activite.annee}`)
        return false
      }

      return parsed.success
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
