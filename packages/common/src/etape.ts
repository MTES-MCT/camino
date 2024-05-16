import { CaminoDate, caminoDateValidator } from './date.js'
import { EntrepriseId } from './entreprise.js'
import { EtapeHeritageProps, MappingHeritagePropsNameEtapePropsName } from './heritage.js'
import { AdministrationId } from './static/administrations.js'
import { DOCUMENTS_TYPES_IDS, documentTypeIdValidator } from './static/documentsTypes.js'
import { EtapeStatutId, etapeStatutIdValidator } from './static/etapesStatuts.js'
import { EtapeTypeId, etapeTypeIdValidator } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { z } from 'zod'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon } from './perimetre.js'
import { KM2 } from './number.js'
import { GeoSystemeId } from './static/geoSystemes.js'
import { tempDocumentNameValidator } from './document.js'
import { ElementWithValue } from './sections.js'
import { DeepReadonly } from './typescript-tools.js'
import { getSections } from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DemarcheTypeId } from './static/demarchesTypes.js'
import { TitreTypeId } from './static/titresTypes.js'
import { User, isEntrepriseOrBureauDEtude } from './roles.js'

export const etapeIdValidator = z.string().brand<'EtapeId'>()
export type EtapeId = z.infer<typeof etapeIdValidator>

export const etapeSlugValidator = z.string().brand<'EtapeSlug'>()
export type EtapeSlug = z.infer<typeof etapeSlugValidator>

export const etapeIdOrSlugValidator = z.union([etapeIdValidator, etapeSlugValidator])
export type EtapeIdOrSlug = z.infer<typeof etapeIdOrSlugValidator>

export type HeritageProp<T> = { actif: boolean; etape?: T | null }

// TODO 2023-06-14 Utiliser seulement par l’ui, à bouger dedans
export type Etape = {
  id: EtapeId | null
  contenu: Record<string, Record<string, ElementWithValue['value']>>
  date: CaminoDate | null
  typeId: EtapeTypeId | null
  statutId: EtapeStatutId | null
  isBrouillon: boolean
  substances: SubstanceLegaleId[]
  titulaireIds: EntrepriseId[]
  amodiataireIds: EntrepriseId[]
  administrations?: AdministrationId[]
  communes?: string[]

  geojson4326Perimetre: FeatureMultiPolygon | null
  geojson4326Points: FeatureCollectionPoints | null
  geojsonOriginePerimetre: FeatureMultiPolygon | null
  geojsonOriginePoints: FeatureCollectionPoints | null
  geojsonOrigineGeoSystemeId: GeoSystemeId | null
  geojson4326Forages: FeatureCollectionForages | null
  geojsonOrigineForages: FeatureCollectionForages | null
  surface: KM2 | null

  notes: null | string
  duree: number | null
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
}

export type EtapePropsFromHeritagePropName<key extends EtapeHeritageProps> = MappingHeritagePropsNameEtapePropsName[key][number]

export type EtapeWithHeritage = InternalEtapeWithHeritage<EtapeHeritageProps, Omit<Etape, 'typeId' | 'date' | 'statutId'> & { typeId: EtapeTypeId; date: CaminoDate; statutId: EtapeStatutId }>

export type HeritageContenu = Record<string, Record<string, HeritageProp<Pick<EtapeWithHeritage, 'contenu' | 'typeId' | 'date'>>>>
type InternalEtapeWithHeritage<HeritagePropsKeys extends EtapeHeritageProps, T extends Pick<Etape, 'date' | EtapePropsFromHeritagePropName<HeritagePropsKeys>> & { typeId: EtapeTypeId }> = T & {
  heritageProps: {
    [key in HeritagePropsKeys]: HeritageProp<Pick<T, 'typeId' | 'date' | EtapePropsFromHeritagePropName<key>>>
  }
  heritageContenu: HeritageContenu
}

export const etapeTypeEtapeStatutWithMainStepValidator = z.object({ etapeTypeId: etapeTypeIdValidator, etapeStatutId: etapeStatutIdValidator, mainStep: z.boolean() })
export type EtapeTypeEtapeStatutWithMainStep = z.infer<typeof etapeTypeEtapeStatutWithMainStepValidator>

