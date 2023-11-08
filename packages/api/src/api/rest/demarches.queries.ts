/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import {
  DemarcheEtapeCommon,
  DemarcheEtapeFondamentale,
  DemarcheEtapeNonFondamentale,
  DemarcheGet,
  DemarcheId,
  DemarcheIdOrSlug,
  demarcheIdValidator,
  demarcheSlugValidator,
  EntreprisesByEtapeId,
  FeatureMultiPolygon,
} from 'camino-common/src/demarche.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetDemarcheQueryDbQuery, IGetDemarchesPhasesByTitreIdDbQuery, IGetEtapesByDemarcheIdDbQuery } from './demarches.queries.types.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator, titreSlugValidator } from 'camino-common/src/titres.js'
import { DemarcheTypeId, demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId, titreTypeIdValidator, getTitreTypeType, TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { demarcheStatutIdValidator } from 'camino-common/src/static/demarchesStatuts.js'
import { Commune, communeValidator } from 'camino-common/src/static/communes.js'
import { getCommunes } from '../../database/queries/communes.queries.js'
import { isNonEmptyArray, isNotNullNorUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades.js'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales.js'
import { EtapesTypes, EtapeTypeId, EtapeTypeIdFondamentale, etapeTypeIdFondamentaleValidator, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
import { etapeIdValidator } from 'camino-common/src/etape.js'
import {
  getAmodiatairesByEtapeIdQuery,
  getDocumentsByEtapeId,
  getEntrepriseDocumentIdsByEtapeId,
  getPointsByEtapeIdQuery,
  getTitulairesByEtapeIdQuery,
  PointByEtapeId,
} from '../../database/queries/titres-etapes.queries.js'
import { geojsonFeatureMultiPolygon } from '../../tools/geojson.js'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts.js'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes.js'
import { DeviseId, deviseIdValidator, Devises, DEVISES_IDS } from 'camino-common/src/static/devise.js'
import { contenuValidator } from './activites.queries.js'
import { numberFormat } from 'camino-common/src/number.js'
import { UNITE_IDS, UniteId, uniteIdValidator, Unites } from 'camino-common/src/static/unites.js'
import { capitalize } from 'camino-common/src/strings.js'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { SectionWithValue } from 'camino-common/src/sections.js'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments.js'
import { User } from 'camino-common/src/roles.js'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { getTitreEtapeAdministrationsLocales } from '../../business/processes/titres-etapes-administrations-locales-update.js'
import { canReadEtape } from './permissions/etapes.js'
import { canReadDemarche } from './permissions/demarches.js'

const isFondamentale = (e: EtapeTypeId): e is EtapeTypeIdFondamentale => {
  return etapeTypeIdFondamentaleValidator.safeParse(e).success
}

// TODO 2023-10-26 : ceci est la traduction de la colonne contenu_ids de la table titres_types
const getDemarcheContenu = (etapes: GetEtapesByDemarcheIdDb[], titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId): Record<string, string> => {
  if (getTitreTypeType(titreTypeId) === TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES) {
    let engagement: number | null = null
    let engagementDeviseId: DeviseId | null = null
    let engagementLabel: string | null = null
    for (const etape of etapes) {
      if (engagement === null && isNotNullNorUndefined(etape.contenu?.prx?.engagement) && typeof etape.contenu?.prx?.engagement === 'number') {
        const sections = getSections(titreTypeId, demarcheTypeId, etape.etape_type_id)

        engagementLabel = sections.find(({ id }) => id === 'prx')?.elements.find(({ id }) => id === 'engagement')?.nom ?? ''

        engagement = etape.contenu?.prx?.engagement
      }

      if (engagementDeviseId === null && isNotNullNorUndefined(etape.contenu?.prx?.engagementDeviseId)) {
        const parsed = deviseIdValidator.safeParse(etape.contenu?.prx?.engagementDeviseId)
        engagementDeviseId = parsed.success ? parsed.data : DEVISES_IDS.Euros
      }

      if (engagementLabel !== null && engagement !== null && engagementDeviseId !== null) {
        return { [engagementLabel]: `${numberFormat(engagement)} ${capitalize(Devises[engagementDeviseId].nom)}` }
      }
    }
  } else if (
    titreTypeId === TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN ||
    titreTypeId === TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS ||
    titreTypeId === TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS
  ) {
    // TODO 2023-11-07 à voir avec Pierre-Olivier, les sections VOLUME ne sont jamais utilisées pour les PXW
    const getVolume = (sectionName: 'cxx' | 'pxx'): Record<string, string> => {
      let volume: number | null = null
      let volumeUniteId: UniteId | null = null
      let volumeLabel: string | null = null

      for (const etape of etapes) {
        if (volume === null && isNotNullNorUndefined(etape.contenu?.[sectionName]?.volume)) {
          const parsed = z.number().safeParse(etape.contenu?.[sectionName]?.volume)
          volume = parsed.success ? parsed.data : 0
          const sections = getSections(titreTypeId, demarcheTypeId, etape.etape_type_id)

          volumeLabel = sections.find(({ id }) => id === sectionName)?.elements.find(({ id }) => id === 'volume')?.nom ?? ''
        }

        if (volumeUniteId === null && isNotNullNorUndefined(etape.contenu?.[sectionName]?.volumeUniteId)) {
          const parsed = uniteIdValidator.safeParse(etape.contenu?.[sectionName]?.volumeUniteId)
          volumeUniteId = parsed.success ? parsed.data : UNITE_IDS['mètre cube']
        }

        if (volumeLabel !== null && volume !== null && volumeUniteId !== null) {
          return { [volumeLabel]: `${numberFormat(volume)} ${capitalize(Unites[volumeUniteId].nom)}` }
        }
      }

      return {}
    }

    return getVolume(titreTypeId === TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS ? 'pxx' : 'cxx')
  } else if (titreTypeId === TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX) {
    let franchissements: unknown | null = null
    let mecanisation: boolean | null = null
    const contenu: Record<string, string> = {}

    for (const etape of etapes) {
      const sections = getSections(titreTypeId, demarcheTypeId, etape.etape_type_id)

      if (franchissements === null && isNotNullNorUndefined(etape.contenu?.arm?.franchissements)) {
        franchissements = etape.contenu?.arm?.franchissements

        const label = sections.find(({ id }) => id === 'arm')?.elements.find(({ id }) => id === 'franchissements')?.nom ?? ''
        contenu[label] = `${franchissements}`
      }

      if (mecanisation === null && isNotNullNorUndefined(etape.contenu?.arm?.mecanise)) {
        const parsed = z.boolean().safeParse(etape.contenu?.arm?.mecanise)
        mecanisation = parsed.success ? parsed.data : false

        const label = sections.find(({ id }) => id === 'arm')?.elements.find(({ id }) => id === 'mecanise')?.nom ?? ''
        contenu[label] = mecanisation ? 'Oui' : 'Non'
      }
    }

    return contenu
  }

  return {}
}

export const getDemarcheQuery = async (pool: Pool, id: DemarcheIdOrSlug, user: User): Promise<DemarcheGet> => {
  const demarches = await dbQueryAndValidate(getDemarcheQueryDb, { id }, pool, getDemarcheQueryDbValidator)

  if (demarches.length !== 1) {
    throw new Error(`demarche ${id} introuvable`)
  }

  const demarche = demarches[0]

  const phases = await dbQueryAndValidate(getDemarchesPhasesByTitreIdDb, { id: demarche.titre_id }, pool, getDemarchesPhasesByTitreIdDbValidator)
  const etapes = await dbQueryAndValidate(getEtapesByDemarcheIdDb, { demarcheId: demarche.id }, pool, getEtapesByDemarcheIdDbValidator)

  const latestFondamentaleEtape = etapes.find(({ etape_type_id }) => EtapesTypes[etape_type_id].fondamentale) ?? null

  const communes: Commune[] = []
  const titulaires: EntreprisesByEtapeId[] = []
  const amodiataires: EntreprisesByEtapeId[] = []
  const points: PointByEtapeId[] = []

  if (latestFondamentaleEtape !== null) {
    if (isNonEmptyArray(latestFondamentaleEtape.communes)) {
      const ids = latestFondamentaleEtape.communes.map(({ id }) => id)
      if (isNonEmptyArray(ids)) {
        communes.push(...(await getCommunes(pool, { ids })))
      }
    }

    titulaires.push(...(await getTitulairesByEtapeIdQuery(latestFondamentaleEtape.id, pool)))
    amodiataires.push(...(await getAmodiatairesByEtapeIdQuery(latestFondamentaleEtape.id, pool)))
    points.push(...(await getPointsByEtapeIdQuery(latestFondamentaleEtape.id, pool)))
  }

  const administrationsLocales = memoize(() => Promise.resolve(getTitreEtapeAdministrationsLocales(latestFondamentaleEtape?.communes, latestFondamentaleEtape?.secteurs_maritime)))
  const entreprisesTitulairesOuAmodiataires = memoize(() => Promise.resolve([...titulaires.map(({ id }) => id), ...amodiataires.map(({ id }) => id)]))
  const titreTypeId = memoize(() => Promise.resolve(demarche.titre_type_id))

  if (!(await canReadDemarche(demarche, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires))) {
    throw new Error('droit insuffisant')
  }

  const formatedEtapes: DemarcheGet['etapes'] = []
  for (const etape of etapes) {
    const canRead: boolean = await canReadEtape(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etape.etape_type_id, demarche)
    if (canRead) {
      const sections = getSections(demarche.titre_type_id, demarche.demarche_type_id, etape.etape_type_id)
        .map(section => ({ ...section, elements: section.elements.filter(element => !(etape.heritage_contenu?.[section.id]?.[element.id]?.actif ?? false)) }))
        .filter(section => section.elements.length > 0)

      const contenu: SectionWithValue[] = getSectionsWithValue(sections, etape.contenu)

      const entrepriseDocuments = []

      const entrepriseDocumentsTypes = getEntrepriseDocuments(demarche.titre_type_id, demarche.demarche_type_id, etape.etape_type_id)
      if (entrepriseDocumentsTypes.length > 0) {
        entrepriseDocuments.push(...(await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etape.id }, pool, user)))
      }

      const documents = []
      const documentsTypes = getDocuments(demarche.titre_type_id, demarche.demarche_type_id, etape.etape_type_id)
      if (documentsTypes.length > 0) {
        documents.push(...(await getDocumentsByEtapeId(etape.id, pool, user)))
      }

      const etapeCommon: DemarcheEtapeCommon = {
        date: etape.date,
        etape_statut_id: etape.etape_statut_id,
        sections_with_values: contenu,
        entreprises_documents: entrepriseDocuments,
        documents,
      }
      if (isFondamentale(etape.etape_type_id)) {
        let geojsonMultiPolygon: FeatureMultiPolygon | null = null
        if (!(etape.heritage_props?.points?.actif ?? false)) {
          const etapePoints = await getPointsByEtapeIdQuery(etape.id, pool)

          if (etapePoints.length > 0) {
            geojsonMultiPolygon = geojsonFeatureMultiPolygon(etapePoints)
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

        const etapeFondamentale: DemarcheEtapeFondamentale = {
          etape_type_id: etape.etape_type_id,
          fondamentale: {
            amodiataires,
            titulaires,
            date_debut: isNotNullNorUndefined(etape.date_debut) && !(etape.heritage_props?.date_debut?.actif ?? false) ? etape.date_debut : null,
            date_fin: isNotNullNorUndefined(etape.date_fin) && !(etape.heritage_props?.date_fin?.actif ?? false) ? etape.date_fin : null,
            duree: isNotNullNorUndefined(etape.duree) && !(etape.heritage_props?.duree?.actif ?? false) ? etape.duree : null,
            substances: isNotNullNorUndefined(etape.substances) && !(etape.heritage_props?.substances?.actif ?? false) ? etape.substances : null,
            surface: isNotNullNorUndefined(etape.surface) && !(etape.heritage_props?.surface?.actif ?? false) ? etape.surface : null,
            geojsonMultiPolygon: isNotNullNorUndefined(geojsonMultiPolygon) ? geojsonMultiPolygon : null,
          },
        }

        formatedEtapes.push({
          ...etapeCommon,
          ...etapeFondamentale,
        })
      } else {
        const etapeNonFondamentale: DemarcheEtapeNonFondamentale = { etape_type_id: etape.etape_type_id }

        formatedEtapes.push({ ...etapeCommon, ...etapeNonFondamentale })
      }
    }
  }

  return {
    id: demarche.id,
    demarche_type_id: demarche.demarche_type_id,
    demarche_statut_id: demarche.demarche_statut_id,
    slug: demarche.slug,
    titre: {
      phases,
      nom: demarche.titre_nom,
      slug: demarche.titre_slug,
      titre_type_id: demarche.titre_type_id,
    },
    contenu: getDemarcheContenu(etapes, demarche.titre_type_id, demarche.demarche_type_id),
    communes,
    secteurs_maritimes: latestFondamentaleEtape?.secteurs_maritime ?? [],
    substances: latestFondamentaleEtape?.substances ?? [],
    titulaires,
    amodiataires,
    geojsonMultiPolygon: points.length > 0 ? geojsonFeatureMultiPolygon(points) : null,
    etapes: formatedEtapes,
  }
}

const getDemarcheQueryDbValidator = z.object({
  id: demarcheIdValidator,
  slug: demarcheSlugValidator,
  titre_id: titreIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  titre_nom: z.string(),
  titre_slug: titreSlugValidator,
  titre_type_id: titreTypeIdValidator,
  public_lecture: z.boolean().default(false),
  entreprises_lecture: z.boolean().default(false),
})
type GetDemarcheQueryDb = z.infer<typeof getDemarcheQueryDbValidator>

const getDemarcheQueryDb = sql<Redefine<IGetDemarcheQueryDbQuery, { id: DemarcheIdOrSlug }, GetDemarcheQueryDb>>`
select
    d.id,
    d.slug,
    d.titre_id,
    d.type_id as demarche_type_id,
    d.statut_id as demarche_statut_id,
    t.nom as titre_nom,
    t.slug as titre_slug,
    t.type_id as titre_type_id,
    d.public_lecture,
    d.entreprises_lecture
from
    titres_demarches d
    left join titres t on t.id = d.titre_id
where (d.id = $ id !
    or d.slug = $ id !)
and d.archive is false
LIMIT 1
`

const getDemarchesPhasesByTitreIdDbValidator = z.object({
  slug: demarcheSlugValidator,
  demarche_date_debut: caminoDateValidator.nullable(),
  demarche_date_fin: caminoDateValidator.nullable(),
  demarche_type_id: demarcheTypeIdValidator,
})
type GetDemarchesPhasesByTitreIdDb = z.infer<typeof getDemarchesPhasesByTitreIdDbValidator>
const getDemarchesPhasesByTitreIdDb = sql<Redefine<IGetDemarchesPhasesByTitreIdDbQuery, { id: TitreId }, GetDemarchesPhasesByTitreIdDb>>`
select
    d.slug,
    d.demarche_date_debut,
    d.demarche_date_fin,
    d.type_id as demarche_type_id
from
    titres_demarches d
where
    d.titre_id = $ id !
    and d.demarche_date_debut is not null
    and d.archive is false
`

const getEtapesByDemarcheIdDbValidator = z.object({
  id: etapeIdValidator,
  date: caminoDateValidator,
  communes: z.array(communeValidator.pick({ id: true })),
  secteurs_maritime: z.array(secteurMaritimeValidator).nullable(),
  substances: z.array(substanceLegaleIdValidator).nullable(),
  etape_type_id: etapeTypeIdValidator,
  etape_statut_id: etapeStatutIdValidator,
  heritage_props: z.record(z.string(), z.object({ actif: z.boolean() })).nullable(),
  heritage_contenu: z.record(z.string(), z.record(z.string(), z.object({ actif: z.boolean() }))).nullable(),
  date_debut: caminoDateValidator.nullable(),
  date_fin: caminoDateValidator.nullable(),
  duree: z.number().nullable(),
  surface: z.number().nullable(),
  contenu: contenuValidator.nullable(),
})
type GetEtapesByDemarcheIdDb = z.infer<typeof getEtapesByDemarcheIdDbValidator>
const getEtapesByDemarcheIdDb = sql<Redefine<IGetEtapesByDemarcheIdDbQuery, { demarcheId: DemarcheId }, GetEtapesByDemarcheIdDb>>`
select
    e.id,
    e.date,
    e.communes,
    e.secteurs_maritime,
    e.substances,
    e.type_id as etape_type_id,
    e.statut_id as etape_statut_id,
    e.heritage_props,
    e.heritage_contenu,
    e.date_debut,
    e.date_fin,
    e.duree,
    e.surface,
    e.contenu
from
    titres_etapes e
where
    e.titre_demarche_id = $ demarcheId !
    and e.archive is false
order by
    date desc
`
