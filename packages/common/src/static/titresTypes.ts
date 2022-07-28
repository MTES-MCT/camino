import { DomaineId } from './domaines'
import { TitreTypeTypeId } from './titresTypesTypes'

interface Definition<T> {
  id: T
  domaineId: DomaineId
  typeId: TitreTypeTypeId
}

// prettier-ignore
export const TitresTypesIds = [ 'apc', 'aph', 'apm', 'apw', 'arc', 'arg', 'arm', 'axm', 'cxf', 'cxg', 'cxh', 'cxi', 'cxm', 'cxr', 'cxs', 'cxw', 'inh', 'ini', 'inm', 'inr', 'pcc', 'prf', 'prg', 'prh', 'pri', 'prm', 'prr', 'prs', 'prw', 'pxf', 'pxg', 'pxh', 'pxi', 'pxm', 'pxr', 'pxw' ] as const

export type TitreTypeId = typeof TitresTypesIds[number]

export const TitresTypes: {
  [key in TitreTypeId]: Definition<key>
} = {
  apc: { id: 'apc', domaineId: 'c', typeId: 'ap' },
  aph: { id: 'aph', domaineId: 'h', typeId: 'ap' },
  apm: { id: 'apm', domaineId: 'm', typeId: 'ap' },
  apw: { id: 'apw', domaineId: 'w', typeId: 'ap' },
  arc: { id: 'arc', domaineId: 'c', typeId: 'ar' },
  arg: { id: 'arg', domaineId: 'g', typeId: 'ar' },
  arm: { id: 'arm', domaineId: 'm', typeId: 'ar' },
  axm: { id: 'axm', domaineId: 'm', typeId: 'ax' },
  cxf: { id: 'cxf', domaineId: 'f', typeId: 'cx' },
  cxg: { id: 'cxg', domaineId: 'g', typeId: 'cx' },
  cxh: { id: 'cxh', domaineId: 'h', typeId: 'cx' },
  cxi: { id: 'cxi', domaineId: 'i', typeId: 'cx' },
  cxm: { id: 'cxm', domaineId: 'm', typeId: 'cx' },
  cxr: { id: 'cxr', domaineId: 'r', typeId: 'cx' },
  cxs: { id: 'cxs', domaineId: 's', typeId: 'cx' },
  cxw: { id: 'cxw', domaineId: 'w', typeId: 'cx' },
  inh: { id: 'inh', domaineId: 'h', typeId: 'in' },
  ini: { id: 'ini', domaineId: 'i', typeId: 'in' },
  inm: { id: 'inm', domaineId: 'm', typeId: 'in' },
  inr: { id: 'inr', domaineId: 'r', typeId: 'in' },
  pcc: { id: 'pcc', domaineId: 'c', typeId: 'pc' },
  prf: { id: 'prf', domaineId: 'f', typeId: 'pr' },
  prg: { id: 'prg', domaineId: 'g', typeId: 'pr' },
  prh: { id: 'prh', domaineId: 'h', typeId: 'pr' },
  pri: { id: 'pri', domaineId: 'i', typeId: 'pr' },
  prm: { id: 'prm', domaineId: 'm', typeId: 'pr' },
  prr: { id: 'prr', domaineId: 'r', typeId: 'pr' },
  prs: { id: 'prs', domaineId: 's', typeId: 'pr' },
  prw: { id: 'prw', domaineId: 'w', typeId: 'pr' },
  pxf: { id: 'pxf', domaineId: 'f', typeId: 'px' },
  pxg: { id: 'pxg', domaineId: 'g', typeId: 'px' },
  pxh: { id: 'pxh', domaineId: 'h', typeId: 'px' },
  pxi: { id: 'pxi', domaineId: 'i', typeId: 'px' },
  pxm: { id: 'pxm', domaineId: 'm', typeId: 'px' },
  pxr: { id: 'pxr', domaineId: 'r', typeId: 'px' },
  pxw: { id: 'pxw', domaineId: 'w', typeId: 'px' }
} as const

export const isTitreType = (titreType: string | undefined | null): titreType is TitreTypeId => TitresTypesIds.includes(titreType)
