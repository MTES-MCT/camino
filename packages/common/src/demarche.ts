import { z } from 'zod'
import { TITRES_TYPES_IDS, TitreTypeId, getTitreTypeType } from './static/titresTypes.js'
import { caminoDateValidator } from './date.js'
import { communeIdValidator } from './static/communes.js'
import { secteurMaritimeValidator } from './static/facades.js'
import { substanceLegaleIdValidator } from './static/substancesLegales.js'
import { entrepriseIdValidator, etapeEntrepriseDocumentValidator } from './entreprise.js'
import { EtapeTypeId, etapeTypeIdFondamentaleValidator, etapeTypeIdNonFondamentaleValidator } from './static/etapesTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { sectionWithValueValidator } from './sections.js'
import { etapeDocumentValidator, etapeIdValidator, etapeSlugValidator } from './etape.js'
import { sdomZoneIdValidator } from './static/sdom.js'
import { sectionValidator } from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { numberFormat } from './number.js'
import { DeviseId, deviseIdValidator, DEVISES_IDS, Devises } from './static/devise.js'
import { TITRES_TYPES_TYPES_IDS } from './static/titresTypesTypes.js'
import { UniteId, uniteIdValidator, UNITE_IDS, Unites } from './static/unites.js'
import { capitalize } from './strings.js'
import { foretIdValidator } from './static/forets.js'
import { featureCollectionPointsValidator, featureMultiPolygonValidator } from './perimetre.js'

export const demarcheIdValidator = z.string().brand<'DemarcheId'>()
export type DemarcheId = z.infer<typeof demarcheIdValidator>

export const demarcheSlugValidator = z.string().brand<'DemarcheSlug'>()
export type DemarcheSlug = z.infer<typeof demarcheSlugValidator>

export const demarcheIdOrSlugValidator = z.union([demarcheIdValidator, demarcheSlugValidator])
export type DemarcheIdOrSlug = z.infer<typeof demarcheIdOrSlugValidator>

export const entreprisesByEtapeIdValidator = z.object({
  id: entrepriseIdValidator,
  nom: z.string(),
  operateur: z.coerce.boolean(),
})

export type EntreprisesByEtapeId = z.infer<typeof entreprisesByEtapeIdValidator>

/**
 * @deprecated don't expose, don't use
 */
const contenuValidator = z.record(z.string(), z.record(z.string(), z.unknown().optional()).optional()).nullable()

const demarcheEtapeCommonValidator = z.object({
  etape_statut_id: etapeStatutIdValidator,
  date: caminoDateValidator,
  id: etapeIdValidator,
  ordre: z.number(),
  notes: z.string().nullable(),
  slug: etapeSlugValidator,
  sections_with_values: z.array(sectionWithValueValidator),
  entreprises_documents: z.array(etapeEntrepriseDocumentValidator),
  documents: z.array(etapeDocumentValidator),
  decisions_annexes_contenu: contenuValidator,
  decisions_annexes_sections: z.array(sectionValidator).nullable(),
})

export type DemarcheEtapeCommon = z.infer<typeof demarcheEtapeCommonValidator>

// FIXME c'est un geojsonInformationsValidator
const etapePerimetreValidator = z.object({
  geojson4326_perimetre: featureMultiPolygonValidator,
  geojson4326_points: featureCollectionPointsValidator.nullable(),
  surface: z.number(),
  communes: z.array(z.object({ id: communeIdValidator, nom: z.string() })),
  secteurs_maritimes: z.array(secteurMaritimeValidator),
  sdom_zones: z.array(sdomZoneIdValidator),
  forets: z.array(foretIdValidator),
})

export type EtapePerimetre = z.infer<typeof etapePerimetreValidator>

const demarcheEtapeFondamentaleValidator = z.intersection(
  z.object({
    etape_type_id: etapeTypeIdFondamentaleValidator,
    fondamentale: z.object({
      date_debut: caminoDateValidator.nullable(),
      date_fin: caminoDateValidator.nullable(),
      duree: z.number().nullable(),
      substances: z.array(substanceLegaleIdValidator).nullable(),
      titulaires: z.array(entreprisesByEtapeIdValidator).nullable(),
      amodiataires: z.array(entreprisesByEtapeIdValidator).nullable(),
      perimetre: etapePerimetreValidator.nullable(),
    }),
  }),
  demarcheEtapeCommonValidator
)

