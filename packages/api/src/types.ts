import { FileUpload } from 'graphql-upload'
import {
  AdministrationId,
  AdministrationTypeId
} from 'camino-common/src/static/administrations'
import { CodePostal, DepartementId } from 'camino-common/src/static/departement'
import { RegionId } from 'camino-common/src/static/region'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { Role } from 'camino-common/src/roles'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { PaysId } from 'camino-common/src/static/pays'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { Couleur } from 'camino-common/src/static/couleurs'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { UniteId } from 'camino-common/src/static/unites'
import { FrequenceId } from 'camino-common/src/static/frequence'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { PhaseStatutId } from 'camino-common/src/static/phasesStatuts'
import { TitreReference } from 'camino-common/src/titres-references'
import { DocumentType } from 'camino-common/src/static/documentsTypes'
import { SecteursMaritimes } from 'camino-common/src/static/facades'

enum TitreEtapesTravauxTypes {
  DemandeAutorisationOuverture = 'wfa',
  DeclarationOuverture = 'wfo',
  DeclarationArret = 'wfd',
  DepotDemande = 'wdd',
  DemandeComplements = 'wdc',
  ReceptionComplements = 'wrc',
  Recevabilite = 'wre',
  AvisReception = 'war',
  SaisineAutoriteEnvironmentale = 'wse',
  AvisAutoriteEnvironmentale = 'wae',
  SaisineServiceEtat = 'wss',
  AvisServiceAdminLocal = 'wal',
  AvisDDTM = 'wad',
  AvisAutoriteMilitaire = 'wam',
  AvisARS = 'was',
  AvisDRAC = 'wac',
  AvisPrefetMaritime = 'wap',
  AvisAutresInstances = 'wai',
  ArretePrefectoralSursis = 'wps',
  MemoireReponseExploitant = 'wmm',
  OuvertureEnquetePublique = 'woe',
  ClotureEnquetePublique = 'wce',
  RapportDREAL = 'wrd',
  AvisRapportDirecteurREAL = 'wrl',
  TransPrescriptionsDemandeur = 'wtp',
  AvisCODERST = 'wat',
  AvisPrescriptionsDemandeur = 'wau',
  PubliDecisionRecueilActesAdmin = 'wpa',
  DonneActeDeclaration = 'wda',
  ArretePrefectDonneActe1 = 'wpp',
  ArretePrefectDonneActe2 = 'wpo',
  ArretePrescriptionComplementaire = 'wpc',
  ArreteOuvertureTravauxMiniers = 'wao',
  MemoireFinTravaux = 'wmt',
  Recolement = 'wrt',
  Abandon = 'wab',
  DecisionAdmin = 'wdm',
  PorterAConnaissance = 'wpb'
}

