import { getKeys, PartialRecord } from '../typescript-tools'
import { AdministrationId, isAdministrationId } from './administrations'
import { isTitreType, TitreTypeId } from './titresTypes'

type AdministrationTitreType = PartialRecord<
  TitreTypeId,
  {
    gestionnaire: boolean
    associee: boolean
  }
>

const AdministrationsTitresTypes: { [key in AdministrationId]?: AdministrationTitreType } = {
  'aut-97300-01': {
    arm: { gestionnaire: false, associee: true }
  },
  'aut-mrae-guyane-01': {
    arm: { gestionnaire: false, associee: true }
  },
  'dea-guyane-01': {
    arm: { gestionnaire: false, associee: true },
    axm: { gestionnaire: true, associee: false }
  },
  'dre-aura-01': {
    cxm: { gestionnaire: false, associee: false },
    prm: { gestionnaire: false, associee: false }
  },
  'dre-bfc-01': {
    cxm: { gestionnaire: false, associee: false },
    prm: { gestionnaire: false, associee: false }
  },
  'dre-ile-de-france-01': {
    pcc: { gestionnaire: true, associee: false }
  },
  'dre-nouvelle-aquitaine-01': {
    pxg: { gestionnaire: true, associee: false }
  },
  'min-dajb-01': {
    apc: { gestionnaire: false, associee: true },
    aph: { gestionnaire: false, associee: true },
    apm: { gestionnaire: false, associee: true },
    apw: { gestionnaire: false, associee: true },
    arc: { gestionnaire: false, associee: true },
    arg: { gestionnaire: false, associee: true },
    arm: { gestionnaire: false, associee: true },
    axm: { gestionnaire: false, associee: true },
    cxf: { gestionnaire: false, associee: true },
    cxg: { gestionnaire: false, associee: true },
    cxh: { gestionnaire: false, associee: true },
    cxi: { gestionnaire: false, associee: true },
    cxm: { gestionnaire: false, associee: true },
    cxr: { gestionnaire: false, associee: true },
    cxs: { gestionnaire: false, associee: true },
    cxw: { gestionnaire: false, associee: true },
    inh: { gestionnaire: false, associee: true },
    ini: { gestionnaire: false, associee: true },
    inm: { gestionnaire: false, associee: true },
    inr: { gestionnaire: false, associee: true },
    pcc: { gestionnaire: false, associee: true },
    prf: { gestionnaire: false, associee: true },
    prg: { gestionnaire: false, associee: true },
    prh: { gestionnaire: false, associee: true },
    pri: { gestionnaire: false, associee: true },
    prm: { gestionnaire: false, associee: true },
    prr: { gestionnaire: false, associee: true },
    prs: { gestionnaire: false, associee: true },
    prw: { gestionnaire: false, associee: true },
    pxf: { gestionnaire: false, associee: true },
    pxg: { gestionnaire: false, associee: true },
    pxh: { gestionnaire: false, associee: true },
    pxi: { gestionnaire: false, associee: true },
    pxm: { gestionnaire: false, associee: true },
    pxr: { gestionnaire: false, associee: true },
    pxw: { gestionnaire: false, associee: true }
  },
  'min-mctrct-dgcl-01': {
    apm: { gestionnaire: false, associee: true },
    apw: { gestionnaire: false, associee: true },
    arm: { gestionnaire: false, associee: true },
    axm: { gestionnaire: false, associee: true },
    cxm: { gestionnaire: false, associee: true },
    cxw: { gestionnaire: false, associee: true },
    inm: { gestionnaire: false, associee: true },
    prm: { gestionnaire: false, associee: true },
    prw: { gestionnaire: false, associee: true },
    pxm: { gestionnaire: false, associee: true },
    pxw: { gestionnaire: false, associee: true }
  },
  'min-mtes-dgaln-01': {
    apc: { gestionnaire: true, associee: false },
    aph: { gestionnaire: false, associee: true },
    apm: { gestionnaire: true, associee: false },
    apw: { gestionnaire: true, associee: false },
    arc: { gestionnaire: true, associee: false },
    arg: { gestionnaire: false, associee: true },
    arm: { gestionnaire: true, associee: true },
    axm: { gestionnaire: true, associee: true },
    cxf: { gestionnaire: false, associee: true },
    cxg: { gestionnaire: false, associee: true },
    cxh: { gestionnaire: false, associee: true },
    cxi: { gestionnaire: true, associee: false },
    cxm: { gestionnaire: true, associee: false },
    cxr: { gestionnaire: false, associee: true },
    cxs: { gestionnaire: false, associee: true },
    cxw: { gestionnaire: true, associee: false },
    inh: { gestionnaire: false, associee: true },
    ini: { gestionnaire: true, associee: false },
    inm: { gestionnaire: true, associee: false },
    inr: { gestionnaire: false, associee: true },
    pcc: { gestionnaire: true, associee: false },
    prf: { gestionnaire: false, associee: true },
    prg: { gestionnaire: false, associee: true },
    prh: { gestionnaire: false, associee: true },
    pri: { gestionnaire: true, associee: false },
    prm: { gestionnaire: true, associee: false },
    prr: { gestionnaire: false, associee: true },
    prs: { gestionnaire: false, associee: true },
    prw: { gestionnaire: true, associee: false },
    pxf: { gestionnaire: false, associee: true },
    pxg: { gestionnaire: false, associee: true },
    pxh: { gestionnaire: false, associee: true },
    pxi: { gestionnaire: true, associee: false },
    pxm: { gestionnaire: true, associee: false },
    pxr: { gestionnaire: false, associee: true },
    pxw: { gestionnaire: true, associee: false }
  },
  'min-mtes-dgec-01': {
    apc: { gestionnaire: false, associee: true },
    aph: { gestionnaire: true, associee: false },
    apm: { gestionnaire: false, associee: true },
    apw: { gestionnaire: false, associee: true },
    arc: { gestionnaire: false, associee: true },
    arg: { gestionnaire: true, associee: false },
    arm: { gestionnaire: false, associee: true },
    axm: { gestionnaire: false, associee: true },
    cxf: { gestionnaire: true, associee: false },
    cxg: { gestionnaire: true, associee: false },
    cxh: { gestionnaire: true, associee: false },
    cxi: { gestionnaire: false, associee: true },
    cxm: { gestionnaire: false, associee: true },
    cxr: { gestionnaire: false, associee: true },
    cxs: { gestionnaire: true, associee: false },
    cxw: { gestionnaire: false, associee: true },
    inh: { gestionnaire: true, associee: false },
    ini: { gestionnaire: false, associee: true },
    inm: { gestionnaire: false, associee: true },
    inr: { gestionnaire: false, associee: true },
    pcc: { gestionnaire: false, associee: true },
    prf: { gestionnaire: true, associee: false },
    prg: { gestionnaire: true, associee: false },
    prh: { gestionnaire: true, associee: false },
    pri: { gestionnaire: false, associee: true },
    prm: { gestionnaire: false, associee: true },
    prr: { gestionnaire: false, associee: true },
    prs: { gestionnaire: true, associee: false },
    prw: { gestionnaire: false, associee: true },
    pxf: { gestionnaire: true, associee: false },
    pxg: { gestionnaire: true, associee: false },
    pxh: { gestionnaire: true, associee: false },
    pxi: { gestionnaire: false, associee: true },
    pxm: { gestionnaire: false, associee: true },
    pxr: { gestionnaire: false, associee: true },
    pxw: { gestionnaire: false, associee: true }
  },
  'min-mtes-dgpr-01': {
    apc: { gestionnaire: false, associee: true },
    aph: { gestionnaire: false, associee: true },
    apm: { gestionnaire: false, associee: true },
    apw: { gestionnaire: false, associee: true },
    arc: { gestionnaire: false, associee: true },
    arg: { gestionnaire: false, associee: true },
    arm: { gestionnaire: false, associee: true },
    axm: { gestionnaire: false, associee: true },
    cxf: { gestionnaire: false, associee: true },
    cxg: { gestionnaire: false, associee: true },
    cxh: { gestionnaire: false, associee: true },
    cxi: { gestionnaire: false, associee: true },
    cxm: { gestionnaire: false, associee: true },
    cxr: { gestionnaire: true, associee: false },
    cxs: { gestionnaire: false, associee: true },
    cxw: { gestionnaire: false, associee: true },
    inh: { gestionnaire: false, associee: true },
    ini: { gestionnaire: false, associee: true },
    inm: { gestionnaire: false, associee: true },
    inr: { gestionnaire: true, associee: false },
    pcc: { gestionnaire: false, associee: true },
    prf: { gestionnaire: false, associee: true },
    prg: { gestionnaire: false, associee: true },
    prh: { gestionnaire: false, associee: true },
    pri: { gestionnaire: false, associee: true },
    prm: { gestionnaire: false, associee: true },
    prr: { gestionnaire: true, associee: false },
    prs: { gestionnaire: false, associee: true },
    prw: { gestionnaire: false, associee: true },
    pxf: { gestionnaire: false, associee: true },
    pxg: { gestionnaire: false, associee: true },
    pxh: { gestionnaire: false, associee: true },
    pxi: { gestionnaire: false, associee: true },
    pxm: { gestionnaire: false, associee: true },
    pxr: { gestionnaire: true, associee: false },
    pxw: { gestionnaire: false, associee: true }
  },
  'ope-brgm-01': {
    pcc: { gestionnaire: false, associee: true }
  },
  'ope-brgm-02': {
    axm: { gestionnaire: false, associee: true }
  },
  'ope-onf-973-01': {
    arm: { gestionnaire: true, associee: false },
    axm: { gestionnaire: true, associee: false }
  },
  'ope-ptmg-973-01': {
    arm: { gestionnaire: true, associee: true }
  },
  'pre-97302-01': {
    arm: { gestionnaire: false, associee: true }
  }
}

