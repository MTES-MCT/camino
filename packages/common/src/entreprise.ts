import { z } from 'zod'
import { CaminoDate, caminoDateValidator } from './date.js'
import { User } from './roles.js'
import { DocumentTypeId, entrepriseDocumentTypeIdValidator } from './static/documentsTypes.js'
import { SecteursMaritimes } from './static/facades.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'
import { TitreStatutId } from './static/titresStatuts.js'
import { TitreTypeId } from './static/titresTypes.js'
import { TitreReference } from './titres-references.js'
import { CommuneId } from './static/communes.js'
import { TitreId } from './titres.js'

export const entrepriseIdValidator = z.string().brand<'EntrepriseId'>()
export type EntrepriseId = z.infer<typeof entrepriseIdValidator>
export const isEntrepriseId = (eid: string): eid is EntrepriseId => entrepriseIdValidator.safeParse(eid).success
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
  id: entrepriseIdValidator,
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
  id: EntrepriseId
  nom: string
}
export interface TitreEntreprise {
  id: TitreId
  slug: string
  nom: string
  communes?: { id: CommuneId }[]
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

export const entrepriseTypeValidator = z.object({
  id: entrepriseIdValidator,
  nom: z.string(),
  telephone: z.string(),
  email: z.string(),
  legalSiren: z.string().nullable(),
  legalForme: z.string(),
  adresse: z.string(),
  codePostal: z.string(),
  commune: z.string(),
  url: z.string(),
  archive: z.boolean(),
  titulaireTitres: z.array(z.custom<TitreEntreprise>()),
  amodiataireTitres: z.array(z.custom<TitreEntreprise>()),
  utilisateurs: z.array(z.custom<Utilisateur>()),
  etablissements: z.array(z.custom<EntrepriseEtablissement>()),
})

export type EntrepriseType = z.infer<typeof entrepriseTypeValidator>

export const entrepriseDocumentIdValidator = z.string().brand<'EntrepriseDocumentId'>()
export type EntrepriseDocumentId = z.infer<typeof entrepriseDocumentIdValidator>

export const entrepriseDocumentValidator = z.object({
  id: entrepriseDocumentIdValidator,
  description: z.string().nullable(),
  date: caminoDateValidator,
  entreprise_document_type_id: entrepriseDocumentTypeIdValidator,
  entreprise_id: entrepriseIdValidator,
  can_delete_document: z.boolean(),
  largeobject_id: z.number(),
})

export type EntrepriseDocument = z.infer<typeof entrepriseDocumentValidator>

export const etapeEntrepriseDocumentValidator = entrepriseDocumentValidator.omit({ can_delete_document: true })
export type EtapeEntrepriseDocument = z.infer<typeof etapeEntrepriseDocumentValidator>

export const newEntrepriseId = (value: string): EntrepriseId => {
  return entrepriseIdValidator.parse(value)
}

export const toDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId, hash: string): DocumentId => {
  return documentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}

export const toEntrepriseDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId, hash: string): EntrepriseDocumentId => {
  return entrepriseDocumentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}
