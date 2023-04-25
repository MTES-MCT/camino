import { z } from 'zod'
export const REFERENCES_TYPES_KEYS = ['brg', 'dea', 'deb', 'dge', 'ifr', 'irs', 'nus', 'onf', 'ptm', 'rnt'] as const

export const referenceTypeIdValidator = z.enum(REFERENCES_TYPES_KEYS)

export type ReferenceTypeId = z.infer<typeof referenceTypeIdValidator>

export const REFERENCES_TYPES_IDS = {
  BRGM: 'brg',
  DEAL: 'dea',
  DEB: 'deb',
  DGEC: 'dge',
  Ifremer: 'ifr',
  IRSN: 'irs',
  NomDUsage: 'nus',
  ONF: 'onf',
  PTMG: 'ptm',
  RNTM: 'rnt',
} as const satisfies Record<string, ReferenceTypeId>

export type ReferenceType<T = ReferenceTypeId> = {
  id: T
  nom: string
}
export const ReferencesTypes: { [key in ReferenceTypeId]: ReferenceType<key> } = {
  brg: { id: 'brg', nom: 'BRGM' },
  dea: { id: 'dea', nom: 'DEAL' },
  deb: { id: 'deb', nom: 'DEB' },
  dge: { id: 'dge', nom: 'DGEC' },
  ifr: { id: 'ifr', nom: 'Ifremer' },
  irs: { id: 'irs', nom: 'IRSN' },
  nus: { id: 'nus', nom: "Nom d'usage" },
  onf: { id: 'onf', nom: 'ONF' },
  ptm: { id: 'ptm', nom: 'PTMG' },
  rnt: { id: 'rnt', nom: 'RNTM' },
}

export const sortedReferencesTypes = Object.values(ReferencesTypes).sort((a, b) => a.nom.localeCompare(b.nom))
