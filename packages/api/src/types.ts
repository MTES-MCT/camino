import { AdministrationId } from 'camino-common/src/static/administrations'
import { CodePostal } from 'camino-common/src/static/departement'
import { User } from 'camino-common/src/roles'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreReference } from 'camino-common/src/titres-references'
import { SecteursMaritimes } from 'camino-common/src/static/facades'
import { CaminoDate } from 'camino-common/src/date'
import { EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise'
import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts'
import { DemarcheId, DemarcheSlug } from 'camino-common/src/demarche'
import type { Pool } from 'pg'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { CommuneId } from 'camino-common/src/static/communes'
import { ForetId } from 'camino-common/src/static/forets'
import { TitreId, TitreSlug } from 'camino-common/src/validators/titres'
import { EtapeBrouillon, EtapeId, EtapeNote, EtapeSlug } from 'camino-common/src/etape'
import { ActiviteId } from 'camino-common/src/activite'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon, GeojsonPoint, MultiPolygon } from 'camino-common/src/perimetre'
import { EtapeHeritageProps } from 'camino-common/src/heritage'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { ElementWithValue } from 'camino-common/src/sections'
import { KM2 } from 'camino-common/src/number'
import { HttpStatus } from 'camino-common/src/http'
import { CaminoError } from 'camino-common/src/zod-tools'

const TitreEtapesTravauxTypes = {
  AvisDesServicesEtCommissionsConsultatives: 'asc',
  DemandeAutorisationOuverture: 'wfa',
  DeclarationOuverture: 'wfo',
  DeclarationArret: 'wfd',
  DepotDemande: 'wdd',
  DemandeComplements: 'wdc',
  ReceptionComplements: 'wrc',
  Recevabilite: 'wre',
  AvisReception: 'war',
  SaisineAutoriteEnvironmentale: 'wse',
  AvisAutoriteEnvironmentale: 'wae',
  ArretePrefectoralSursis: 'wps',
  EnquetePublique: 'epu',
  AvisRapportDirecteurREAL: 'apd',
  TransPrescriptionsDemandeur: 'wtp',
  AvisPrescriptionsDemandeur: 'wau',
  PubliDecisionRecueilActesAdmin: 'wpa',
  DonneActeDeclaration: 'wda',
  ArretePrefectDonneActe1: 'wpp',
  ArretePrefectDonneActe2: 'wpo',
  ArretePrescriptionComplementaire: 'wpc',
  ArreteOuvertureTravauxMiniers: 'wao',
  MemoireFinTravaux: 'wmt',
  Recolement: 'wrt',
  Abandon: 'wab',
  DecisionAdmin: 'wdm',
  PorterAConnaissance: 'wpb',
} as const satisfies Record<string, EtapeTypeId>
export type CaminoApiError<T extends string> = CaminoError<T> & { status: HttpStatus }
export interface IFields {
  [key: string]: IFields
}

interface Index<T> {
  [id: string]: T
}

interface IColonne<T> {
  id: T
  relation?: string
  groupBy?: boolean | string[]
}

export const propsTitreEtapeIdKeys = ['points', 'titulaires', 'amodiataires', 'substances'] as const
type PropsTitreEtapeIdKeys = (typeof propsTitreEtapeIdKeys)[number]

type IPropId = PropsTitreEtapeIdKeys | 'administrationsLocales' | 'communes' | 'forets' | 'surface'

type ITitreColonneId = 'nom' | 'domaine' | 'type' | 'statut'

type ITitreDemarcheColonneId = 'titreNom' | 'titreDomaine' | 'titreType' | 'titreStatut' | 'type' | 'statut'

type ITitreActiviteColonneId = 'titre' | 'titreDomaine' | 'titreType' | 'titreStatut' | 'titulaires' | 'annee' | 'periode' | 'statut'

type IEntrepriseColonneId = 'nom' | 'siren'

interface IContenuId {
  sectionId: string
  elementId: string
}

type IContenuValeur = ElementWithValue['value'] | null

type IContenu = Record<string, Record<string, ElementWithValue['value']>>

type IPropsTitreEtapesIds = {
  [key in PropsTitreEtapeIdKeys]?: string
}

export interface IHeritageElement {
  actif: boolean
  etapeId?: EtapeId | null
  etape?: ITitreEtape
}

type IHeritageProps = Record<EtapeHeritageProps, IHeritageElement>

interface IHeritageContenu {
  [sectionId: string]: { [elementId: string]: IHeritageElement }
}

interface ICommune {
  id: CommuneId
  surface?: number | null
}

interface IEntrepriseEtablissement {
  id: string
  entrepriseId: string
  dateDebut: string
  nom?: string | null
  legalSiret?: string | null
  dateFin?: string | null
}

interface IEntreprise {
  id: EntrepriseId
  nom?: string
  paysId?: string | null
  legalSiren?: string | null
  legalEtranger?: string | null
  legalForme?: string | null
  categorie?: string | null
  dateCreation?: string | null
  adresse?: string | null
  codePostal?: CodePostal | null
  commune?: string | null
  cedex?: string | null
  email?: string | null
  telephone?: string | null
  url?: string | null
  etablissements?: IEntrepriseEtablissement[] | null
  archive?: boolean | null
}

export interface ITitreTitre {
  titreFromId: TitreId
  titreToId: TitreId
}

