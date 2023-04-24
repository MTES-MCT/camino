import { FileUpload } from 'graphql-upload'
import { AdministrationId, AdministrationTypeId } from 'camino-common/src/static/administrations.js'
import { CodePostal, DepartementId } from 'camino-common/src/static/departement.js'
import { RegionId } from 'camino-common/src/static/region.js'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes.js'
import { BaseUserNotNull, isAdministrationRole, isEntrepriseOrBureauDetudeRole, Role, User, UserNotNull } from 'camino-common/src/roles.js'
import { DomaineId } from 'camino-common/src/static/domaines.js'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes.js'
import { PaysId } from 'camino-common/src/static/pays.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { Couleur } from 'camino-common/src/static/couleurs.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales.js'
import { UniteId } from 'camino-common/src/static/unites.js'
import { FrequenceId } from 'camino-common/src/static/frequence.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { TitreReference } from 'camino-common/src/titres-references.js'
import { DocumentType } from 'camino-common/src/static/documentsTypes.js'
import { SecteursMaritimes } from 'camino-common/src/static/facades.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts.js'
import { DemarcheId } from 'camino-common/src/demarche.js'

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
  PorterAConnaissance = 'wpb',
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

export const propsTitreEtapeIdKeys = ['points', 'titulaires', 'amodiataires', 'substances', 'surface'] as const
export type PropsTitreEtapeIdKeys = (typeof propsTitreEtapeIdKeys)[number]

type IPropId = PropsTitreEtapeIdKeys | 'administrationsLocales' | 'communes' | 'forets'

type ITitreColonneId = 'nom' | 'domaine' | 'coordonnees' | 'type' | 'statut' | 'activites'

type ITitreDemarcheColonneId = 'titreNom' | 'titreDomaine' | 'titreType' | 'titreStatut' | 'type' | 'statut'

type ITitreActiviteColonneId = 'titreNom' | 'titulaire' | 'periode' | 'statut'

type IUtilisateursColonneId = 'nom' | 'prenom' | 'email' | 'role'
type IEntrepriseColonneId = 'nom' | 'siren'

interface IContenuId {
  sectionId: string
  elementId: string
}

type IContenuValeur = string | number | string[] | boolean | IContenuElement[] | { file: FileUpload } | null

interface IContenuElement {
  [elementId: string]: IContenuValeur
}

interface IDecisionAnnexeContenuElement extends IContenuElement {
  date: CaminoDate
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

type ISectionElementType = 'integer' | 'number' | 'text' | 'date' | 'textarea' | 'checkbox' | 'checkboxes' | 'select' | 'radio' | 'file'

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
  activitesTypes?: IActiviteType[] | null
  utilisateurs?: IUtilisateur[] | null
  associee?: boolean | null
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

  travaux?: boolean
}

export const DOCUMENTS_REPERTOIRES = ['demarches', 'activites', 'entreprises', 'tmp'] as const
type IDocumentRepertoire = (typeof DOCUMENTS_REPERTOIRES)[number]

interface IDomaine {
  id: string
  nom: string
  description?: string
  ordre: number
  titresTypes: ITitreType[]
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
  utilisateurs?: IUtilisateur[] | null
  titulaireTitres?: ITitre[] | null
  amodiataireTitres?: ITitre[] | null
  archive?: boolean | null
}

interface ITitreEntreprise extends IEntreprise {
  operateur?: boolean
}

interface IEtapeTypeDocumentType {
  etapeTypeId: string
  documentTypeId: string
  optionnel?: boolean
}

interface IEtapeTypeJustificatifType extends IEtapeTypeDocumentType {}

interface ITitreTypeDemarcheTypeEtapeTypeJustificatifType extends IEtapeTypeDocumentType {
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
  dateFin?: string | null
  sections?: ISection[] | null
  sectionsSpecifiques?: ISection[] | null
  titreTypeId?: string | null
  demarcheTypeId?: string | null
  unique?: boolean | null
  documentsTypes?: DocumentType[]
  justificatifsTypes?: DocumentType[]
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
}

interface IForet extends IArea {}

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

interface IActiviteTypeTitreType {
  titreTypeId: string
  titreType?: ITitreType | null
  activiteTypeId: string
  activiteType?: IActiviteType | null
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
  typeId: TitreTypeId
  type?: ITitreType | null
  titreStatutId?: TitreStatutId | null
  references?: TitreReference[] | null
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
  administrations?: AdministrationId[] | null
  surfaceEtape?: ITitreEtape | null
  surface?: number | null
  communes?: ICommune[] | null
  forets?: IForet[] | null
  sdomZones?: SDOMZoneId[] | null
  pointsEtape?: ITitreEtape | null
  secteursMaritime?: SecteursMaritimes[] | null
  demarches?: ITitreDemarche[]
  activites?: ITitreActivite[] | null
  modification?: boolean | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  contenusTitreEtapesIds?: IContenusTitreEtapesIds | null
  propsTitreEtapesIds: IPropsTitreEtapesIds
  doublonTitreId?: string | null
  confidentiel?: boolean | null
}

