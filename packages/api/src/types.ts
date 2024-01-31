import { FileUpload } from 'graphql-upload'
import { AdministrationId, AdministrationTypeId } from 'camino-common/src/static/administrations.js'
import { CodePostal, DepartementId } from 'camino-common/src/static/departement.js'
import { RegionId } from 'camino-common/src/static/region.js'
import { BaseUserNotNull, isAdministrationRole, isEntrepriseOrBureauDetudeRole, Role, User, UserNotNull, UtilisateurId } from 'camino-common/src/roles.js'
import { DomaineId } from 'camino-common/src/static/domaines.js'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales.js'
import { FrequenceId } from 'camino-common/src/static/frequence.js'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { TitreReference } from 'camino-common/src/titres-references.js'
import { DocumentType, DocumentTypeId, FileUploadType } from 'camino-common/src/static/documentsTypes.js'
import { SecteursMaritimes } from 'camino-common/src/static/facades.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DocumentId, EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise.js'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts.js'
import { DemarcheId, DemarcheSlug } from 'camino-common/src/demarche.js'
import type { Pool } from 'pg'
import { Section, SectionElement } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { ForetId } from 'camino-common/src/static/forets.js'
import { TitreId, TitreSlug } from 'camino-common/src/validators/titres.js'
import { EtapeId, EtapeSlug } from 'camino-common/src/etape'
import { ActiviteId } from 'camino-common/src/activite.js'
import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonPoint } from 'camino-common/src/perimetre.js'
import { EtapeHeritageProps } from 'camino-common/src/heritage'

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

export const propsTitreEtapeIdKeys = ['points', 'titulaires', 'amodiataires', 'substances'] as const
type PropsTitreEtapeIdKeys = (typeof propsTitreEtapeIdKeys)[number]

type IPropId = PropsTitreEtapeIdKeys | 'administrationsLocales' | 'communes' | 'forets' | 'surface'

type ITitreColonneId = 'nom' | 'domaine' | 'type' | 'statut'

type ITitreDemarcheColonneId = 'titreNom' | 'titreDomaine' | 'titreType' | 'titreStatut' | 'type' | 'statut'

type ITitreActiviteColonneId = 'titre' | 'titreDomaine' | 'titreType' | 'titreStatut' | 'titulaires' | 'annee' | 'periode' | 'statut'

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

export interface IHeritageElement {
  actif: boolean
  etapeId?: EtapeId | null
  etape?: ITitreEtape
}

type IHeritageProps = Record<EtapeHeritageProps, IHeritageElement>

interface IHeritageContenu {
  [sectionId: string]: { [elementId: string]: IHeritageElement }
}

interface IActiviteType {
  id: ActivitesTypesId
  nom: string
  description?: string
  frequenceId: FrequenceId
  dateDebut: string
  delaiMois: number
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
  utilisateurs?: IUtilisateur[] | null
  associee?: boolean | null
  modification?: boolean | null
  activitesTypesEmails?: (IActiviteType & { email: string })[]
}

interface ICommune {
  id: CommuneId
  surface?: number | null
}

interface IDemarcheType {
  id: DemarcheTypeId
  nom: string
  duree?: boolean | null
  points?: boolean | null
  substances?: boolean | null
  titulaires?: boolean | null
  renouvelable?: boolean | null
  exception?: boolean | null
  titreTypeId?: string | null

  travaux?: boolean
}

export const DOCUMENTS_REPERTOIRES = ['demarches', 'tmp'] as const
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

// TODO 2024-01-10 supprimer ça dès que l'on arrête de faire passer le type d'étape entier via graphql
interface IEtapeType {
  id: EtapeTypeId
  nom: string
  ordre: number
  description?: string
  acceptationAuto?: boolean | null
  fondamentale?: boolean | null
  dateFin?: string | null
  titreTypeId?: string | null
  demarcheTypeId?: string | null
  unique?: boolean | null
  documentsTypes?: DocumentType[]
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
}

interface IAdministrationActiviteTypeEmail {
  administrationId: AdministrationId
  activiteTypeId: string
  email: string
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
  type?: ITitreType | null
  titreStatutId: TitreStatutId
  references?: TitreReference[] | null
  activitesEnConstruction?: number | null
  activitesAbsentes?: number | null
  substancesEtape?: ITitreEtape | null
  substances?: SubstanceLegaleId[] | null
  titulaires?: ITitreEntreprise[] | null
  amodiataires?: ITitreEntreprise[] | null
  administrationsLocales?: AdministrationId[] | null
  administrations?: AdministrationId[] | null
  surface?: number | null
  communes?: ICommune[] | null
  forets?: ForetId[] | null
  sdomZones?: SDOMZoneId[] | null
  pointsEtape?: ITitreEtape | null
  secteursMaritime?: SecteursMaritimes[] | null
  demarches?: ITitreDemarche[]
  activites?: ITitreActivite[] | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  contenusTitreEtapesIds?: IContenusTitreEtapesIds | null
  propsTitreEtapesIds: IPropsTitreEtapesIds
  doublonTitreId?: string | null
  confidentiel?: boolean | null