interface ITitre {
  id: TitreId
  slug?: TitreSlug
  nom: string
  typeId: TitreTypeId
  titreStatutId: TitreStatutId
  references?: TitreReference[] | null
  activitesEnConstruction?: number | null
  activitesAbsentes?: number | null
  substancesEtape?: ITitreEtape | null
  substances?: SubstanceLegaleId[] | null
  titulairesEtape?: ITitreEtape | null
  titulaireIds?: EntrepriseId[] | null
  amodiatairesEtape?: ITitreEtape | null
  amodiataireIds?: EntrepriseId[] | null
  administrationsLocales?: AdministrationId[] | null
  administrations?: AdministrationId[] | null
  surface?: number | null
  communes?: DeepReadonly<ICommune[]> | null
  forets?: DeepReadonly<ForetId[]> | null
  sdomZones?: DeepReadonly<SDOMZoneId[]> | null
  pointsEtape?: ITitreEtape | null
  secteursMaritime?: SecteursMaritimes[] | null
  demarches?: ITitreDemarche[]
  activites?: ITitreActivite[] | null
  publicLecture?: boolean | null
  propsTitreEtapesIds: IPropsTitreEtapesIds
  doublonTitreId?: TitreId | null
  confidentiel?: boolean | null

  geojson4326Centre?: GeojsonPoint | null
  geojson4326Perimetre?: MultiPolygon | null
}

interface ITitreActivite {
  id: ActiviteId
  slug?: string
  titreId: TitreId
  titre?: ITitre | null
  date: CaminoDate
  typeId: ActivitesTypesId
  activiteStatutId: ActivitesStatutId
  periodeId: number
  annee: number
  utilisateurId?: string | null
  dateSaisie?: CaminoDate
  contenu?: IContenu | null
  sections: DeepReadonly<Section[]>
  suppression?: boolean
}

interface ITitreDemarche {
  id: DemarcheId
  description?: string
  slug?: DemarcheSlug
  titreId: TitreId
  titre?: ITitre | null
  typeId: DemarcheTypeId
  statutId?: DemarcheStatutId | null
  ordre?: number | null
  demarcheDateDebut?: CaminoDate | null
  demarcheDateFin?: CaminoDate | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null

  etapes?: ITitreEtape[]
}

export interface ITitreEtapePerimetre {
  geojson4326Perimetre: FeatureMultiPolygon | null | undefined
  geojson4326Points: FeatureCollectionPoints | null | undefined
  geojsonOriginePerimetre: FeatureMultiPolygon | null | undefined
  geojsonOriginePoints: FeatureCollectionPoints | null | undefined
  geojsonOrigineGeoSystemeId: GeoSystemeId | null | undefined
  geojson4326Forages: FeatureCollectionForages | null | undefined
  geojsonOrigineForages: FeatureCollectionForages | null | undefined
  surface: KM2 | null | undefined
}
type ITitreEtape = {
  id: EtapeId
  slug?: EtapeSlug
  typeId: EtapeTypeId
  statutId: EtapeStatutId
  isBrouillon: EtapeBrouillon
  ordre?: number | null
  date: CaminoDate
  duree?: number | null
  contenu?: IContenu | null
  titreDemarcheId: DemarcheId
  demarche?: ITitreDemarche
  dateDebut?: CaminoDate | null
  dateFin?: CaminoDate | null
  substances?: SubstanceLegaleId[] | null
  titulaireIds?: EntrepriseId[] | null
  amodiataireIds?: EntrepriseId[] | null
  administrationsLocales?: AdministrationId[] | null
  entrepriseDocumentIds?: EntrepriseDocumentId[] | null
  etapeDocuments?: unknown[]
  communes?: DeepReadonly<ICommune[]> | null
  forets?: DeepReadonly<ForetId[]> | null
  sdomZones?: DeepReadonly<SDOMZoneId[]> | null
  secteursMaritime?: SecteursMaritimes[] | null
  heritageProps?: IHeritageProps | null
  heritageContenu?: IHeritageContenu | null
  note?: EtapeNote
} & Partial<ITitreEtapePerimetre>

interface ITitreEtapeFiltre {
  typeId: string
  statutId?: string
  dateDebut?: string
  dateFin?: string
}

interface IUtilisateurTitre {
  utilisateurId: string
  titreId: string
}

export type Context = { user: User; pool: Pool }

interface IJournaux {
  id: string
  utilisateurId: string
  utilisateur: {
    nom: string
    prenom: string
  }
  date: string
  elementId: string
  titreId: string
  operation: 'create' | 'update' | 'delete'
  differences: any
  titre: {
    nom: string
  }
}

export {
  TitreEtapesTravauxTypes,
  Index,
  ICommune,
  IContenu,
  IContenuValeur,
  IEntreprise,
  IEntrepriseEtablissement,
  ITitre,
  ITitreActivite,
  ITitreDemarche,
  ITitreEtape,
  ITitreEtapeFiltre,
  IUtilisateurTitre,
  IPropId,
  ITitreColonneId,
  ITitreDemarcheColonneId,
  ITitreActiviteColonneId,
  IEntrepriseColonneId,
  IColonne,
  IContenuId,
  IPropsTitreEtapesIds,
  IHeritageProps,
  IHeritageContenu,
  IJournaux,
}