export const getTitreTypeIdsByAdministration = (administrationId: AdministrationId): { titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[] => {
  const administrationTitresTypes = AdministrationsTitresTypes[administrationId]

  if (!administrationTitresTypes) {
    return []
  }

  return getKeys(administrationTitresTypes, isTitreType).reduce<{ titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[]>((acc, titreTypeId) => {
    acc.push({ titreTypeId, gestionnaire: administrationTitresTypes[titreTypeId]?.gestionnaire ?? false, associee: administrationTitresTypes[titreTypeId]?.associee ?? false })

    return acc
  }, [])
}

export const isGestionnaire = (administrationId: AdministrationId, titreTypeId?: TitreTypeId): boolean => isGestionnaireOrAssociee(administrationId, 'gestionnaire', titreTypeId)
export const isAssociee = (administrationId: AdministrationId, titreTypeId?: TitreTypeId): boolean => isGestionnaireOrAssociee(administrationId, 'associee', titreTypeId)

const isGestionnaireOrAssociee = (administrationId: AdministrationId, props: 'gestionnaire' | 'associee', titreTypeId?: TitreTypeId): boolean => {
  const administrationTitresTypes = getTitreTypeIdsByAdministration(administrationId)

  if (!administrationTitresTypes.length) {
    return false
  }

  if (!titreTypeId) {
    return administrationTitresTypes.some(att => att[props])
  }

  return administrationTitresTypes.some(att => att.titreTypeId === titreTypeId && att[props])
}

export const getGestionnairesByTitreTypeId = (titreTypeId: TitreTypeId): { administrationId: AdministrationId; associee: boolean }[] => {
  return getKeys(AdministrationsTitresTypes, isAdministrationId).reduce<{ administrationId: AdministrationId; associee: boolean }[]>((acc, administrationId) => {
    const titreType = getTitreTypeIdsByAdministration(administrationId).find(titreType => titreType.titreTypeId === titreTypeId && titreType.gestionnaire)
    if (titreType) {
      acc.push({ associee: titreType.associee, administrationId })
    }

    return acc
  }, [])
}