  geojson4326Centre?: GeojsonPoint | null
  geojson4326Perimetre?: FeatureMultiPolygon | null
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
  utilisateur?: IUtilisateur | null
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
  type?: IDemarcheType | null
  ordre?: number | null
  titreType?: ITitreType | null
  demarcheDateDebut?: CaminoDate | null
  demarcheDateFin?: CaminoDate | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null

  etapes?: ITitreEtape[]
}

interface IDocument {
  id: DocumentId
  typeId: DocumentTypeId
  date: CaminoDate
  description?: string | null
  type?: DocumentType | null
  fichier?: boolean | null
  fichierTypeId?: FileUploadType | null
  fichierNouveau?: { file: FileUpload } | null
  nomTemporaire?: string | null
  publicLecture?: boolean | null
  entreprisesLecture?: boolean | null
  titreEtapeId?: EtapeId | null
  etape?: ITitreEtape | null
  suppression?: boolean | null
}
interface ITitreEtape {
  id: EtapeId
  slug?: EtapeSlug
  typeId: EtapeTypeId
  type?: IEtapeType | null
  statutId: EtapeStatutId
  ordre?: number | null
  date: CaminoDate
  duree?: number | null
  surface?: number | null
  contenu?: IContenu | null
  documents?: IDocument[] | null
  documentIds?: string[] | null
  titreDemarcheId: DemarcheId
  demarche?: ITitreDemarche
  dateDebut?: CaminoDate | null
  dateFin?: CaminoDate | null
  substances?: SubstanceLegaleId[] | null
  titulaires?: ITitreEntreprise[] | null
  amodiataires?: ITitreEntreprise[] | null
  administrationsLocales?: AdministrationId[] | null
  entrepriseDocumentIds?: EntrepriseDocumentId[] | null
  communes?: ICommune[] | null
  forets?: ForetId[] | null
  sdomZones?: SDOMZoneId[] | null
  secteursMaritime?: SecteursMaritimes[] | null
  contenusTitreEtapesIds?: IContenusTitreEtapesIds | null
  heritageProps?: IHeritageProps | null
  heritageContenu?: IHeritageContenu | null
  decisionsAnnexesSections?: DeepReadonly<(Omit<Section, 'elements'> & { elements: (SectionElement & { sectionId?: string })[] })[]> | null
  decisionsAnnexesContenu?: IDecisionAnnexeContenu | null
  notes?: string | null
  geojson4326Perimetre?: FeatureMultiPolygon | null
  geojson4326Points?: FeatureCollectionPoints | null
}

interface ITitreEtapeFiltre {
  typeId: string
  statutId?: string
  dateDebut?: string
  dateFin?: string
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
  // TODO 2023-02-19 à bouger dans le code static (pas obligatoirement dans le common, car c’est utilisé que par le back)
  contenuIds?: IContenuId[] | null
}

interface ITitreTypeType {
  id: TitreTypeTypeId
  nom: string
  ordre: number
}

interface IUtilisateur {
  id: UtilisateurId
  email?: string | null
  keycloakId?: string | null
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
  const baseUser: Omit<BaseUserNotNull, 'role'> = {
    id: userInBdd.id,
    nom: userInBdd.nom,
    prenom: userInBdd.prenom ?? '',
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

export type Context = { user: User; pool: Pool }

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
  IFields,
  IActiviteType,
  IAdministration,
  ICommune,
  IContenu,
  IContenuElement,
  IContenuValeur,
  IContenusTitreEtapesIds,
  IDemarcheType,
  IDocumentRepertoire,
  IDomaine,
  IEntreprise,
  IEntrepriseEtablissement,
  IEtapeType,
  IAdministrationActiviteTypeEmail,
  ITitre,
  ITitreActivite,
  ITitreDemarche,
  IDocument,
  ITitreEtape,
  ITitreEtapeFiltre,
  ITitreType,
  ITitreTypeType,
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
  ITitreDemande,
  IJournaux,
  IDecisionAnnexeContenu,
}
