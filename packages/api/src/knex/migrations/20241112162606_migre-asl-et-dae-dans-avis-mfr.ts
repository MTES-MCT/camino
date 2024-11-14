import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { AvisStatutId, AvisTypes, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'
import { newEtapeAvisId } from '../../database/models/_format/id-create'

export const up = async (knex: Knex): Promise<void> => {
  const values: {
    rows: {
      id: EtapeId
      type_id: EtapeTypeId
      statut_id: EtapeStatutId
      titre_demarche_id: DemarcheId
      document_id: EtapeDocumentId | null
      description: string | null
      public_lecture: boolean
      entreprises_lecture: boolean
      largeobject_id: unknown
      date: CaminoDate
      contenu?: { mea?: { arrete?: string } }
    }[]
  } = await knex.raw(`
    select te.id, te.contenu, te.type_id, te.statut_id, te.date, te.titre_demarche_id, ed.id as document_id, ed.description, ed.public_lecture, ed.entreprises_lecture, ed.largeobject_id from titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
    left join etapes_documents ed on ed.etape_id = te.id
    where
      t.type_id = 'axm'
    and te.type_id in ('dae', 'asl')
    and te.archive is false
    and td.archive is false
    and t.archive is false
    `)

  for (const etape of values.rows) {
    const demandes: { rows: { id: EtapeId }[] } = await knex.raw("select id from titres_etapes where titre_demarche_id=? and archive is false and type_id='mfr'", etape.titre_demarche_id)

    if (demandes.rows.length !== 1) {
      throw new Error(`demande non trouvée ou plusieurs demandes trouvées ${demandes.rows}`)
    }
    const demande = demandes.rows[0]

    await knex.raw('UPDATE titres_etapes set etape_fondamentale_id=? where etape_fondamentale_id=?', [demande.id, etape.id])

    const avisTypeId = etape.type_id === 'dae' ? AvisTypes.avisDeLaMissionAutoriteEnvironnementale.id : AvisTypes.avisProprietaireDuSol.id

    const description = isNotNullNorUndefined(etape.contenu?.mea?.arrete)
      ? `${etape.description}\nArrêté préfectoral: ${etape.contenu.mea.arrete}`
      : isNotNullNorUndefined(etape.description)
        ? etape.description
        : 'Non renseigné'

    const avisStatutId: AvisStatutId | null =
      etape.statut_id === ETAPES_STATUTS.FAVORABLE
        ? 'Favorable'
        : etape.statut_id === ETAPES_STATUTS.FAVORABLE_AVEC_RESERVE
          ? 'Favorable avec réserves'
          : etape.statut_id === ETAPES_STATUTS.EXEMPTE
            ? 'Exempté'
            : etape.statut_id === ETAPES_STATUTS.REQUIS
              ? 'Requis'
              : etape.statut_id === ETAPES_STATUTS.DEFAVORABLE
                ? 'Défavorable'
                : null
    if (avisStatutId === null) {
      throw new Error(`ce statut ${etape.statut_id} ne devrait pas exister pour cette étape ${etape.type_id}`)
    }
    await knex.raw('INSERT INTO etape_avis (id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      isNotNullNorUndefined(etape.document_id) ? etape.document_id : newEtapeAvisId(avisTypeId),
      avisTypeId,
      avisStatutId,
      etape.public_lecture ? AvisVisibilityIds.Public : etape.entreprises_lecture ? AvisVisibilityIds.TitulairesEtAdministrations : AvisVisibilityIds.Administrations,
      demande.id,
      description,
      etape.date,
      etape.largeobject_id,
    ])
  }
  await knex.raw('DELETE FROM etapes_documents where id = ANY(?)', [values.rows.map(({ document_id }) => document_id).filter(isNotNullNorUndefined)])

  await knex.raw('DELETE FROM titres_etapes where id = ANY(?)', [values.rows.map(({ id }) => id)])
}

export const down = (): void => {}