interface ITitreActivite {
  id: string
  slug?: string
  titreId: string
  titre?: ITitre | null
  date: CaminoDate
  typeId: string
  type?: IActiviteType | null
  activiteStatutId: ActivitesStatutId
  periodeId: number
  annee: number
  utilisateurId?: string | null
  utilisateur?: IUtilisateur | null
  dateSaisie?: CaminoDate
  contenu?: IContenu | null
  sections: ISection[]
  documents?: IDocument[] | null
  modification?: boolean | null
  suppression?: boolean | null
  deposable?: boolean | null
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

interface ITitreEtapeJustificatif {
  documentId: string
  titreEtapeId: string
}

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
  demarcheDateDebut?: CaminoDate | null
  demarcheDateFin?: CaminoDate | null
  parents?: ITitreDemarche[] | null
  enfants?: ITitreDemarche[] | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  modification?: boolean | null
  suppression?: boolean | null

  etapes?: ITitreEtape[]
}

interface IDocument {
  id: string
  typeId: string
  date: CaminoDate
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
  date: CaminoDate
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
  dateDebut?: CaminoDate | null
  dateFin?: CaminoDate | null
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
  sdomZones?: SDOMZoneId[] | null
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
  // FIXME à bouger dans le code static (pas obligatoirement dans le common, car c’est utilisé que par le back)
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

interface IUtilisateur {
  id: string
  email?: string | null
  dateCreation: string
  nom?: string | null
  prenom?: string | null
  telephoneFixe?: string | null
  telephoneMobile?: string | null
  role: Role
  administrationId?: AdministrationId | null
  entreprises?: IEntreprise[] | null
  qgisToken?: string | null
}

export const formatUser = (userInBdd: IUtilisateur): UserNotNull => {
  if (!isNotNullNorUndefined(userInBdd.email)) {
    throw new Error('l’email est obligatoire')
  }

  if (!isNotNullNorUndefined(userInBdd.id)) {
    throw new Error('l’id est obligatoire')
  }

  if (!isNotNullNorUndefined(userInBdd.nom)) {
    throw new Error('le nom est obligatoire')
  }

  if (!isNotNullNorUndefined(userInBdd.prenom)) {
    throw new Error('le prénom est obligatoire')
  }
  const baseUser: Omit<BaseUserNotNull, 'role'> = {
    id: userInBdd.id,
    nom: userInBdd.nom,
    prenom: userInBdd.prenom,
    email: userInBdd.email,
  }
  if (isAdministrationRole(userInBdd.role)) {
    if (!isNotNullNorUndefined(userInBdd.administrationId)) {
      throw new Error("l'administration est obligatoire pour un admin")
    }

    return {
      ...baseUser,
      role: userInBdd.role,
      administrationId: userInBdd.administrationId,
    }
  }

  if (isEntrepriseOrBureauDetudeRole(userInBdd.role)) {
    if (!isNotNullNorUndefined(userInBdd.entreprises)) {
      throw new Error('les entreprises doivent être chargées')
    }

    return {
      ...baseUser,
      role: userInBdd.role,
      entreprises: userInBdd.entreprises,
    }
  }

  return { ...baseUser, role: userInBdd.role }
}

interface IUtilisateurTitre {
  utilisateurId: string
  titreId: string
  utilisateur?: IUtilisateur | null
}

export type Context = { user: User }

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
  IEtapeType,
  IForet,
  IGeoJson,
  IGeoJsonProperties,
  IGeometry,
  IActiviteTypeTitreType,
  IEtapeTypeJustificatifType,
  IAdministrationActiviteType,
  IAdministrationActiviteTypeEmail,
  ITitre,
  ITitreActivite,
  ITitreCommune,
  ITitreForet,
  ITitreArea,
  ITitreDemarche,
  IDocument,
  ITitreEtape,
  ITitreEtapeJustificatif,
  ITitreEtapeFiltre,
  ITitreIncertitudes,
  ITitrePoint,
  ITitrePointReference,
  ITitreType,
  ITitreTypeType,
  ITitreTypeDemarcheTypeEtapeType,
  ITitreTypeDemarcheTypeEtapeTypeJustificatifType,
  ITitreEntreprise,
  IUtilisateur,
  IUtilisateurTitre,
  IPropId,
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
  IDecisionAnnexeContenu,
}
