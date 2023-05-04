import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  const activitesSections: {
    rows: {
      id: string
      sections: { elements?: { valeurs?: any[]; options?: any[] }[] }[]
    }[]
  } = await knex.raw("select id, sections from titres_activites where sections::text like '%valeurs%' ")

  // Renomme toutes les clés « valeurs » en « options »
  for (const activitesSection of activitesSections.rows) {
    const newSections = []

    for (const section of activitesSection.sections) {
      if (section.elements) {
        for (const element of section.elements) {
          if (element.valeurs) {
            element.options = [...element.valeurs]
            delete element.valeurs
          }
        }
      }

      newSections.push(section)
    }
    await knex.raw('update titres_activites set sections = ? where id = ?', [newSections, activitesSection.id])
  }

  const etapesSections: {
    rows: {
      id: string
      decisions_annexes_sections: { elements?: { valeurs?: any[]; options?: any[] }[] }[]
    }[]
  } = await knex.raw("select id, decisions_annexes_sections from titres_etapes where decisions_annexes_sections::text like '%valeurs%' ")

  for (const etapeSection of etapesSections.rows) {
    const newSections = []

    for (const section of etapeSection.decisions_annexes_sections) {
      if (section.elements) {
        for (const element of section.elements) {
          if (element.valeurs) {
            element.options = [...element.valeurs]
            delete element.valeurs
          }
        }
      }

      newSections.push(section)
    }
    await knex.raw('update titres_etapes set decisions_annexes_sections = ? where id = ?', [newSections, etapeSection.id])
  }
}

export const down = () => ({})