interface IFields {
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

export const propsTitreEtapeIdKeys = [
  'points',
  'titulaires',
  'amodiataires',
  'substances',
  'surface'
] as const
export type PropsTitreEtapeIdKeys = typeof propsTitreEtapeIdKeys[number]

type IPropId =
  | PropsTitreEtapeIdKeys
  | 'administrationsLocales'
  | 'communes'
  | 'forets'

type ITitreColonneId =
  | 'nom'
  | 'domaine'
  | 'coordonnees'
  | 'type'
  | 'statut'
  | 'activites'

type ITitreDemarcheColonneId =
  | 'titreNom'
  | 'titreDomaine'
  | 'titreType'
  | 'titreStatut'
  | 'type'
  | 'statut'

type ITitreActiviteColonneId = 'titreNom' | 'titulaire' | 'periode' | 'statut'

type IUtilisateursColonneId = 'nom' | 'prenom' | 'email' | 'role'
type IEntrepriseColonneId = 'nom' | 'siren'

interface IActiviteStatut {
  id: string
  nom: string
  couleur: Couleur
}

interface IContenuId {
  sectionId: string
  elementId: string
}

type IContenuValeur =
  | string
  | number
  | string[]
  | boolean
  | IContenuElement[]
  | { file: FileUpload }
  | null

interface IContenuElement {
  [elementId: string]: IContenuValeur
}

interface IDecisionAnnexeContenuElement extends IContenuElement {
  date: string
  statutId: EtapeStatutId
  [elementId: string]: IContenuValeur
}

interface IDecisionAnnexeContenu {
  [sectionId: string]: IDecisionAnnexeContenuElement
}

interface IContenu {
  [sectionId: string]: IContenuElement
}

type IPropsTitreEtapesIds = {
  [key in PropsTitreEtapeIdKeys]?: string
}

interface IContenusTitreEtapesIds {
  [sectionId: string]: { [key: string]: string }
}

interface IHeritageProps {
  [elementId: string]: {
    actif: boolean
    etapeId?: string | null
    etape?: ITitreEtape
  }
}

interface IHeritageContenu {
  [sectionId: string]: IHeritageProps
}

interface ISection {
  id: string
  nom?: string
  elements?: ISectionElement[] | null
}

type IValeurMetasNom = 'devises' | 'unites'

type ISectionElementType =
  | 'integer'
  | 'number'
  | 'text'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'checkboxes'
  | 'select'
  | 'radio'
  | 'multiple'
  | 'file'

interface ISectionElement {
  id: string
  nom: string
  type: ISectionElementType
  description?: string | null
  dateDebut?: string | null
  dateFin?: string | null
  periodesIds?: number[] | null
  valeurs?: { id: string; nom: string }[] | null
  valeursMetasNom?: IValeurMetasNom
  referenceUniteRatio?: number
  uniteId?: UniteId
  optionnel?: boolean
  elements?: ISectionElement[]
  sectionId?: string
}

interface IActiviteTypeDocumentType {
  activiteTypeId: string
  documentTypeId: string
  optionnel: boolean
}

interface IActiviteTypePays {
  activiteTypeId: string
  paysId: PaysId
}

interface IActiviteType {
  id: string
  nom: string
  description?: string
  ordre: number
  frequenceId: FrequenceId
  dateDebut: string
  delaiMois: number
  titresTypes: ITitreType[]
  documentsTypes: DocumentType[]
  sections: ISection[]
  activitesTypesPays?: IActiviteTypePays[] | null
  administrations?: IAdministration[] | null
  email?: string | null
  modification?: boolean | null
}

interface IAdministration {
  id: AdministrationId
  typeId: AdministrationTypeId
  nom?: string
  service?: string | null
  url?: string | null
  email?: string | null
  telephone?: string | null
  adresse1?: string | null
  adresse2?: string | null
  codePostal?: string | null
  commune?: string | null
  cedex?: string | null
  departementId?: DepartementId | null
  regionId?: RegionId | null
  abreviation?: string | null
  titresTypesTitresStatuts?: IAdministrationTitreTypeTitreStatut[] | null
  titresTypesEtapesTypes?: IAdministrationTitreTypeEtapeType[] | null
  activitesTypes?: IActiviteType[] | null
  utilisateurs?: IUtilisateur[] | null
  gestionnaireTitres?: ITitre[] | null
  associee?: boolean | null
  emailsModification?: boolean
  modification?: boolean | null
  activitesTypesEmails?: (IActiviteType & { email: string })[]
}

interface IArea {
  id: string
  nom: string
}

interface ICommune extends IArea {
  departementId?: DepartementId | null
  surface?: number | null
}

interface ICoordonnees {
  x: number
  y: number
}

interface IDemarcheStatut {
  id: string
  nom: string
  ordre: number
  couleur: Couleur
}

interface IDemarcheType {
  id: DemarcheTypeId
  nom: string
  ordre: number
  duree?: boolean | null
  points?: boolean | null
  substances?: boolean | null
  titulaires?: boolean | null
  renouvelable?: boolean | null
  exception?: boolean | null
  etapesTypes: IEtapeType[]
  titreTypeId?: string | null
  demarchesCreation?: boolean | null
  travaux?: boolean
}

export const DOCUMENTS_REPERTOIRES = [
  'demarches',
  'activites',
  'entreprises',
  'tmp'
] as const
type IDocumentRepertoire = typeof DOCUMENTS_REPERTOIRES[number]

interface IDomaine {
  id: string
  nom: string
  description?: string
  ordre: number
  titresTypes: ITitreType[]
  titresCreation: boolean
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
  id: string
  nom: string
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
  utilisateurs?: IUtilisateur[] | null
  titulaireTitres?: ITitre[] | null
  titresTypes?: (ITitreType & { titresCreation: boolean })[]
  amodiataireTitres?: ITitre[] | null
  modification?: boolean | null
  archive?: boolean | null
}

interface ITitreEntreprise extends IEntreprise {
  operateur?: boolean
}

interface IEntrepriseTitreType {
  entrepriseId: string
  titreTypeId: string
  titresCreation: boolean
}

interface IEtapeTypeDocumentType {
  etapeTypeId: string
  documentTypeId: string
  optionnel?: boolean
}

interface IEtapeTypeJustificatifType extends IEtapeTypeDocumentType {}

interface ITitreTypeDemarcheTypeEtapeTypeJustificatifType
  extends IEtapeTypeDocumentType {
  titreTypeId: string
  demarcheTypeId: string
}

interface IEtapeType {
  id: EtapeTypeId
  nom: string
  ordre: number
  description?: string
  acceptationAuto?: boolean | null
  fondamentale?: boolean | null
  dateDebut?: string | null
  dateFin?: string | null
  sections?: ISection[] | null
  sectionsSpecifiques?: ISection[] | null
  titreTypeId?: string | null
  demarcheTypeId?: string | null
  etapesCreation?: boolean | null
  unique?: boolean | null
  documentsTypes?: DocumentType[]
  justificatifsTypes?: DocumentType[]
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
}

interface IForet extends IArea {}
interface ISDOMZone extends IArea {}

type IGeoJsonProperties = Index<string | number>

interface IGeoJson {
  type: string
  geometry?: IGeometry | null
  bbox?: number[] | null
  properties: IGeoJsonProperties
  features?: IGeoJson[] | null
}

interface IGeoJsonCentre {
  type: string
  geometry?: IGeometry | null
  properties: { etapeId?: string | null }
}

interface IGeometry {
  type: string
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}

interface IForet {
  id: string
  nom: string
}

interface ITitreTypeEtapeType {
  titreTypeId: string
  titreType?: ITitreType | null
  etapeTypeId: string
  etapeType?: IEtapeType | null
}

interface ITitreTypeDemarcheType {
  titreTypeId: string
  demarcheTypeId: string
  dureeMax?: number | null
  acceptationImplicite?: boolean | null
  delaiImplicite?: number | null
  delaiRecours?: number | null
  legalRef?: string | null
  legaleLien?: string | null
  dateDebut?: string | null
  dateFin?: string | null
}

interface IActiviteTypeTitreType {
  titreTypeId: string
  titreType?: ITitreType | null
  activiteTypeId: string
  activiteType?: IActiviteType | null
}

interface IAdministrationTitreTypeTitreStatut {
  titreTypeId: TitreTypeId
  titreType?: ITitreType | null
  titreStatutId: TitreStatutId
  administrationId: AdministrationId
  titresModificationInterdit: boolean
  demarchesModificationInterdit: boolean
  etapesModificationInterdit: boolean
}

interface IAdministrationTitreTypeEtapeType extends ITitreTypeEtapeType {
  administrationId: string
  creationInterdit: boolean
  lectureInterdit: boolean
  modificationInterdit: boolean
}

interface IAdministrationActiviteType {
  administrationId: string
  activiteTypeId: string
  lectureInterdit: boolean
  modificationInterdit: boolean
}

interface IAdministrationActiviteTypeEmail {
  administrationId: AdministrationId
  activiteTypeId: string
  email: string
}

export interface ITitreTitre {
  titreFromId: string
  titreToId: string
}

interface ITitre {
  id: string
  slug?: string
  nom: string
  domaineId: DomaineId
  domaine?: IDomaine | null
  typeId: TitreTypeId
  type?: ITitreType | null
  titreStatutId?: TitreStatutId | null
  references?: TitreReference[] | null
  dateDebut?: string | null
  dateFin?: string | null
  dateDemande?: string | null
  activitesDeposees?: number | null
  activitesEnConstruction?: number | null
  activitesAbsentes?: number | null
  substancesEtape?: ITitreEtape | null
  substances?: SubstanceLegaleId[] | null
  points?: ITitrePoint[] | null
  coordonnees?: ICoordonnees | null
  geojsonMultiPolygon?: IGeoJson | null
  geojsonPoints?: IGeoJson | null
  geojsonCentre?: IGeoJsonCentre | null
  titulaires?: ITitreEntreprise[] | null
  amodiataires?: ITitreEntreprise[] | null
  administrationsLocales?: AdministrationId[] | null
  administrationsGestionnaires?: IAdministration[] | null
  administrations?: AdministrationId[] | null
  surfaceEtape?: ITitreEtape | null
  surface?: number | null
  communes?: ICommune[] | null
  forets?: IForet[] | null
  sdomZones?: ISDOMZone[] | null
  pointsEtape?: ITitreEtape | null
  secteursMaritime?: SecteursMaritimes[] | null
  demarches?: ITitreDemarche[]
  activites?: ITitreActivite[] | null
  modification?: boolean | null
  suppression?: boolean | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  travauxCreation?: boolean | null
  demarchesCreation?: boolean | null
  contenusTitreEtapesIds?: IContenusTitreEtapesIds | null
  propsTitreEtapesIds: IPropsTitreEtapesIds
  contenu?: IContenu | null
  doublonTitreId?: string | null
  confidentiel?: boolean | null
}

interface ITitreActivite {
  id: string
  slug?: string
  titreId: string
  titre?: ITitre | null
  date: string
  typeId: string
  type?: IActiviteType | null
  statutId: string
  statut?: IActiviteStatut | null
  periodeId: number
  annee: number
  utilisateurId?: string | null
  utilisateur?: IUtilisateur | null
  dateSaisie?: string
  contenu?: IContenu | null
  sections: ISection[]
  documents?: IDocument[] | null
  modification?: boolean | null
  suppression?: boolean | null
  deposable?: boolean | null
}

interface ITitreAdministrationGestionnaire {
  administrationId: string
  titreId: string
  associee?: boolean | null
}

interface ITitreArea {
  titreEtapeId: string
}

interface ITitreCommune extends ITitreArea {
  communeId: string
  surface: number
}

interface ITitreForet extends ITitreArea {
  foretId: string
}

interface ITitreSDOMZone extends ITitreArea {
  sdomZoneId: string
}

interface ITitreEtapeJustificatif {
  documentId: string
  titreEtapeId: string
}

export type DemarcheId = string & { __camino: 'demarcheId' }
interface ITitreDemarche {
  id: DemarcheId
  description?: string
  slug?: string
  titreId: string
  titre?: ITitre | null
  typeId: DemarcheTypeId
  statutId?: DemarcheStatutId | null
  type?: IDemarcheType | null
  ordre?: number | null
  titreType?: ITitreType | null
  phase?: ITitrePhase | null
  parents?: ITitreDemarche[] | null
  enfants?: ITitreDemarche[] | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  modification?: boolean | null
  suppression?: boolean | null
  etapesCreation?: boolean | null
  etapes?: ITitreEtape[]
}

interface IDocument {
  id: string
  typeId: string
  date: string
  description?: string | null
  type?: DocumentType | null
  fichier?: boolean | null
  fichierTypeId?: string | null
  fichierNouveau?: { file: FileUpload } | null
  nomTemporaire?: string | null
  url?: string | null
  uri?: string | null
  jorf?: string | null
  nor?: string | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  titreEtapeId?: string | null
  etape?: ITitreEtape | null
  titreActiviteId?: string | null
  activite?: ITitreActivite | null
  entrepriseId?: string | null
  entreprise?: IEntreprise | null
  etapesAssociees?: ITitreEtape[] | null
  suppression?: boolean | null
}
interface ITitreEtape {
  id: string
  slug?: string
  typeId: EtapeTypeId
  type?: IEtapeType | null
  statutId: EtapeStatutId
  ordre?: number | null
  date: string
  duree?: number | null
  surface?: number | null
  contenu?: IContenu | null
  documents?: IDocument[] | null
  modification?: boolean | null
  documentIds?: string[] | null
  justificatifsTypesSpecifiques?: DocumentType[] | null
  sectionsSpecifiques?: ISection[] | null
  titreDemarcheId: DemarcheId
  demarche?: ITitreDemarche
  dateDebut?: string | null
  dateFin?: string | null
  substances?: SubstanceLegaleId[] | null
  points?: ITitrePoint[] | null
  geojsonMultiPolygon?: IGeoJson | null
  geojsonPoints?: IGeoJson | null
  titulaires?: ITitreEntreprise[] | null
  amodiataires?: ITitreEntreprise[] | null
  administrationsLocales?: AdministrationId[] | null
  justificatifs?: IDocument[] | null
  justificatifIds?: string[] | null
  communes?: ICommune[] | null
  forets?: IForet[] | null
  sdomZones?: ISDOMZone[] | null
  secteursMaritime?: SecteursMaritimes[] | null
  incertitudes?: ITitreIncertitudes | null
  contenusTitreEtapesIds?: IContenusTitreEtapesIds | null
  heritageProps?: IHeritageProps | null
  heritageContenu?: IHeritageContenu | null
  deposable?: boolean | null
  decisionsAnnexesSections?: ISection[] | null
  decisionsAnnexesContenu?: IDecisionAnnexeContenu | null
}

interface ITitreEtapeFiltre {
  typeId: string
  statutId?: string
  dateDebut?: string
  dateFin?: string
}

interface ITitreIncertitudes {
  date?: boolean | null
  dateDebut?: boolean | null
  dateFin?: boolean | null
  duree?: boolean | null
  surface?: boolean | null
  points?: boolean | null
  substances?: boolean | null
  titulaires?: boolean | null
  amodiataires?: boolean | null
  administrations?: boolean | null
}

interface ITitrePhase {
  titreDemarcheId: string
  phaseStatutId: PhaseStatutId
  dateDebut: string
  dateFin: string
}

interface ITitrePoint {
  id: string
  slug?: string
  titreEtapeId: string
  nom?: string | null
  description?: string | null
  groupe: number
  contour: number
  point: number
  references: ITitrePointReference[]
  coordonnees: ICoordonnees
  lot?: number | null
  securite?: boolean | null
  subsidiaire?: boolean | null
}

interface ITitrePointReference {
  id: string
  slug?: string
  titrePointId: string
  geoSystemeId: GeoSystemeId
  coordonnees: ICoordonnees
  opposable?: boolean | null
}

type ICacheId = 'matomo'

interface ICache {
  id: ICacheId
  valeur: any
}

interface ITitreType {
  id: TitreTypeId
  domaineId: DomaineId
  typeId: TitreTypeTypeId
  archive?: boolean | null
  type: ITitreTypeType
  demarchesTypes?: IDemarcheType[] | null
  contenuIds?: IContenuId[] | null
  sections?: ISection[] | null
}

interface ITitreTypeType {
  id: TitreTypeTypeId
  nom: string
  ordre: number
}

interface ITitreTypeDemarcheTypeEtapeType {
  titreTypeId: string
  demarcheTypeId: string
  etapeTypeId: string

