import { z } from 'zod'
const IDS = ['brg', 'dea', 'deb', 'dge', 'ifr', 'irs', 'nus', 'onf', 'ptm', 'rnt'] as const

export const referenceTypeIdValidator = z.enum(IDS)

export type ReferenceTypeId = z.infer<typeof referenceTypeIdValidator>

export type ReferenceType<T = ReferenceTypeId> = {
  id: T
  nom: string
}

export const REFERENCES_TYPES_IDS = {
  BRGM: 'brg',
  DEAL: 'dea',
  DEB: 'deb',
  DGEC: 'dge',
  IFREMER: 'ifr',
  IRSN: 'irs',
  NOM_USAGE: 'nus',
  ONF: 'onf',
  PTMG: 'ptm',
  RNTM: 'rnt',
} as const satisfies Record<string, (typeof IDS)[number]>

export const ReferencesTypes: { [key in ReferenceTypeId]: ReferenceType<key> } = {
  [REFERENCES_TYPES_IDS.BRGM]: { id: 'brg', nom: 'BRGM' },
  [REFERENCES_TYPES_IDS.DEAL]: { id: 'dea', nom: 'DEAL' },
  [REFERENCES_TYPES_IDS.DEB]: { id: 'deb', nom: 'DEB' },
  [REFERENCES_TYPES_IDS.DGEC]: { id: 'dge', nom: 'DGEC' },
  [REFERENCES_TYPES_IDS.IFREMER]: { id: 'ifr', nom: 'Ifremer' },
  [REFERENCES_TYPES_IDS.IRSN]: { id: 'irs', nom: 'IRSN' },
  [REFERENCES_TYPES_IDS.NOM_USAGE]: { id: 'nus', nom: "Nom d'usage" },
  [REFERENCES_TYPES_IDS.ONF]: { id: 'onf', nom: 'ONF' },
  [REFERENCES_TYPES_IDS.PTMG]: { id: 'ptm', nom: 'PTMG' },
  [REFERENCES_TYPES_IDS.RNTM]: { id: 'rnt', nom: 'RNTM' },
}

export const sortedReferencesTypes = Object.values(ReferencesTypes).sort((a, b) => a.nom.localeCompare(b.nom))
