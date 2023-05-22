import { z } from 'zod'
import { CaminoDate, caminoDateValidator } from './date.js'
import { User } from './roles.js'
import { DepartementId } from './static/departement.js'
import { DocumentTypeId, entrepriseDocumentTypeIdValidator } from './static/documentsTypes.js'
import { SecteursMaritimes } from './static/facades.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { TitreStatutId } from './static/titresStatuts.js'
import { TitreTypeId } from './static/titresTypes.js'
import { TitreReference } from './titres-references.js'

export const eidValidator = z.string().brand<'EntrepriseId'>()
export type EntrepriseId = z.infer<typeof eidValidator>
export const isEntrepriseId = (eid: string): eid is EntrepriseId => eidValidator.safeParse(eid).success
export const documentIdValidator = z.string().brand<'DocumentId'>()

export type DocumentId = z.infer<typeof documentIdValidator>

export const sirenValidator = z
  .string()
  .regex(/^[0-9]{9}$/)
  .brand('Siren')
export type Siren = z.infer<typeof sirenValidator>

export const tempDocumentNameValidator = z.string().brand('TempDocumentName')

export type TempDocumentName = z.infer<typeof tempDocumentNameValidator>

export const entrepriseDocumentInputValidator = z.object({
  typeId: entrepriseDocumentTypeIdValidator,
  date: caminoDateValidator,
  tempDocumentName: tempDocumentNameValidator,
  description: z.string(),
})

export type EntrepriseDocumentInput = z.infer<typeof entrepriseDocumentInputValidator>

export const entrepriseModificationValidator = z.object({
  id: eidValidator,
  url: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().optional(),
  archive: z.boolean().optional(),
})

// TODO 2023-05-15 pas certain de l’utilité de la date de fin
export type EntrepriseEtablissement = { id: string; dateDebut: CaminoDate; dateFin: CaminoDate | null; nom: string }
export interface Entreprise {
  id: EntrepriseId
  nom: string
  etablissements: EntrepriseEtablissement[]
  legalSiren?: string
}

interface Titulaire {
  id: string
  nom: string
}
export interface TitreEntreprise {
  id: string
  slug: string
  nom: string
  communes?: { departementId: DepartementId }[]
  secteursMaritime?: [SecteursMaritimes]
  references?: TitreReference[]
  coordonnees?: { x: number; y: number }
  // id devrait être une union
  typeId: TitreTypeId
  titreStatutId: TitreStatutId
  substances: SubstanceLegaleId[]
  titulaires: Titulaire[]
  activitesAbsentes: number | null
  activitesEnConstruction: number | null
}
export type Utilisateur = {
  id: string
  prenom: string
  nom: string
  email: string
  telephoneFixe?: string
  telephoneMobile?: string
  entreprises?: Entreprise[]
} & User

export type EntrepriseType = {
  id: EntrepriseId
  nom: string
  telephone: string
  email: string
  legalSiren: string
  legalForme: string
  adresse: string
  codePostal: string
  commune: string
  url: string
  archive: boolean
  titulaireTitres: TitreEntreprise[]
  amodiataireTitres: TitreEntreprise[]
  utilisateurs: Utilisateur[]
  etablissements: EntrepriseEtablissement[]
}

export const entrepriseDocumentValidator = z.object({
  id: documentIdValidator,
  description: z.string().nullable(),
  date: caminoDateValidator,
  type_id: entrepriseDocumentTypeIdValidator,
  can_delete_document: z.boolean(),
})

export type EntrepriseDocument = z.infer<typeof entrepriseDocumentValidator>

export const newEntrepriseId = (value: string): EntrepriseId => {
  return eidValidator.parse(value)
}

export const toDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId, hash: string): DocumentId => {
  return documentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}
