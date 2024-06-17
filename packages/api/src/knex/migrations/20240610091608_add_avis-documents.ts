/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { DemarcheId } from 'camino-common/src/demarche.js'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape.js'
import { AvisStatutId, AvisTypeId, AvisVisibilityId, AvisVisibilityIds } from 'camino-common/src/static/avisTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects.js'
import { newEtapeAvisId } from '../../database/models/_format/id-create.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { Section, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { valeurFind } from 'camino-common/src/sections.js'
import { Contenu } from 'camino-common/src/permissions/sections.js'

const oldSections = {
  eof: [
    {
      id: 'onf',
      nom: 'Office National des Forêts',
      elements: [
        { id: 'motifs', nom: 'Motifs', type: 'textarea', optionnel: true, description: "Élément d'expertise" },
        { id: 'expert', nom: 'Expert', type: 'text', optionnel: true, description: "Agent ONF qui a réalisé l'expertise" },
        { id: 'agent', nom: 'Agent', type: 'text', optionnel: true, description: 'Chargé de mission foncier du Service Aménagement du Territoire' },
        {
          id: 'dateDebut',
          nom: 'Date de début',
          type: 'date',
          optionnel: true,
          description: 'Date de début de l’expertise',
        },
      ],
    },
  ],
  aof: [
    {
      id: 'onf',
      nom: 'Office National des Forêts',
      elements: [
        { id: 'motifs', nom: 'Motifs', type: 'textarea', optionnel: true, description: "Élément d'expertise" },
        {
          id: 'signataire',
          nom: 'Signataire',
          type: 'text',
          optionnel: true,
          description: 'Directeur ONF ou responsable du service Service Aménagement du Territoire qui apparaitra sur les documents externe pour signature',
        },
      ],
    },
  ],
} as const

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
const getVisibilityId = (etapeDocument: Pick<DocumentFromDb, 'public_lecture' | 'entreprises_lecture'>): AvisVisibilityId => {
  if (etapeDocument.public_lecture) {
    return AvisVisibilityIds.Public
  }

  if (etapeDocument.entreprises_lecture) {
    return AvisVisibilityIds.TitulairesEtAdministrations
  }

  return AvisVisibilityIds.Administrations
}
const etapeTypesToDelete = Object.keys(ETAPE_TYPE_ID_TO_AVIS_TYPE_ID)
const ETAPE_STATUT_ID_TO_AVIS_STATUT_ID: { [key in EtapeStatutId]?: AvisStatutId } = {
  fav: 'Favorable',
  def: 'Défavorable',
  fre: 'Favorable avec réserves',
  fai: 'Favorable',
  dre: 'Défavorable',
} as const
type EtapeFromDb = { id: EtapeId; date: CaminoDate; titre_demarche_id: DemarcheId; type_id: EtapeTypeId | 'eof' | 'aof'; statut_id: EtapeStatutId; contenu: Contenu }
type DocumentFromDb = { id: EtapeDocumentId; largeobject_id: LargeObjectId; description: string; public_lecture: boolean; entreprises_lecture: boolean }
export const up = async (knex: Knex) => {
  await knex.raw(`DELETE FROM etapes_documents where etape_id in (select id FROM titres_etapes where archive is true and type_id in (${etapeTypesToDelete.map(_ => '?').join(',')}))`, [
    ...etapeTypesToDelete,
  ])
  await knex.raw(`DELETE FROM titres_etapes where archive is true and type_id in (${etapeTypesToDelete.map(_ => '?').join(',')})`, [...etapeTypesToDelete])
  await knex.raw(
    'CREATE TABLE etape_avis (id character varying(255) NOT NULL, avis_type_id character varying(255) NOT NULL, avis_statut_id character varying(255) NOT NULL, avis_visibility_id character varying(255) NOT NULL, etape_id character varying(255) NOT NULL, description character varying(1024) NOT NULL, date character varying(10) NOT NULL, largeobject_id oid)'
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
      const documents: { rows: DocumentFromDb[] } = await knex.raw(`SELECT * from etapes_documents where etape_id= :id`, { id: etape.id })
      const avisTypeId = ETAPE_TYPE_ID_TO_AVIS_TYPE_ID[etape.type_id]
      const avisStatutId = ETAPE_STATUT_ID_TO_AVIS_STATUT_ID[etape.statut_id]
      if (isNullOrUndefined(avisTypeId) || isNullOrUndefined(avisStatutId)) {
        console.error('une étape type id ou statut non prise en compte', etape)
      } else {
        const titreTypeIdDemarcheTypeId: { rows: [{ titre_type_id: TitreTypeId; demarche_type_id: DemarcheTypeId }] } = await knex.raw(
          `
          SELECT t.type_id as titre_type_id, d.type_id as demarche_type_id from titres_demarches d join titres t on t.id = d.titre_id where d.id= :id`,
          { id: etape.titre_demarche_id }
        )
        let sections: DeepReadonly<Section[]> = []
        if (titreTypeIdDemarcheTypeId.rows[0].titre_type_id === 'arm' && titreTypeIdDemarcheTypeId.rows[0].demarche_type_id === 'oct' && (etape.type_id === 'eof' || etape.type_id === 'aof')) {
          sections = oldSections[etape.type_id]
        }
        let descriptionSections: string = ''

        if (isNotNullNorUndefinedNorEmpty(sections)) {
          const sectionsWithValue = getSectionsWithValue(sections, etape.contenu)
          for (const section of sectionsWithValue) {
            for (const element of section.elements) {
              descriptionSections += `\n - ${element.nom} : ${valeurFind(element)}`
            }
          }
        }

        for (let i = 0; i < documents.rows.length; i++) {
          const document = documents.rows[i]

          let description: string = document.description ?? ''
          if (i === 0) {
            description = `${description}\n${descriptionSections}`
          }
          const row = {
            id: document.id,
            avis_type_id: avisTypeId,
            etape_id: etapePivotId,

            description,
            avis_statut_id: avisStatutId,
            date: etape.date,
            largeobject_id: document.largeobject_id,
            avis_visibility_id: getVisibilityId(document),
          }
          await knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id, avis_visibility_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id, :avis_visibility_id)',
            { ...row, etape_id: etapePivotId }
          )
          await knex.raw('DELETE FROM etapes_documents WHERE id = :id', { id: row.id })
        }
        if (documents.rows.length === 0) {
          const row = {
            id: newEtapeAvisId(etape.date, avisTypeId),
            avis_type_id: avisTypeId,
            etape_id: etapePivotId,
            description: descriptionSections,
            avis_statut_id: avisStatutId,
            date: etape.date,
            largeobject_id: null,
            avis_visibility_id: 'Administrations',
          }
          await knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id, avis_visibility_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id, :avis_visibility_id)',
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
