import { sql } from '@pgtyped/runtime'
import { getMostRecentValuePropFromEtapeFondamentaleValide, TitreGet, TitreGetDemarche, titreGetValidator } from 'camino-common/src/titres'
import { Redefine, dbQueryAndValidate } from '../../pg-database'
import {
  IGetAdministrationsLocalesByTitreIdDbQuery,
  IGetDemarchesByTitreIdQueryDbQuery,
  IGetDoublonsByTitreIdDbQuery,
  IGetTitreByIdOrSlugDbQuery,
  IGetTitreInternalQuery,
  IGetTitulairesAmodiatairesByTitreIdDbQuery,
} from './titres.queries.types'
import { caminoDateValidator } from 'camino-common/src/date'
import { z } from 'zod'
import { Commune, communeIdValidator } from 'camino-common/src/static/communes'
import { Pool } from 'pg'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { User } from 'camino-common/src/roles'
import { titreStatutIdValidator } from 'camino-common/src/static/titresStatuts'
import { titreReferenceValidator } from 'camino-common/src/titres-references'
import { DemarcheEtape, DemarcheEtapeCommon, DemarcheEtapeFondamentale, DemarcheEtapeNonFondamentale, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { demarcheStatutIdValidator } from 'camino-common/src/static/demarchesStatuts'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { getEtapesByDemarcheId } from './demarches.queries'
import { canReadEtape } from './permissions/etapes'
import { canReadDemarche } from './permissions/demarches'
import { SectionWithValue } from 'camino-common/src/sections'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { OmitDistributive, isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, memoize } from 'camino-common/src/typescript-tools'
import { getEntrepriseDocumentIdsByEtapeId, getDocumentsByEtapeId, getEtapeAvisLargeObjectIdsByEtapeId } from '../../database/queries/titres-etapes.queries'
import { getAdministrationsLocales } from 'camino-common/src/administrations'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { isEtapeTypeIdFondamentale } from 'camino-common/src/static/etapesTypes'
import { getCommunes } from '../../database/queries/communes.queries'
import { EtapeAvis, EtapeDocument } from 'camino-common/src/etape'
import { getDateLastJournal } from './journal.queries'
import { canHaveActivites, canReadTitre } from 'camino-common/src/permissions/titres'
import { canReadTitreActivites } from 'camino-common/src/permissions/activites'
import { TitreIdOrSlug, titreIdValidator, titreSlugValidator, TitreId } from 'camino-common/src/validators/titres'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades'
import { getAvisTypes } from 'camino-common/src/permissions/etape-form'

type SuperEtapeDemarcheTitreGet = OmitDistributive<DemarcheEtape, 'etape_documents' | 'avis_documents'>
type SuperDemarcheTitreGet = Omit<TitreGet['demarches'][0], 'etapes'> & { etapes: SuperEtapeDemarcheTitreGet[]; public_lecture: boolean; entreprises_lecture: boolean; titre_public_lecture: boolean }

export const getTitre = async (pool: Pool, user: User, idOrSlug: TitreIdOrSlug): Promise<TitreGet | null> => {
  const titres = await dbQueryAndValidate(getTitreInternal, { id: idOrSlug }, pool, getTitreInternalValidator)
  if (titres.length !== 1) {
    return null
  } else {
    const titre = titres[0]

    const titreDateLastModified = await getDateLastJournal(pool, titre.id)
    const titreDoublon = titre.titre_doublon_id !== null && titre.titre_doublon_nom !== null ? { id: titre.titre_doublon_id, nom: titre.titre_doublon_nom } : null

    const demarchesFromDatabase = await getDemarchesByTitreId(pool, titre.id)

    const titreTypeId = memoize(() => Promise.resolve(titre.titre_type_id))

    const superDemarches: SuperDemarcheTitreGet[] = []
    for (const demarche of demarchesFromDatabase) {
      const etapes = await getEtapesByDemarcheId(pool, demarche.id)

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

        const etapeCommon: Omit<DemarcheEtapeCommon, 'etape_documents' | 'avis_documents'> = {
          date: etape.date,
          ordre: etape.ordre,
          note: etape.note,
          id: etape.id,
          slug: etape.slug,
          etape_statut_id: etape.etape_statut_id,
          sections_with_values: contenu,
          entreprises_documents: entrepriseDocuments,
          is_brouillon: etape.is_brouillon,
        }
        if (isEtapeTypeIdFondamentale(etape.etape_type_id)) {
          let perimetre: DemarcheEtapeFondamentale['fondamentale']['perimetre'] = null
          if (!(etape.heritage_props?.perimetre?.actif ?? false)) {
            if (isNotNullNorUndefined(etape.geojson4326_perimetre) && isNotNullNorUndefined(etape.geojson_origine_perimetre) && isNotNullNorUndefined(etape.geojson_origine_geo_systeme_id)) {
              const communes: Commune[] = []
              if (isNonEmptyArray(etape.communes)) {
                const ids = etape.communes.map(({ id }) => id)
                if (isNonEmptyArray(ids)) {
                  communes.push(...(await getCommunes(pool, { ids })))
                }
              }

              perimetre = {
                geojson4326_perimetre: {
                  type: 'Feature',
                  properties: {},
                  geometry: etape.geojson4326_perimetre,
                },

                geojson4326_points: etape.geojson4326_points,
                geojson_origine_points: etape.geojson_origine_points,
                geojson_origine_perimetre: etape.geojson_origine_perimetre,
                geojson_origine_geo_systeme_id: etape.geojson_origine_geo_systeme_id,
                geojson4326_forages: etape.geojson4326_forages,
                geojson_origine_forages: etape.geojson_origine_forages,
                communes,
                secteurs_maritimes: etape.secteurs_maritime ?? [],
                sdom_zones: etape.sdom_zones ?? [],
                surface: etape.surface,
                forets: etape.forets ?? [],
              }
            }
          }

          let titulaireIds = null
          if (!(etape.heritage_props?.titulaires?.actif ?? false)) {
            const titulaireIdsDb = etape.titulaire_ids

            if (titulaireIdsDb.length > 0) {
              titulaireIds = titulaireIdsDb
            }
          }

          let amodiataireIds = null
          if (!(etape.heritage_props?.amodiataires?.actif ?? false)) {
            const amodiataireIdsDb = etape.amodiataire_ids

            if (amodiataireIdsDb.length > 0) {
              amodiataireIds = amodiataireIdsDb
            }
          }

          const etapeFondamentale: Omit<DemarcheEtapeFondamentale, 'etape_documents' | 'avis_documents'> = {
            etape_type_id: etape.etape_type_id,
            fondamentale: {
              amodiataireIds,
              titulaireIds,
              date_debut: isNotNullNorUndefined(etape.date_debut) && !(etape.heritage_props?.dateDebut?.actif ?? false) ? etape.date_debut : null,
              date_fin: isNotNullNorUndefined(etape.date_fin) && !(etape.heritage_props?.dateFin?.actif ?? false) ? etape.date_fin : null,
              duree: isNotNullNorUndefined(etape.duree) && !(etape.heritage_props?.duree?.actif ?? false) ? etape.duree : null,
              substances: isNotNullNorUndefined(etape.substances) && !(etape.heritage_props?.substances?.actif ?? false) ? etape.substances : null,
              perimetre,
            },
            ...etapeCommon,
          }

          formatedEtapes.push(etapeFondamentale)
        } else {
          const etapeNonFondamentale: Omit<DemarcheEtapeNonFondamentale, 'etape_documents' | 'avis_documents'> = { etape_type_id: etape.etape_type_id, ...etapeCommon }

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
        ordre: demarche.ordre,
      }

      superDemarches.push(formatedDemarche)
    }

    const perimetre = getMostRecentValuePropFromEtapeFondamentaleValide('perimetre', superDemarches)
    const titulaires = getMostRecentValuePropFromEtapeFondamentaleValide('titulaireIds', superDemarches)
    const amodiataires = getMostRecentValuePropFromEtapeFondamentaleValide('amodiataireIds', superDemarches)

    const administrationsLocales = memoize(() => {
      return Promise.resolve(
        getAdministrationsLocales(
          perimetre?.communes.map(({ id }) => id),
          perimetre?.secteurs_maritimes
        )
      )
    })
    const entreprisesTitulairesOuAmodiataires = memoize(() => {
      return Promise.resolve([...(titulaires ?? []), ...(amodiataires ?? [])])
    })

    if (!(await canReadTitre(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, titre))) {
      return null
    }

    const formattedDemarches: TitreGetDemarche[] = []
    for (const superDemarche of superDemarches) {
      if (await canReadDemarche(superDemarche, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)) {
        const etapes: DemarcheEtape[] = []
        for (const superEtape of superDemarche.etapes) {
          const canRead: boolean = await canReadEtape(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, superEtape.etape_type_id, superDemarche)
          if (canRead) {
            const etape_documents: EtapeDocument[] = []
            const documentsTypes = getDocuments(titre.titre_type_id, superDemarche.demarche_type_id, superEtape.etape_type_id)
            if (isNotNullNorUndefinedNorEmpty(documentsTypes)) {
              etape_documents.push(
                ...(await getDocumentsByEtapeId(superEtape.id, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, superEtape.etape_type_id, superDemarche))
              )
            }

            const avis_documents: EtapeAvis[] = []
            const avisTypes = getAvisTypes(superEtape.etape_type_id, titre.titre_type_id, perimetre?.communes.map(({ id }) => id) ?? [])
            if (isNotNullNorUndefinedNorEmpty(avisTypes)) {
              const avisWithLargeObjectId = await getEtapeAvisLargeObjectIdsByEtapeId(
                superEtape.id,
                pool,
                user,
                titreTypeId,
                administrationsLocales,
                entreprisesTitulairesOuAmodiataires,
                superEtape.etape_type_id,
                superDemarche
              )

              avis_documents.push(...avisWithLargeObjectId.map(a => ({ ...a, has_file: isNotNullNorUndefined(a.largeobject_id) })))
            }

            etapes.push({ ...superEtape, etape_documents, avis_documents })
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
          ordre: superDemarche.ordre,
        })
      }
    }
    let nb_activites_to_do: number | null = null

    if (
      canHaveActivites({
        titreTypeId: titre.titre_type_id,
        communes: perimetre?.communes ?? [],
        demarches: formattedDemarches,
        secteursMaritime: perimetre?.secteurs_maritimes ?? [],
      }) &&
      (await canReadTitreActivites(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires))
    ) {
      nb_activites_to_do = titre.nb_activites_to_do
    }

    const titreFinal: TitreGet = {
      nb_activites_to_do,
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
  nb_activites_to_do: z.coerce.number(),
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
    t.public_lecture,
    (
        select
            count(a.id)
        from
            titres_activites a
        where
            a.titre_id = t.id
            and a.activite_statut_id in ('abs', 'enc')) as nb_activites_to_do
from
    titres t
    left join titres t_doublon on t_doublon.id = t.doublon_titre_id
where
    (t.id = $ id !
    or t.slug = $ id !) AND t.archive is false
LIMIT 1
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
  ordre: z.number(),
})
type GetDemarchesByTitreIdQueryDb = z.infer<typeof getDemarchesByTitreIdQueryDbValidator>

export const getDemarchesByTitreId = async (pool: Pool, titreId: TitreId) => {
  return dbQueryAndValidate(getDemarchesByTitreIdQueryDb, { titreId }, pool, getDemarchesByTitreIdQueryDbValidator)
}
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
    d.demarche_date_fin,
    d.ordre
from
    titres_demarches d
where
    d.titre_id = $ titreId !
    and d.archive is false
order by
    ordre
`

const getTitreByIdOrSlugValidator = z.object({
  titre_slug: titreSlugValidator,
  titre_type_id: titreTypeIdValidator,
  public_lecture: z.boolean(),
})
type GetTitreByIdOrSlugValidator = z.infer<typeof getTitreByIdOrSlugValidator>

export const getTitreByIdOrSlug = async (pool: Pool, idOrSlug: TitreIdOrSlug): Promise<z.infer<typeof getTitreByIdOrSlugValidator>> => {
  return (await dbQueryAndValidate(getTitreByIdOrSlugDb, { idOrSlug }, pool, getTitreByIdOrSlugValidator))[0]
}

const getTitreByIdOrSlugDb = sql<Redefine<IGetTitreByIdOrSlugDbQuery, { idOrSlug: TitreIdOrSlug }, GetTitreByIdOrSlugValidator>>`
select
    slug as titre_slug,
    type_id as titre_type_id,
    public_lecture
from
    titres
where (id = $ idOrSlug !
    or slug = $ idOrSlug !)
and archive is false
`

export const getTitulairesAmodiatairesByTitreId = async (pool: Pool, titreId: TitreId): Promise<EntrepriseId[]> => {
  const result = await dbQueryAndValidate(getTitulairesAmodiatairesByTitreIdDb, { titreId }, pool, entrepriseIdObjectValidator)

  return result.map(({ id }) => id)
}

const entrepriseIdObjectValidator = z.object({ id: entrepriseIdValidator })
const getTitulairesAmodiatairesByTitreIdDb = sql<Redefine<IGetTitulairesAmodiatairesByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof entrepriseIdObjectValidator>>>`
select distinct
    e.id
from
    entreprises e,
    titres t
    left join titres_etapes etape_titulaires on etape_titulaires.id = t.props_titre_etapes_ids ->> 'titulaires'
    left join titres_etapes etape_amodiataires on etape_amodiataires.id = t.props_titre_etapes_ids ->> 'amodiataires'
where
    t.id = $ titreId !
    and (etape_titulaires.titulaire_ids ? e.id
        or etape_amodiataires.amodiataire_ids ? e.id)
`

export const getAdministrationsLocalesByTitreId = async (pool: Pool, titreId: TitreId): Promise<AdministrationId[]> => {
  const result = await dbQueryAndValidate(getAdministrationsLocalesByTitreIdDb, { titreId }, pool, getAdministrationsLocalesByTitreIdValidator)

  if (result.length !== 1) {
    throw new Error('impossible de trouver le titre')
  }

  return getAdministrationsLocales(
    result[0].communes.map(({ id }) => id),
    result[0].secteurs_maritime
  )
}

const getAdministrationsLocalesByTitreIdValidator = z.object({
  communes: z.array(z.object({ id: communeIdValidator })),
  secteurs_maritime: z.array(secteurMaritimeValidator),
})

const getAdministrationsLocalesByTitreIdDb = sql<Redefine<IGetAdministrationsLocalesByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof getAdministrationsLocalesByTitreIdValidator>>>`
select
    te.communes,
    te.secteurs_maritime
from
    titres t
    left join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
where
    t.id = $ titreId !
`
export const getDoublonsByTitreId = async (pool: Pool, titreId: TitreId): Promise<TitreId[]> => {
  const result = await dbQueryAndValidate(getDoublonsByTitreIdDb, { titreId }, pool, z.object({ titre_id: titreIdValidator }))

  return result.map(({ titre_id }) => titre_id)
}

const getDoublonsByTitreIdDb = sql<Redefine<IGetDoublonsByTitreIdDbQuery, { titreId: TitreId }, { titre_id: TitreId }>>`
  select
    t.id as titre_id
  from titres t
  where
    t.doublon_titre_id = $ titreId !
    and t.archive is false
  `
