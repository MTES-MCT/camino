import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex('documentsTypes').insert({ id: 'nip', nom: 'Notice d’impact' })
  await knex('titresTypes__demarchesTypes__etapesTypes__documentsTypes').insert(
    {
      titreTypeId: 'axm',
      demarcheTypeId: 'oct',
      etapeTypeId: 'mfr',
      documentTypeId: 'nip',
      optionnel: true
    }
  )

  const noticesIncidences = await knex('documents').where('typeId', 'noi')
  for (const noticeIncidence of noticesIncidences) {
    const etape = await knex('titresEtapes')
      .where('id', noticeIncidence.titreEtapeId)
      .first()
    if (etape && etape.slug.startsWith('m-ax-')) {
      await knex('documents')
        .where('id', noticeIncidence.id)
        .update({ ...noticeIncidence, typeId: 'nip' })
    }
  }
}

export const down = () => ({})