export type DemarcheEtapeFondamentale = z.infer<typeof demarcheEtapeFondamentaleValidator>

const demarcheEtapeNonFondamentaleValidator = z.intersection(
  z.object({
    etape_type_id: etapeTypeIdNonFondamentaleValidator,
  }),
  demarcheEtapeCommonValidator
)
export type DemarcheEtapeNonFondamentale = z.infer<typeof demarcheEtapeNonFondamentaleValidator>

export const demarcheEtapeValidator = z.union([demarcheEtapeFondamentaleValidator, demarcheEtapeNonFondamentaleValidator])

export type DemarcheEtape = z.infer<typeof demarcheEtapeValidator>

// TODO 2023-10-26 : ceci est la traduction de la colonne contenu_ids de la table titres_types
export const getDemarcheContenu = (etapes: (Pick<DemarcheEtapeCommon, 'sections_with_values'> & { etape_type_id: EtapeTypeId })[], titreTypeId: TitreTypeId): Record<string, string> => {
  if (getTitreTypeType(titreTypeId) === TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES) {
    let engagement: number | null = null
    let engagementDeviseId: DeviseId | null = null
    let engagementLabel: string | null = null
    for (const etape of etapes) {
      const prxSectionWithValue = etape.sections_with_values.find(({ id }) => id === 'prx')
      if (prxSectionWithValue !== undefined) {
        if (engagement === null) {
          const engagementElementWithValue = prxSectionWithValue.elements.find(({ id }) => id === 'engagement')
          if (engagementElementWithValue !== undefined && typeof engagementElementWithValue.value === 'number') {
            engagement = engagementElementWithValue.value
            engagementLabel = engagementElementWithValue.nom ?? ''
          }
        }
        if (engagementDeviseId === null) {
          const engagementDeviseElementWithValue = prxSectionWithValue.elements.find(({ id }) => id === 'engagementDeviseId')
          if (engagementDeviseElementWithValue !== undefined) {
            const parsed = deviseIdValidator.safeParse(engagementDeviseElementWithValue.value)
            engagementDeviseId = parsed.success ? parsed.data : DEVISES_IDS.Euros
          }
        }
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
        const cxxOrPxxSectionWithValue = etape.sections_with_values.find(({ id }) => id === sectionName)
        if (cxxOrPxxSectionWithValue !== undefined) {
          if (volume === null) {
            const volumeElementWithValue = cxxOrPxxSectionWithValue.elements.find(({ id }) => id === 'volume')
            if (volumeElementWithValue !== undefined) {
              const parsed = z.number().safeParse(volumeElementWithValue.value)
              volume = parsed.success ? parsed.data : 0
              volumeLabel = volumeElementWithValue.nom ?? ''
            }
          }

          if (volumeUniteId === null) {
            const volumeUniteIdElementWithValue = cxxOrPxxSectionWithValue.elements.find(({ id }) => id === 'volumeUniteId')
            if (volumeUniteIdElementWithValue !== undefined) {
              const parsed = uniteIdValidator.safeParse(volumeUniteIdElementWithValue.value)
              volumeUniteId = parsed.success ? parsed.data : UNITE_IDS['mètre cube']
            }
          }
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
      const armSectionWithValue = etape.sections_with_values.find(({ id }) => id === 'arm')
      if (armSectionWithValue !== undefined) {
        if (franchissements === null) {
          const franchissementsElementWithValue = armSectionWithValue.elements.find(({ id }) => id === 'franchissements')
          if (franchissementsElementWithValue !== undefined) {
            franchissements = franchissementsElementWithValue.value
            contenu[franchissementsElementWithValue.nom ?? ''] = franchissements !== null ? `${franchissements}` : '0'
          }
        }
        if (mecanisation === null) {
          const mecanisationElementWithValue = armSectionWithValue.elements.find(({ id }) => id === 'mecanise')
          if (mecanisationElementWithValue !== undefined) {
            const parsed = z.boolean().safeParse(mecanisationElementWithValue.value)
            mecanisation = parsed.success ? parsed.data : false
            contenu[mecanisationElementWithValue.nom ?? ''] = mecanisation ? 'Oui' : 'Non'
          }
        }
      }
    }

    return contenu
  }

  return {}
}
