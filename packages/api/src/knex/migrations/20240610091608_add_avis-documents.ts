/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'
import { AvisStatutId, AvisTypeId } from 'camino-common/src/static/avisTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { Knex } from 'knex'

const ETAPE_TYPE_ID_TO_AVIS_TYPE_ID: { [key in EtapeTypeId]?: AvisTypeId } = {
  ssr: 'lettreDeSaisineDesServices',
  wss: 'lettreDeSaisineDesServices',
  cps: 'confirmationAccordProprietaireDuSol',
  aac: 'avisDirectionRegionaleDesAffairesCulturelles',
  wac: 'avisDirectionRegionaleDesAffairesCulturelles',
  aaf: 'avisDirectionAlimentationAgricultureForet',
  acd: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
  wat: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
  abs: 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages',
  aec: 'avisDirectionRegionaleEconomieEmploiTravailEtSolidarites',
  afp: 'avisDirectionRegionaleFinancesPubliques',
  agn: 'avisGendarmerieNationale',
  ami: 'avisParcNaturelMarin',
  aim: 'avisIFREMER',
  aof: 'avisOfficeNationalDesForets',
  eof: 'avisOfficeNationalDesForets',
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
      id: string
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
    WHERE titres_etapes.type_id IN ('ssr', 'wss', 'cps', 'aac', 'wac', 'aaf', 'acd', 'wat', 'abs', 'aec', 'afp', 'agn', 'ami', 'aim', 'aof', 'eof', 'aop', 'api', 'apl', 'apm', 'wam', 'apn', 'wdt', 'wad', 'ars', 'was', 'ass', 'wai', 'ari', 'wal', 'auc')
    ORDER BY titres_etapes.date DESC`
  )

  await Promise.all(
    etapesDocuments.rows.flatMap(row => {
      const data = {
        id: row.id,
        avis_type_id: ETAPE_TYPE_ID_TO_AVIS_TYPE_ID[row.etape_type_id],
        etape_id: row.etape_id,
        description: row.description,
        avis_statut_id: ETAPE_STATUT_ID_TO_AVIS_STATUT_ID[row.statut_id],
        date: row.date,
        largeobject_id: row.largeobject_id,
      }

      return [
        knex.raw(`UPDATE titres_etapes SET type_id = 'asc' WHERE id = :id`, {
          id: row.etape_id
        }),
        knex.raw(
          'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id)',
          data
        ),
        knex.raw('DELETE FROM etapes_documents WHERE id = :id', data),
      ]
    })
  )
}

export const down = () => ({})
