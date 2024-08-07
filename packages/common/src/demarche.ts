import { z } from 'zod'
import { TITRES_TYPES_IDS, TitreTypeId, getTitreTypeType } from './static/titresTypes'
import { caminoDateValidator } from './date'
import { communeIdValidator } from './static/communes'
import { secteurMaritimeValidator } from './static/facades'
import { substanceLegaleIdValidator } from './static/substancesLegales'
import { entrepriseIdValidator, etapeEntrepriseDocumentValidator } from './entreprise'
import { EtapeTypeId, etapeTypeIdFondamentaleValidator, etapeTypeIdNonFondamentaleValidator } from './static/etapesTypes'
import { etapeStatutIdValidator } from './static/etapesStatuts'
import { sectionWithValueValidator } from './sections'
import { etapeAvisValidator, etapeBrouillonValidator, etapeDocumentValidator, etapeIdValidator, etapeNoteValidator, etapeSlugValidator } from './etape'
import { sdomZoneIdValidator } from './static/sdom'
import { km2Validator, numberFormat } from './number'
import { DeviseId, deviseIdValidator, DEVISES_IDS, Devises } from './static/devise'
import { TITRES_TYPES_TYPES_IDS } from './static/titresTypesTypes'
import { UniteId, uniteIdValidator, UNITE_IDS, Unites } from './static/unites'
import { capitalize } from './strings'
import { foretIdValidator } from './static/forets'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from './perimetre'
import { geoSystemeIdValidator } from './static/geoSystemes'
import { isNotNullNorUndefined } from './typescript-tools'
import { proprietesGeothermieForagesElementIds } from './static/titresTypes_demarchesTypes_etapesTypes/sections'
import { titreIdValidator } from './validators/titres'
import { demarcheTypeIdValidator } from './static/demarchesTypes'

export const demarcheIdValidator = z.string().brand<'DemarcheId'>()
export type DemarcheId = z.infer<typeof demarcheIdValidator>

export const demarcheSlugValidator = z.string().brand<'DemarcheSlug'>()
export type DemarcheSlug = z.infer<typeof demarcheSlugValidator>

export const demarcheIdOrSlugValidator = z.union([demarcheIdValidator, demarcheSlugValidator])
export type DemarcheIdOrSlug = z.infer<typeof demarcheIdOrSlugValidator>

const demarcheEtapeCommonValidator = z.object({
  etape_statut_id: etapeStatutIdValidator,
  is_brouillon: etapeBrouillonValidator,
  date: caminoDateValidator,
  id: etapeIdValidator,
  ordre: z.number(),
  note: etapeNoteValidator,
  slug: etapeSlugValidator,
  sections_with_values: z.array(sectionWithValueValidator),
  entreprises_documents: z.array(etapeEntrepriseDocumentValidator),
  etape_documents: z.array(etapeDocumentValidator),
  avis_documents: z.array(etapeAvisValidator),
})

export type DemarcheEtapeCommon = z.infer<typeof demarcheEtapeCommonValidator>

const etapePerimetreValidator = z.object({
  geojson4326_perimetre: featureMultiPolygonValidator,
  geojson4326_points: featureCollectionPointsValidator.nullable(),
  geojson_origine_perimetre: featureMultiPolygonValidator,
  geojson_origine_points: featureCollectionPointsValidator.nullable(),
  geojson_origine_geo_systeme_id: geoSystemeIdValidator,
  geojson4326_forages: featureCollectionForagesValidator.nullable(),
  geojson_origine_forages: featureCollectionForagesValidator.nullable(),
  surface: km2Validator.nullable(),
  communes: z.array(z.object({ id: communeIdValidator, nom: z.string() })),
  secteurs_maritimes: z.array(secteurMaritimeValidator),
  sdom_zones: z.array(sdomZoneIdValidator),
  forets: z.array(foretIdValidator),
})

const demarcheEtapeFondamentaleValidator = z.intersection(
  z.object({
    etape_type_id: etapeTypeIdFondamentaleValidator,
    fondamentale: z.object({
      date_debut: caminoDateValidator.nullable(),
      date_fin: caminoDateValidator.nullable(),
      duree: z.number().nullable(),
      substances: z.array(substanceLegaleIdValidator).nullable(),
      titulaireIds: z.array(entrepriseIdValidator).nullable(),
      amodiataireIds: z.array(entrepriseIdValidator).nullable(),
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
  } else if (titreTypeId === TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE) {
    let volume: unknown | null = null
    let debit: unknown | null = null
    const profondeurNappeToit: unknown | null = null
    const profondeurNappeBase: unknown | null = null
    const contenu: Record<string, string> = {}

    for (const etape of etapes) {
      const pxgSectionWithValue = etape.sections_with_values.find(({ id }) => id === 'pxg')
      if (pxgSectionWithValue !== undefined) {
        if (volume === null) {
          const volumeElementWithValue = pxgSectionWithValue.elements.find(({ id }) => id === proprietesGeothermieForagesElementIds.Volume)
          if (
            isNotNullNorUndefined(volumeElementWithValue) &&
            isNotNullNorUndefined(volumeElementWithValue.value) &&
            volumeElementWithValue.type === 'number' &&
            isNotNullNorUndefined(volumeElementWithValue.uniteId)
          ) {
            volume = volumeElementWithValue.value
            contenu[volumeElementWithValue.nom ?? ''] = `${volume} ${Unites[volumeElementWithValue.uniteId].symbole}`
          }
        }
        if (debit === null) {
          const debitElementWithValue = pxgSectionWithValue.elements.find(({ id }) => id === proprietesGeothermieForagesElementIds.Debit)
          if (
            isNotNullNorUndefined(debitElementWithValue) &&
            isNotNullNorUndefined(debitElementWithValue.value) &&
            debitElementWithValue.type === 'number' &&
            isNotNullNorUndefined(debitElementWithValue.uniteId)
          ) {
            debit = debitElementWithValue.value
            contenu[debitElementWithValue.nom ?? ''] = `${debit} ${Unites[debitElementWithValue.uniteId].symbole}`
          }
        }
        if (profondeurNappeToit === null) {
          const elementWithValue = pxgSectionWithValue.elements.find(({ id }) => id === proprietesGeothermieForagesElementIds['Profondeur du toit de la nappe'])
          if (isNotNullNorUndefined(elementWithValue) && isNotNullNorUndefined(elementWithValue.value) && elementWithValue.type === 'number') {
            debit = elementWithValue.value
            contenu[elementWithValue.nom ?? ''] = `${debit} ${elementWithValue.description}`
          }
        }
        if (profondeurNappeBase === null) {
          const elementWithValue = pxgSectionWithValue.elements.find(({ id }) => id === proprietesGeothermieForagesElementIds['Profondeur de la base de la nappe'])
          if (isNotNullNorUndefined(elementWithValue) && isNotNullNorUndefined(elementWithValue.value) && elementWithValue.type === 'number') {
            debit = elementWithValue.value
            contenu[elementWithValue.nom ?? ''] = `${debit} ${elementWithValue.description}`
          }
        }
      }
    }

    return contenu
  }

  return {}
}

export const demarcheCreationInputValidator = z.object({
  titreId: titreIdValidator,
  typeId: demarcheTypeIdValidator,
  description: z.string(),
})

export type DemarcheCreationInput = z.infer<typeof demarcheCreationInputValidator>

export const demarcheCreationOutputValidator = z.object({
  slug: demarcheSlugValidator,
})

export type DemarcheCreationOutput = z.infer<typeof demarcheCreationOutputValidator>
