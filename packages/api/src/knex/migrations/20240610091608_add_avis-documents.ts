/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { DemarcheId } from 'camino-common/src/demarche.js'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape.js'
import { AvisStatutId, AvisTypeId } from 'camino-common/src/static/avisTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects.js'
import { newEtapeAvisId } from '../../database/models/_format/id-create.js'
import { CaminoDate } from 'camino-common/src/date.js'

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
  aec: 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités',
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

const etapeTypesToDelete = Object.keys(ETAPE_TYPE_ID_TO_AVIS_TYPE_ID)
const ETAPE_STATUT_ID_TO_AVIS_STATUT_ID: { [key in EtapeStatutId]?: AvisStatutId } = {
  fav: 'Favorable',
  def: 'Défavorable',
  fre: 'Favorable avec réserves',
  fai: 'Favorable',
  dre: 'Défavorable',
} as const
type EtapeFromDb = { id: EtapeId; date: CaminoDate; titre_demarche_id: DemarcheId; type_id: EtapeTypeId; statut_id: EtapeStatutId }
export const up = async (knex: Knex) => {
  await knex.raw(`DELETE FROM etapes_documents where etape_id in (select id FROM titres_etapes where archive is true and type_id in (${etapeTypesToDelete.map(_ => '?').join(',')}))`, [
    ...etapeTypesToDelete,
  ])
  await knex.raw(`DELETE FROM titres_etapes where archive is true and type_id in (${etapeTypesToDelete.map(_ => '?').join(',')})`, [...etapeTypesToDelete])
  // FIXME ajouter visibilité
  // FIXME ajouter les sections d'aof et les mettre dans description
  // FIXME rendre le fichier optionnel, un avis peut ne pas avoir de document
  await knex.raw(
    'CREATE TABLE etape_avis (id character varying(255) NOT NULL, avis_type_id character varying(255) NOT NULL, avis_statut_id character varying(255) NOT NULL, etape_id character varying(255) NOT NULL, description character varying(1024) NOT NULL, date character varying(10) NOT NULL, largeobject_id oid)'
  )

  const allEtapesDb: { rows: EtapeFromDb[] } = await knex.raw(
    `SELECT * FROM titres_etapes
     WHERE titres_etapes.type_id IN (${etapeTypesToDelete.map(_ => '?').join(',')})
     ORDER BY titres_etapes.ordre ASC`,
    [...etapeTypesToDelete]
  )

  const etapesByDemarcheId = allEtapesDb.rows.reduce<Record<DemarcheId, EtapeFromDb[]>>((acc, etape) => {
    if (acc[etape.titre_demarche_id] === undefined) {
      acc[etape.titre_demarche_id] = []
    }
    acc[etape.titre_demarche_id].push(etape)

    return acc
  }, {})

  for (const etapes of Object.values(etapesByDemarcheId)) {
    // @ts-ignore
    const ssrEtape = etapes.find(({ type_id }) => type_id === 'ssr')
    // @ts-ignore
    const aofEtape = etapes.find(({ type_id }) => type_id === 'aof')

    const etapePivotId = ssrEtape?.id ?? aofEtape?.id ?? etapes[0].id

    for (let index = 0; index < etapes.length; index++) {
      const etape = etapes[index]

      // documents et avis vide
      const documents: { rows: { id: EtapeDocumentId; largeobject_id: LargeObjectId; description: string }[] } = await knex.raw(`SELECT * from etapes_documents where etape_id= :id`, { id: etape.id })
      const avisTypeId = ETAPE_TYPE_ID_TO_AVIS_TYPE_ID[etape.type_id]
      const avisStatutId = ETAPE_STATUT_ID_TO_AVIS_STATUT_ID[etape.statut_id]
      if (isNullOrUndefined(avisTypeId) || isNullOrUndefined(avisStatutId)) {
        console.error('une étape type id ou statut non prise en compte', etape)
      } else {
        for (const document of documents.rows) {
          const row = {
            id: document.id,
            avis_type_id: avisTypeId,
            etape_id: etapePivotId,

            description: document.description,
            avis_statut_id: avisStatutId,
            date: etape.date,
            largeobject_id: document.largeobject_id,
          }
          await knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id)',
            { ...row, etape_id: etapePivotId }
          )
          await knex.raw('DELETE FROM etapes_documents WHERE id = :id', { id: row.id })
        }
        if (documents.rows.length === 0) {
          const row = {
            id: newEtapeAvisId(etape.date, avisTypeId),
            avis_type_id: avisTypeId,
            etape_id: etapePivotId,
            description: '',
            avis_statut_id: avisStatutId,
            date: etape.date,
            largeobject_id: null,
          }
          await knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id)',
            { ...row, etape_id: etapePivotId }
          )
        }
      }

      if (etapePivotId === etape.id) {
        await knex.raw(`UPDATE titres_etapes SET type_id = 'asc', statut_id='fai' WHERE id = :id`, {
          id: etape.id,
        })
      } else {
        await knex.raw(`DELETE FROM titres_etapes WHERE id = :id`, {
          id: etape.id,
        })
      }
    }
  }
}

export const down = () => ({})