export const etapeDocumentIdValidator = z.string().brand('EtapeDocumentId')
export type EtapeDocumentId = z.infer<typeof etapeDocumentIdValidator>

export const etapeDocumentValidator = z.object({
  id: etapeDocumentIdValidator,
  description: z.string().nullable(),
  etape_document_type_id: documentTypeIdValidator,
  public_lecture: z.boolean().default(false),
  entreprises_lecture: z.boolean().default(false),
})

export type EtapeDocument = z.infer<typeof etapeDocumentValidator>

const documentComplementaireObligatoireCommon = z.object({
  date: caminoDateValidator,
  etape_statut_id: etapeStatutIdValidator,
})
export const documentTypeIdComplementaireObligatoireDAE = DOCUMENTS_TYPES_IDS.arretePrefectoral

const documentComplementaireObligatoireDAEValidator = documentComplementaireObligatoireCommon.extend({
  etape_document_type_id: z.literal(documentTypeIdComplementaireObligatoireDAE),
  arrete_prefectoral: z.string().nullable(),
})

export const documentTypeIdComplementaireObligatoireASL = DOCUMENTS_TYPES_IDS.lettre
const documentComplementaireObligatoireASLValidator = documentComplementaireObligatoireCommon.extend({
  etape_document_type_id: z.literal(documentTypeIdComplementaireObligatoireASL),
})

const getEtapeDocumentsByEtapeIdDaeDocumentValidator = etapeDocumentValidator.and(documentComplementaireObligatoireDAEValidator)
export type GetEtapeDocumentsByEtapeIdDaeDocument = z.infer<typeof getEtapeDocumentsByEtapeIdDaeDocumentValidator>

const getEtapeDocumentsByEtapeIdAslDocumentValidator = z.intersection(etapeDocumentValidator, documentComplementaireObligatoireASLValidator)
export type GetEtapeDocumentsByEtapeIdAslDocument = z.infer<typeof getEtapeDocumentsByEtapeIdAslDocumentValidator>

export const getEtapeDocumentsByEtapeIdValidator = z.object({
  etapeDocuments: z.array(etapeDocumentValidator),
  dae: getEtapeDocumentsByEtapeIdDaeDocumentValidator.nullable(),
  asl: getEtapeDocumentsByEtapeIdAslDocumentValidator.nullable(),
})

export type GetEtapeDocumentsByEtapeId = z.infer<typeof getEtapeDocumentsByEtapeIdValidator>

export const needAslAndDae = (
  tde: {
    etapeTypeId: EtapeTypeId
    demarcheTypeId: DemarcheTypeId
    titreTypeId: TitreTypeId
  },
  isBrouillon: boolean,
  user: User
): boolean => {
  return tde.etapeTypeId === 'mfr' && tde.demarcheTypeId === 'oct' && tde.titreTypeId === 'axm' && isEntrepriseOrBureauDEtude(user) && isBrouillon
}

export const tempEtapeDocumentValidator = etapeDocumentValidator.omit({ id: true }).extend({ temp_document_name: tempDocumentNameValidator })
export type TempEtapeDocument = z.infer<typeof tempEtapeDocumentValidator>

const etapeDocumentWithFileModificationValidator = etapeDocumentValidator.extend({ temp_document_name: tempDocumentNameValidator.optional() })
export type EtapeDocumentWithFileModification = z.infer<typeof etapeDocumentWithFileModificationValidator>
export const etapeDocumentModificationValidator = z.union([etapeDocumentWithFileModificationValidator, tempEtapeDocumentValidator])
export type EtapeDocumentModification = z.infer<typeof etapeDocumentModificationValidator>

export const documentComplementaireDaeEtapeDocumentModificationValidator = etapeDocumentModificationValidator.and(documentComplementaireObligatoireDAEValidator)
export type DocumentComplementaireDaeEtapeDocumentModification = z.infer<typeof documentComplementaireDaeEtapeDocumentModificationValidator>

