import { Knex } from 'knex'
import TitresEtapesJustificatifs from '../../database/models/titres-etapes-justificatifs.js'
import Document from '../../database/models/documents.js'
import fileRename from '../../tools/file-rename.js'
import { documentFilePathFind } from '../../tools/documents/document-path-find.js'

export const up = async (knex: Knex) => {
  await knex('titres_types__demarches_types__etapes_types__justificatifs_t')
    .where('document_type_id', 'jpa')
    .delete()

  await knex(
    'titres_types__demarches_types__etapes_types__documents_types'
  ).insert({
    titreTypeId: 'arm',
    demarcheTypeId: 'oct',
    etapeTypeId: 'mfr',
    documentTypeId: 'jpa'
  })

  const titreEtapeJustificatifs: any[] = await TitresEtapesJustificatifs.query()
    .leftJoinRelated('document')
    .where('document.typeId', 'jpa')
    .withGraphFetched('[document, etape]')

  for (const titreEtapeJustificatif of titreEtapeJustificatifs) {
    await TitresEtapesJustificatifs.query()
      .delete()
      .where('titreEtapeId', titreEtapeJustificatif.titreEtapeId)
      .where('documentId', titreEtapeJustificatif.documentId)

    await Document.query().patchAndFetchById(
      titreEtapeJustificatif.documentId,
      { entrepriseId: null, titreEtapeId: titreEtapeJustificatif.titreEtapeId }
    )

    const pathFrom = await documentFilePathFind(titreEtapeJustificatif.document)
    const pathTo = await documentFilePathFind(
      {
        ...titreEtapeJustificatif.document,
        entrepriseId: undefined,
        titreEtapeId: titreEtapeJustificatif.titreEtapeId
      },
      true
    )
    try {
      await fileRename(pathFrom, pathTo)
    } catch (e) {
      // console.log(e)
    }
  }
}

export const down = () => ({})
