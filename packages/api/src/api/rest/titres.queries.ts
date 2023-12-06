/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { TitreGet, TitreGetDemarche, TitreId, TitreIdOrSlug, getMostRecentValidValueProp, titreGetValidator, titreIdValidator, titreSlugValidator } from 'camino-common/src/titres.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import {
  IGetAdministrationsLocalesByTitreIdDbQuery,
  IGetDemarchesByTitreIdQueryDbQuery,
  IGetTitreCommunesInternalQuery,
  IGetTitreInternalQuery,
  IGetTitreTypeIdByTitreIdDbQuery,
  IGetTitulairesAmodiatairesByTitreIdDbQuery,
} from './titres.queries.types.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { z } from 'zod'
import { Commune, communeValidator } from 'camino-common/src/static/communes.js'
import { Pool } from 'pg'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes.js'
import { administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'
import { User } from 'camino-common/src/roles.js'
import { titreStatutIdValidator } from 'camino-common/src/static/titresStatuts.js'
import { titreReferenceValidator } from 'camino-common/src/titres-references.js'
import { DemarcheEtape, DemarcheEtapeCommon, DemarcheEtapeFondamentale, DemarcheEtapeNonFondamentale, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche.js'
import { demarcheStatutIdValidator } from 'camino-common/src/static/demarchesStatuts.js'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes.js'
import { getEtapesByDemarcheIdDb, getEtapesByDemarcheIdDbValidator } from './demarches.queries.js'
import { canReadEtape } from './permissions/etapes.js'
import { canReadDemarche } from './permissions/demarches.js'
import { SectionWithValue } from 'camino-common/src/sections.js'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { OmitDistributive, isNonEmptyArray, isNotNullNorUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import {
  getEntrepriseDocumentIdsByEtapeId,
  getDocumentsByEtapeId,
  getPointsByEtapeIdQuery,
  getTitulairesByEtapeIdQuery,
  getAmodiatairesByEtapeIdQuery,
} from '../../database/queries/titres-etapes.queries.js'
import { geojsonFeatureMultiPolygon } from '../../tools/geojson.js'
import { getAdministrationsLocales } from 'camino-common/src/administrations.js'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments.js'
import { isEtapeTypeIdFondamentale } from 'camino-common/src/static/etapesTypes.js'
import { getCommunes } from '../../database/queries/communes.queries.js'
import { EtapeDocument } from 'camino-common/src/etape.js'
import { getDateLastJournal } from './journal.queries.js'

type SuperEtapeDemarcheTitreGet = OmitDistributive<DemarcheEtape, 'documents'>
type SuperDemarcheTitreGet = Omit<TitreGet['demarches'][0], 'etapes'> & { etapes: SuperEtapeDemarcheTitreGet[]; public_lecture: boolean; entreprises_lecture: boolean; titre_public_lecture: boolean }

export const getTitre = async (pool: Pool, user: User, idOrSlug: TitreIdOrSlug): Promise<TitreGet | null> => {
  const titres = await dbQueryAndValidate(getTitreInternal, { id: idOrSlug }, pool, getTitreInternalValidator)

  // FIXME droit de voir le titre
  if (titres.length !== 1) {
    return null
  } else {
    const titre = titres[0]

    const titreDateLastModified = await getDateLastJournal(pool, titre.id)
    const titreDoublon = titre.titre_doublon_id !== null && titre.titre_doublon_nom !== null ? { id: titre.titre_doublon_id, nom: titre.titre_doublon_nom } : null

    const demarchesFromDatabase = await dbQueryAndValidate(getDemarchesByTitreIdQueryDb, { titreId: titre.id }, pool, getDemarchesByTitreIdQueryDbValidator)

    const titreTypeId = memoize(() => Promise.resolve(titre.titre_type_id))

    const superDemarches: SuperDemarcheTitreGet[] = []
    for (const demarche of demarchesFromDatabase) {
      const etapes = await dbQueryAndValidate(getEtapesByDemarcheIdDb, { demarcheId: demarche.id }, pool, getEtapesByDemarcheIdDbValidator)

      const formatedEtapes: SuperEtapeDemarcheTitreGet[] = []
      for (const etape of etapes) {
        const sections = getSections(titre.titre_type_id, demarche.demarche_type_id, etape.etape_type_id)
          .map(section => ({ ...section, elements: section.elements.filter(element => !(etape.heritage_contenu?.[section.id]?.[element.id]?.actif ?? false)) }))
          .filter(section => section.elements.length > 0)

        const contenu: SectionWithValue[] = getSectionsWithValue(sections, etape.contenu)

        const entrepriseDocuments = []

        const entrepriseDocumentsTypes = getEntrepriseDocuments(titre.titre_type_id, demarche.demarche_type_id, etape.etape_type_id)
        if (entrepriseDocumentsTypes.length > 0) {
          entrepriseDocuments.push(...(await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etape.id }, pool, user)))
        }

        const etapeCommon: Omit<DemarcheEtapeCommon, 'documents'> = {
          date: etape.date,
          id: etape.id,
          slug: etape.slug,
          etape_statut_id: etape.etape_statut_id,
          sections_with_values: contenu,
          entreprises_documents: entrepriseDocuments,
          decisions_annexes_contenu: isNotNullNorUndefined(etape.decisions_annexes_contenu) ? etape.decisions_annexes_contenu : null,
          decisions_annexes_sections: isNotNullNorUndefined(etape.decisions_annexes_sections) ? etape.decisions_annexes_sections : null,
        }
        if (isEtapeTypeIdFondamentale(etape.etape_type_id)) {
          let perimetre: DemarcheEtapeFondamentale['fondamentale']['perimetre'] = null
          if (!(etape.heritage_props?.points?.actif ?? false)) {
            const etapePoints = await getPointsByEtapeIdQuery(etape.id, pool)

            if (etapePoints.length > 0) {
              const communes: Commune[] = []
              if (isNonEmptyArray(etape.communes)) {
                const ids = etape.communes.map(({ id }) => id)
                if (isNonEmptyArray(ids)) {
                  communes.push(...(await getCommunes(pool, { ids })))
                }
              }

              perimetre = {
                geojsonMultiPolygon: geojsonFeatureMultiPolygon(etapePoints),
                communes,
                secteurs_maritimes: etape.secteurs_maritime ?? [],
                sdom_zones: etape.sdom_zones ?? [],
                surface: etape.surface,
                forets: etape.forets ?? [],
              }
            }
          }

          let titulaires = null
          if (!(etape.heritage_props?.titulaires?.actif ?? false)) {
            const titulairesDb = await getTitulairesByEtapeIdQuery(etape.id, pool)

            if (titulairesDb.length > 0) {
              titulaires = titulairesDb
            }
          }

          let amodiataires = null
          if (!(etape.heritage_props?.amodiataires?.actif ?? false)) {
            const amodiatairesDb = await getAmodiatairesByEtapeIdQuery(etape.id, pool)

            if (amodiatairesDb.length > 0) {
              amodiataires = amodiatairesDb
            }
          }

          const etapeFondamentale: Omit<DemarcheEtapeFondamentale, 'documents'> = {
            etape_type_id: etape.etape_type_id,
            fondamentale: {
              amodiataires,
              titulaires,
              date_debut: isNotNullNorUndefined(etape.date_debut) && !(etape.heritage_props?.date_debut?.actif ?? false) ? etape.date_debut : null,
              date_fin: isNotNullNorUndefined(etape.date_fin) && !(etape.heritage_props?.date_fin?.actif ?? false) ? etape.date_fin : null,
              duree: isNotNullNorUndefined(etape.duree) && !(etape.heritage_props?.duree?.actif ?? false) ? etape.duree : null,
              substances: isNotNullNorUndefined(etape.substances) && !(etape.heritage_props?.substances?.actif ?? false) ? etape.substances : null,
              perimetre,
            },
            ...etapeCommon,
          }

          formatedEtapes.push(etapeFondamentale)
        } else {
          const etapeNonFondamentale: Omit<DemarcheEtapeNonFondamentale, 'documents'> = { etape_type_id: etape.etape_type_id, ...etapeCommon }

          formatedEtapes.push(etapeNonFondamentale)
        }
      }

      const formatedDemarche: SuperDemarcheTitreGet = {
        id: demarche.id,
        slug: demarche.slug,
        description: demarche.description,
        demarche_type_id: demarche.demarche_type_id,
        demarche_statut_id: demarche.demarche_statut_id,
        public_lecture: demarche.public_lecture,
        entreprises_lecture: demarche.entreprises_lecture,
        demarche_date_debut: demarche.demarche_date_debut,
        demarche_date_fin: demarche.demarche_date_fin,
        titre_public_lecture: titre.public_lecture,
        etapes: formatedEtapes.map(e => ({ ...e, documents: [] })),
      }

      superDemarches.push(formatedDemarche)
    }

    const administrationsLocales = memoize(() => {
      const perimetre = getMostRecentValidValueProp('perimetre', superDemarches)

      return Promise.resolve(
        getAdministrationsLocales(
          perimetre?.communes.map(({ id }) => id),
          perimetre?.secteurs_maritimes
        )
      )
    })
    const entreprisesTitulairesOuAmodiataires = memoize(() => {
      const titulaires = getMostRecentValidValueProp('titulaires', superDemarches) ?? []
      const amodiataires = getMostRecentValidValueProp('amodiataires', superDemarches) ?? []

      return Promise.resolve([...titulaires.map(({ id }) => id), ...amodiataires.map(({ id }) => id)])
    })

    const formattedDemarches: TitreGetDemarche[] = []
    for (const superDemarche of superDemarches) {
      if (await canReadDemarche(superDemarche, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)) {
        const etapes: DemarcheEtape[] = []
        for (const superEtape of superDemarche.etapes) {
          const canRead: boolean = await canReadEtape(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, superEtape.etape_type_id, superDemarche)
          if (canRead) {
            const documents: EtapeDocument[] = []
            const documentsTypes = getDocuments(titre.titre_type_id, superDemarche.demarche_type_id, superEtape.etape_type_id)
            if (documentsTypes.length > 0) {
              documents.push(
                ...(await getDocumentsByEtapeId(superEtape.id, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, superEtape.etape_type_id, superDemarche))
              )
            }
            etapes.push({ ...superEtape, documents })
          }
        }

        formattedDemarches.push({
          id: superDemarche.id,
          slug: superDemarche.slug,
          description: superDemarche.description,
          demarche_type_id: superDemarche.demarche_type_id,
          demarche_statut_id: superDemarche.demarche_statut_id,
          demarche_date_debut: superDemarche.demarche_date_debut,
          demarche_date_fin: superDemarche.demarche_date_fin,
          etapes,
        })
      }
    }
    const titreFinal: TitreGet = {
      id: titre.id,
      nom: titre.nom,
      slug: titre.slug,
      titre_statut_id: titre.titre_statut_id,
      titre_type_id: titre.titre_type_id,
      titre_doublon: titreDoublon,
      titre_last_modified_date: titreDateLastModified,
      references: titre.references,
      demarches: formattedDemarches,
    }

    return titreGetValidator.parse(titreFinal)
  }
}

const getTitreInternalValidator = z.object({
  id: titreIdValidator,
  nom: z.string(),
  slug: titreSlugValidator,
  titre_statut_id: titreStatutIdValidator,
  titre_type_id: titreTypeIdValidator,
  titre_doublon_id: titreIdValidator.nullable(),
  titre_doublon_nom: z.string().nullable(),
  public_lecture: z.boolean().default(false),
  references: z.array(titreReferenceValidator),
})

type GetTitreInternalValidator = z.infer<typeof getTitreInternalValidator>
// TODO 2023-12-07 on enlève l'héritage dans l'API ?
const getTitreInternal = sql<Redefine<IGetTitreInternalQuery, { id: TitreIdOrSlug }, GetTitreInternalValidator>>`
select
    t.id,
    t.nom,
    t.slug,
    t.titre_statut_id,
    t.type_id as titre_type_id,
    t_doublon.id as titre_doublon_id,
    t_doublon.nom as titre_doublon_nom,
    t.references,
    t.public_lecture
from
    titres t
    left join titres t_doublon on t_doublon.id = t.doublon_titre_id
where
    t.id = $ id !
    or t.slug = $ id !
LIMIT 1
`

export const getTitreCommunes = async (pool: Pool, params: { id: TitreId }) => dbQueryAndValidate(getTitreCommunesInternal, params, pool, communeValidator)

const getTitreCommunesInternal = sql<Redefine<IGetTitreCommunesInternalQuery, { id: TitreId }, Commune>>`
select
    c.id,
    c.nom
from
    titres t
    join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
    join jsonb_array_elements(te.communes) as etapes_communes on true
    join communes c on c.id = etapes_communes ->> 'id'
where
    t.id = $ id
`

export const getTitreTypeIdByTitreIdQuery = async (titreId: TitreId, pool: Pool) => {
  const typeIds = await dbQueryAndValidate(getTitreTypeIdByTitreIdDb, { titreId }, pool, titreTypeIdObjectValidator)
  if (typeIds.length === 0) {
    throw new Error(`Pas de type de titre trouvé pour le titre '${titreId}'`)
  }

  return typeIds[0].titre_type_id
}

const titreTypeIdObjectValidator = z.object({ titre_type_id: titreTypeIdValidator })
const getTitreTypeIdByTitreIdDb = sql<Redefine<IGetTitreTypeIdByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof titreTypeIdObjectValidator>>>`
select
    t.type_id as titre_type_id
from
    titres t
where
    t.id = $ titreId !
`

export const getAdministrationsLocalesByTitreIdQuery = async (titreId: TitreId, pool: Pool) => {
  const admins = await dbQueryAndValidate(getAdministrationsLocalesByTitreIdDb, { titreId }, pool, administrationsLocalesValidator)
  if (admins.length > 1) {
    throw new Error(`Trop d'administrations locales trouvées pour l'activité ${titreId}`)
  }
  if (admins.length === 0) {
    return []
  }

  return admins[0].administrations_locales
}

const administrationsLocalesValidator = z.object({ administrations_locales: z.array(administrationIdValidator) })

const getAdministrationsLocalesByTitreIdDb = sql<Redefine<IGetAdministrationsLocalesByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof administrationsLocalesValidator>>>`
select
    te.administrations_locales
from
    titres t
    left join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
where
    t.id = $ titreId !
`

export const getTitulairesAmodiatairesByTitreIdQuery = async (titreId: TitreId, pool: Pool) => {
  const entreprises = await dbQueryAndValidate(getTitulairesAmodiatairesByTitreIdDb, { titreId }, pool, entrepriseIdObjectValidator)

  return entreprises.map(({ id }) => id)
}

const entrepriseIdObjectValidator = z.object({ id: entrepriseIdValidator })
const getTitulairesAmodiatairesByTitreIdDb = sql<Redefine<IGetTitulairesAmodiatairesByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof entrepriseIdObjectValidator>>>`
select distinct
    e.id
from
    entreprises e,
    titres t
    left join titres_titulaires tt on tt.titre_etape_id = t.props_titre_etapes_ids ->> 'titulaires'
    left join titres_amodiataires tta on tta.titre_etape_id = t.props_titre_etapes_ids ->> 'amodiataires'
where
    t.id = $ titreId !
    and (tt.entreprise_id = e.id
        or tta.entreprise_id = e.id)
`

const getDemarchesByTitreIdQueryDbValidator = z.object({
  id: demarcheIdValidator,
  slug: demarcheSlugValidator,
  description: z.string().nullable(),
  demarche_type_id: demarcheTypeIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  public_lecture: z.boolean().default(false),
  entreprises_lecture: z.boolean().default(false),
  demarche_date_debut: caminoDateValidator.nullable(),
  demarche_date_fin: caminoDateValidator.nullable(),
})
type GetDemarchesByTitreIdQueryDb = z.infer<typeof getDemarchesByTitreIdQueryDbValidator>

const getDemarchesByTitreIdQueryDb = sql<Redefine<IGetDemarchesByTitreIdQueryDbQuery, { titreId: TitreId }, GetDemarchesByTitreIdQueryDb>>`
select
    d.id,
    d.slug,
    d.description,
    d.type_id as demarche_type_id,
    d.statut_id as demarche_statut_id,
    d.public_lecture,
    d.entreprises_lecture,
    d.demarche_date_debut,
    d.demarche_date_fin
from
    titres_demarches d
where
    d.titre_id = $ titreId !
    and d.archive is false
order by
    ordre
`