export const documentComplementaireAslEtapeDocumentModificationValidator = etapeDocumentModificationValidator.and(documentComplementaireObligatoireASLValidator)
export type DocumentComplementaireAslEtapeDocumentModification = z.infer<typeof documentComplementaireAslEtapeDocumentModificationValidator>

export const flattenEtapeWithHeritage = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  etape: DeepReadonly<Etape>,
  heritage: DeepReadonly<Pick<EtapeWithHeritage, 'heritageProps' | 'heritageContenu' | 'typeId' | 'date' | 'statutId'>>
): DeepReadonly<EtapeWithHeritage> => {
  const substances: Readonly<SubstanceLegaleId[]> = heritage.heritageProps.substances.actif ? heritage.heritageProps.substances.etape?.substances ?? [] : etape.substances
  const duree: number | null = heritage.heritageProps.duree.actif ? heritage.heritageProps.duree.etape?.duree ?? null : etape.duree
  const amodiataireIds: DeepReadonly<EntrepriseId[]> = heritage.heritageProps.amodiataires.actif ? heritage.heritageProps.amodiataires.etape?.amodiataireIds ?? [] : etape.amodiataireIds
  const titulaireIds: DeepReadonly<EntrepriseId[]> = heritage.heritageProps.titulaires.actif ? heritage.heritageProps.titulaires.etape?.titulaireIds ?? [] : etape.titulaireIds
  const dateDebut: CaminoDate | null = heritage.heritageProps.dateDebut.actif ? heritage.heritageProps.dateDebut.etape?.dateDebut ?? null : etape.dateDebut
  const dateFin: CaminoDate | null = heritage.heritageProps.dateFin.actif ? heritage.heritageProps.dateFin.etape?.dateFin ?? null : etape.dateFin

  let perimetre: DeepReadonly<Pick<Etape, EtapePropsFromHeritagePropName<'perimetre'>>> = {
    geojson4326Perimetre: etape.geojson4326Perimetre,
    geojson4326Points: etape.geojson4326Points,
    geojsonOriginePerimetre: etape.geojsonOriginePerimetre,
    geojsonOriginePoints: etape.geojsonOriginePoints,
    geojsonOrigineGeoSystemeId: etape.geojsonOrigineGeoSystemeId,
    geojson4326Forages: etape.geojson4326Forages,
    geojsonOrigineForages: etape.geojsonOrigineForages,
    surface: etape.surface,
  }
  if (heritage.heritageProps.perimetre.actif) {
    perimetre = {
      geojson4326Perimetre: heritage.heritageProps.perimetre.etape?.geojson4326Perimetre ?? null,
      geojson4326Points: heritage.heritageProps.perimetre.etape?.geojson4326Points ?? null,
      geojsonOriginePerimetre: heritage.heritageProps.perimetre.etape?.geojsonOriginePerimetre ?? null,
      geojsonOriginePoints: heritage.heritageProps.perimetre.etape?.geojsonOriginePoints ?? null,
      geojsonOrigineGeoSystemeId: heritage.heritageProps.perimetre.etape?.geojsonOrigineGeoSystemeId ?? null,
      geojson4326Forages: heritage.heritageProps.perimetre.etape?.geojson4326Forages ?? null,
      geojsonOrigineForages: heritage.heritageProps.perimetre.etape?.geojsonOrigineForages ?? null,
      surface: heritage.heritageProps.perimetre.etape?.surface ?? null,
    }
  }

  const sections = getSections(titreTypeId, demarcheTypeId, heritage.typeId)

  let newContenu: DeepReadonly<Etape['contenu']> = {}
  for (const section of sections) {
    newContenu = { ...newContenu, [section.id]: {} }
    for (const element of section.elements) {
      newContenu = {
        ...newContenu,
        [section.id]: {
          ...newContenu[section.id],
          [element.id]: heritage.heritageContenu[section.id]?.[element.id]?.actif
            ? heritage.heritageContenu[section.id][element.id].etape?.contenu[section.id]?.[element.id] ?? null
            : etape.contenu[section.id]?.[element.id] ?? null,
        },
      }
    }
  }

  return { ...etape, ...heritage, substances, duree, amodiataireIds, titulaireIds, dateDebut, dateFin, ...perimetre, contenu: newContenu }
}
