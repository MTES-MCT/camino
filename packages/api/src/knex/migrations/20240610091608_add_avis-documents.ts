/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { AvisStatutId, AvisTypeId } from 'camino-common/src/static/avisTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getKeys, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'

const ETAPE_TYPE_ID_TO_AVIS_TYPE_ID: { [key in string]?: AvisTypeId } = {
  ssr: 'lettreDeSaisineDesServices',
  wss: 'lettreDeSaisineDesServices',
  cps: 'confirmationAccordProprietaireDuSol',
  aac: 'avisDirectionRegionaleDesAffairesCulturelles',
  wac: 'avisDirectionRegionaleDesAffairesCulturelles',
  aaf: 'avisDirectionAlimentationAgricultureForet',
  acd: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
  wat: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
  abs: 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages',
  afp: 'avisDirectionRegionaleFinancesPubliques',
  agn: 'avisGendarmerieNationale',
  ami: 'avisParcNaturelMarin',
  aim: 'avisIFREMER',
  aof: 'avisOfficeNationalDesForets',
  eof: 'expertiseOfficeNationalDesForets',
  aop: 'avisInstitutNationalOrigineQualite',
  api: 'avisEtatMajorOrpaillagePecheIllicite',
  apl: 'avisServiceAdministratifLocal',
  apm: 'avisAutoriteMilitaire',
  wam: 'avisAutoriteMilitaire',
  apn: 'avisParcNational',
  wdt: 'avisDirectionDepartementaleTerritoiresMer',
  wad: 'avisDirectionDepartementaleTerritoiresMer',
  ars: 'avisAgenceRegionaleSante',
  was: 'avisAgenceRegionaleSante',
  ass: 'avisCaisseGeneraleSecuriteSociale',
  wai: 'autreAvis',
  ari: 'autreAvis',
  wal: 'autreAvis',
  pnr: 'autreAvis',
  auc: 'autreAvis',
} as const

const ETAPE_STATUT_ID_TO_AVIS_STATUT_ID: { [key in EtapeStatutId]?: AvisStatutId } = {
  fav: 'Favorable',
  def: 'Défavorable',
  fre: 'Favorable avec réserves',
  fai: 'Favorable',
  dre: 'Défavorable',
} as const

export const up = async (knex: Knex) => {
  const etapesDocuments: {
    rows: {
      id: EtapeDocumentId
      largeobject_id: string
      date: string
      statut_id: EtapeStatutId
      titre_demarche_id: DemarcheId
      description: string
      etape_id: EtapeId
      etape_type_id: EtapeTypeId
    }[]
  } = await knex.raw(
    `SELECT
        etapes_documents.id,
        etapes_documents.largeobject_id,
        titres_etapes.date,
        titres_etapes.statut_id,
        titres_etapes.titre_demarche_id,
        etapes_documents.description,
        titres_etapes.id AS etape_id,
        titres_etapes.type_id AS etape_type_id
    FROM etapes_documents
    LEFT JOIN titres_etapes ON etapes_documents.etape_id = titres_etapes.id
    WHERE titres_etapes.type_id IN ('ssr', 'wss', 'cps', 'aac', 'wac', 'aaf', 'acd', 'wat', 'abs', 'afp', 'agn', 'ami', 'aim', 'aof', 'eof', 'aop', 'api', 'apl', 'apm', 'wam', 'apn', 'wdt', 'wad', 'ars', 'was', 'ass', 'wai', 'ari', 'wal', 'pnr', 'auc')
    ORDER BY titres_etapes.date DESC`
  )

  const etapesByDemarche = etapesDocuments.rows.reduce<
    Record<DemarcheId, { id: EtapeDocumentId; avis_type_id: AvisTypeId; etape_id: EtapeId; description: string; avis_statut_id: AvisStatutId; date: string; largeobject_id: string }[]>
  >((acc, row) => {
    if (acc[row.titre_demarche_id] === undefined) {
      acc[row.titre_demarche_id] = []
    }
    const avisTypeId = ETAPE_TYPE_ID_TO_AVIS_TYPE_ID[row.etape_type_id]
    const avisStatutId = ETAPE_STATUT_ID_TO_AVIS_STATUT_ID[row.statut_id]
    if (isNullOrUndefined(avisTypeId) || isNullOrUndefined(avisStatutId)) {
      console.error('une étape type id ou statut non prise en compte', row)
    } else {
      acc[row.titre_demarche_id].push({
        id: row.id,
        avis_type_id: avisTypeId,
        etape_id: row.etape_id,
        description: row.description,
        avis_statut_id: avisStatutId,
        date: row.date,
        largeobject_id: row.largeobject_id,
      })
    }

    return acc
  }, {})

  await Promise.all(
    getKeys(etapesByDemarche, (id): id is DemarcheId => demarcheIdValidator.safeParse(id).success).flatMap((demarcheId: DemarcheId) => {
      const etapeId = etapesByDemarche[demarcheId][0].etape_id

      return etapesByDemarche[demarcheId].map((row, index) => {
        const results = []
        if (index === 0) {
          results.push(
            knex.raw(`UPDATE titres_etapes SET type_id = 'asc' WHERE id = :id`, {
              id: row.etape_id,
            })
          )
        } else {
          results.push(
            knex.raw(`DELETE FROM titres_etapes WHERE id = :id`, {
              id: row.etape_id,
            })
          )
        }

        results.push(
          knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id)',
            { ...row, etape_id: etapeId }
          ),
          knex.raw('DELETE FROM etapes_documents WHERE id = :id', { id: row.id })
        )

        return results
      })
    })
  )
}

export const down = () => ({})
