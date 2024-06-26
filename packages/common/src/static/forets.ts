import { z } from 'zod'

// prettier-ignore
const IDS = ['3PI','AMO','BEL','BSL','BSM','CHA','CKA','CORA','COUN','CPG','DBR','EGY','FOS','FRG','GDS','HSI','KAW','LDD','LPS','MAL','MAN','MCA','MDF','MPA','MSO','NANC','PAP','PAR','PAUL','PTI','REG','RNNMAT','RNNNOU','RNNTRI','SAU','SGK','SMA','SPA','STE','STJ','ZDUARBAL','ZDUARMAT','ZDUGABAL','ZDUGAKOU','ZDUPAFAV','ZDUPAMAC'] as const

export const Forets = {
  '3PI': { id: '3PI', nom: '3 Pitons' },
  ZDUARBAL: { id: 'ZDUARBAL', nom: 'Arawack de Balate' },
  ZDUARMAT: { id: 'ZDUARMAT', nom: 'Arawack de Matoury' },
  BSL: { id: 'BSL', nom: 'Balata - Saut Leodate' },
  BSM: { id: 'BSM', nom: 'Basse Mana' },
  BEL: { id: 'BEL', nom: 'Belizon' },
  CHA: { id: 'CHA', nom: 'Charvein' },
  CORA: { id: 'CORA', nom: 'Coralie' },
  COUN: { id: 'COUN', nom: 'Counamama' },
  CKA: { id: 'CKA', nom: 'Crique Kalaweli' },
  CPG: { id: 'CPG', nom: 'Crique Petit Galibi' },
  DBR: { id: 'DBR', nom: 'Deux Branches' },
  EGY: { id: 'EGY', nom: 'Egyptienne' },
  ZDUGABAL: { id: 'ZDUGABAL', nom: 'Galibi de Balate' },
  ZDUGAKOU: { id: 'ZDUGAKOU', nom: 'Galibi de Kourou' },
  GDS: { id: 'GDS', nom: 'Grand Santi' },
  KAW: { id: 'KAW', nom: 'Kaw' },
  LPS: { id: 'LPS', nom: 'Lac de Petit Saut' },
  LDD: { id: 'LDD', nom: 'Lucifer Dekou Dekou' },
  MAL: { id: 'MAL', nom: 'Malgaches' },
  MAN: { id: 'MAN', nom: 'Mana' },
  MPA: { id: 'MPA', nom: 'Maripasoula' },
  PAR: { id: 'PAR', nom: 'Mont Paramana' },
  MCA: { id: 'MCA', nom: 'Montagne Cacao' },
  MDF: { id: 'MDF', nom: 'Montagne de Fer' },
  MSO: { id: 'MSO', nom: 'Montagne Soufflet' },
  NANC: { id: 'NANC', nom: 'Nancibo' },
  ZDUPAFAV: { id: 'ZDUPAFAV', nom: 'Palikur de Favard' },
  ZDUPAMAC: { id: 'ZDUPAMAC', nom: 'Palikur de Macouria' },
  PAP: { id: 'PAP', nom: 'Papaichton' },
  PAUL: { id: 'PAUL', nom: 'Paul Isnard' },
  AMO: { id: 'AMO', nom: 'Pitons Armontabo' },
  PTI: { id: 'PTI', nom: 'Placers Tibourou' },
  FRG: { id: 'FRG', nom: 'Regina' },
  REG: { id: 'REG', nom: 'Regina St-Georges' },
  RNNMAT: { id: 'RNNMAT', nom: 'RNN Grand Matoury' },
  RNNNOU: { id: 'RNNNOU', nom: 'RNN Nouragues' },
  RNNTRI: { id: 'RNNTRI', nom: 'RNN Trinite' },
  SAU: { id: 'SAU', nom: 'Saul' },
  SGK: { id: 'SGK', nom: 'Saut Grand Kanori' },
  SPA: { id: 'SPA', nom: 'Sparouine' },
  STE: { id: 'STE', nom: 'Saint-Elie' },
  STJ: { id: 'STJ', nom: 'St Jean' },
  SMA: { id: 'SMA', nom: 'St Maurice' },
  FOS: { id: 'FOS', nom: 'Crique Fossée' },
  HSI: { id: 'HSI', nom: 'Haut Sinnamary' },
} as const satisfies Record<ForetId, { id: ForetId; nom: string }>

export const foretIdValidator = z.enum(IDS)
export type ForetId = z.infer<typeof foretIdValidator>

export const ForetIds = IDS
