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
import { tempDocumentNameValidator } from './document.js'
import type { TitreId } from './validators/titres.js'

export const entrepriseIdValidator = z.string().brand<'EntrepriseId'>()
export type EntrepriseId = z.infer<typeof entrepriseIdValidator>
export const isEntrepriseId = (eid: string): eid is EntrepriseId => entrepriseIdValidator.safeParse(eid).success

export const entrepriseEtablissementIdValidator = z.string().brand<'EntrepriseEtablissementId'>()

export const sirenValidator = z
  .string()
  .regex(/^[0-9]{9}$/)
  .brand('Siren')
export type Siren = z.infer<typeof sirenValidator>

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

export const entrepriseEtablissementValidator = z.object({
  id: entrepriseEtablissementIdValidator,
  date_debut: caminoDateValidator,
  date_fin: caminoDateValidator.nullable(),
  nom: z.string(),
})

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
  titulaireIds: EntrepriseId[]
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

export const entrepriseValidator = z.object({ id: entrepriseIdValidator, legal_siren: z.string().nullable(), nom: z.string() })
export type Entreprise = z.infer<typeof entrepriseValidator>

export const entrepriseTypeValidator = entrepriseValidator.extend({
  telephone: z.string().nullable(),
  email: z.string().nullable(),
  legal_forme: z.string().nullable(),
  adresse: z.string().nullable(),
  code_postal: z.string().nullable(),
  commune: z.string().nullable(),
  url: z.string().nullable(),
  archive: z.boolean(),
  etablissements: z.array(entrepriseEtablissementValidator),
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
})

export type EntrepriseDocument = z.infer<typeof entrepriseDocumentValidator>

export const etapeEntrepriseDocumentValidator = entrepriseDocumentValidator.omit({ can_delete_document: true })
export type EtapeEntrepriseDocument = z.infer<typeof etapeEntrepriseDocumentValidator>

export const newEntrepriseId = (value: string): EntrepriseId => {
  return entrepriseIdValidator.parse(value)
}

export const toEntrepriseDocumentId = (date: CaminoDate, documentTypeId: DocumentTypeId, hash: string): EntrepriseDocumentId => {
  return entrepriseDocumentIdValidator.parse(`${date}-${documentTypeId}-${hash}`)
}