  sections?: ISection[] | null
  ordre: number
  etapeType?: IEtapeType
  documentsTypes?: DocumentType[] | null
  justificatifsTypes?: DocumentType[] | null
}

interface IUser extends IUtilisateur {
  sections: Index<boolean>
}

interface IUtilisateur {
  id: string
  email?: string | null
  motDePasse?: string | null
  dateCreation: string
  nom?: string | null
  prenom?: string | null
  telephoneFixe?: string | null
  telephoneMobile?: string | null
  role: Role
  // TODO: définir une interface IUtilisateurPreferences
  preferences?: any | null
  administrationId: AdministrationId | undefined | null
  entreprises?: IEntreprise[] | null
  modification?: boolean | null
  suppression?: boolean | null
  permissionModification?: boolean | null
  entreprisesCreation?: boolean | null
  utilisateursCreation?: boolean | null
  refreshToken?: string | null
  qgisToken?: string | null
}

interface IUtilisateurTitre {
  utilisateurId: string
  titreId: string
  utilisateur?: IUtilisateur | null
}

type IUtilisateurCreation = Omit<IUtilisateur, 'id'>

interface IToken {
  user?: ITokenUser
  res?: any
}

interface ITokenUser {
  id?: string
  email?: string
  iat?: number
}

type IFormat = 'xlsx' | 'csv' | 'ods' | 'geojson' | 'json' | 'pdf' | 'zip'

interface ITitreDemande {
  nom: string
  typeId: TitreTypeId
  domaineId: DomaineId
  entrepriseId: string
  references?: TitreReference[]
}
interface IJournaux {
  id: string
  utilisateurId: string
  date: string
  elementId: string
  titreId: string
  operation: 'create' | 'update' | 'delete'
  differences: any
}

export {
  TitreEtapesTravauxTypes,
  Index,
  IFields,
  IFormat,
  IActiviteStatut,
  IActiviteType,
  IActiviteTypeDocumentType,
  ISection,
  ISectionElement,
  ISectionElementType,
  IAdministration,
  ICommune,
  IArea,
  IContenu,
  IContenuElement,
  IContenuValeur,
  IContenusTitreEtapesIds,
  ICoordonnees,
  IDemarcheStatut,
  IDemarcheType,
  IDocumentRepertoire,
  IDomaine,
  IEntreprise,
  IEntrepriseEtablissement,
  IEntrepriseTitreType,
  IEtapeType,
  IForet,
  ISDOMZone,
  IGeoJson,
  IGeoJsonProperties,
  IGeometry,
  ITitreTypeDemarcheType,
  IActiviteTypeTitreType,
  IEtapeTypeJustificatifType,
  IAdministrationTitreTypeTitreStatut,
  IAdministrationTitreTypeEtapeType,
  IAdministrationActiviteType,
  IAdministrationActiviteTypeEmail,
  ITitre,
  ITitreActivite,
  ITitreAdministrationGestionnaire,
  ITitreCommune,
  ITitreForet,
  ITitreSDOMZone,
  ITitreArea,
  ITitreDemarche,
  IDocument,
  ITitreEtape,
  ITitreEtapeJustificatif,
  ITitreEtapeFiltre,
  ITitreIncertitudes,
  ITitrePhase,
  ITitrePoint,
  ITitrePointReference,
  ITitreType,
  ITitreTypeType,
  ITitreTypeDemarcheTypeEtapeType,
  ITitreTypeDemarcheTypeEtapeTypeJustificatifType,
  ITitreEntreprise,
  IUser,
  IUtilisateur,
  IUtilisateurTitre,
  IUtilisateurCreation,
  IPropId,
  IToken,
  ITokenUser,
  ITitreColonneId,
  ITitreDemarcheColonneId,
  ITitreActiviteColonneId,
  IUtilisateursColonneId,
  IEntrepriseColonneId,
  IColonne,
  IContenuId,
  IPropsTitreEtapesIds,
  IHeritageProps,
  IHeritageContenu,
  ICache,
  ICacheId,
  IActiviteTypePays,
  ITitreDemande,
  IJournaux,
  IDecisionAnnexeContenu
}
