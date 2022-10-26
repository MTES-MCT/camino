import { getKeys, PartialRecord } from '../typescript-tools'
import { AdministrationId, isAdministrationId } from './administrations'
import { isTitreType, TitreTypeId } from './titresTypes'

type AdministrationTitreType = PartialRecord<
  TitreTypeId,
  {
    type: 'gestionnaire' | 'locale'
    associee: boolean
  }
>

const AdministrationsTitresTypes: { [key in AdministrationId]?: AdministrationTitreType } = {
  'aut-97300-01': {
    arm: { type: 'locale', associee: true }
  },
  'aut-mrae-guyane-01': {
    arm: { type: 'locale', associee: true }
  },
  'dea-guyane-01': {
    arm: { type: 'locale', associee: true },
    axm: { type: 'gestionnaire', associee: false }
  },
  'dre-aura-01': {
    cxm: { type: 'locale', associee: false },
    prm: { type: 'locale', associee: false }
  },
  'dre-bfc-01': {
    cxm: { type: 'locale', associee: false },
    prm: { type: 'locale', associee: false }
  },
  'dre-ile-de-france-01': {
    pcc: { type: 'gestionnaire', associee: false }
  },
  'dre-nouvelle-aquitaine-01': {
    pxg: { type: 'gestionnaire', associee: false }
  },
  'min-dajb-01': {
    apc: { type: 'locale', associee: true },
    aph: { type: 'locale', associee: true },
    apm: { type: 'locale', associee: true },
    apw: { type: 'locale', associee: true },
    arc: { type: 'locale', associee: true },
    arg: { type: 'locale', associee: true },
    arm: { type: 'locale', associee: true },
    axm: { type: 'locale', associee: true },
    cxf: { type: 'locale', associee: true },
    cxg: { type: 'locale', associee: true },
    cxh: { type: 'locale', associee: true },
    cxi: { type: 'locale', associee: true },
    cxm: { type: 'locale', associee: true },
    cxr: { type: 'locale', associee: true },
    cxs: { type: 'locale', associee: true },
    cxw: { type: 'locale', associee: true },
    inh: { type: 'locale', associee: true },
    ini: { type: 'locale', associee: true },
    inm: { type: 'locale', associee: true },
    inr: { type: 'locale', associee: true },
    pcc: { type: 'locale', associee: true },
    prf: { type: 'locale', associee: true },
    prg: { type: 'locale', associee: true },
    prh: { type: 'locale', associee: true },
    pri: { type: 'locale', associee: true },
    prm: { type: 'locale', associee: true },
    prr: { type: 'locale', associee: true },
    prs: { type: 'locale', associee: true },
    prw: { type: 'locale', associee: true },
    pxf: { type: 'locale', associee: true },
    pxg: { type: 'locale', associee: true },
    pxh: { type: 'locale', associee: true },
    pxi: { type: 'locale', associee: true },
    pxm: { type: 'locale', associee: true },
    pxr: { type: 'locale', associee: true },
    pxw: { type: 'locale', associee: true }
  },
  'min-mctrct-dgcl-01': {
    apm: { type: 'locale', associee: true },
    apw: { type: 'locale', associee: true },
    arm: { type: 'locale', associee: true },
    axm: { type: 'locale', associee: true },
    cxm: { type: 'locale', associee: true },
    cxw: { type: 'locale', associee: true },
    inm: { type: 'locale', associee: true },
    prm: { type: 'locale', associee: true },
    prw: { type: 'locale', associee: true },
    pxm: { type: 'locale', associee: true },
    pxw: { type: 'locale', associee: true }
  },
  'min-mtes-dgaln-01': {
    apc: { type: 'gestionnaire', associee: false },
    aph: { type: 'locale', associee: true },
    apm: { type: 'gestionnaire', associee: false },
    apw: { type: 'gestionnaire', associee: false },
    arc: { type: 'gestionnaire', associee: false },
    arg: { type: 'locale', associee: true },
    arm: { type: 'gestionnaire', associee: true },
    axm: { type: 'gestionnaire', associee: true },
    cxf: { type: 'locale', associee: true },
    cxg: { type: 'locale', associee: true },
    cxh: { type: 'locale', associee: true },
    cxi: { type: 'gestionnaire', associee: false },
    cxm: { type: 'gestionnaire', associee: false },
    cxr: { type: 'locale', associee: true },
    cxs: { type: 'locale', associee: true },
    cxw: { type: 'gestionnaire', associee: false },
    inh: { type: 'locale', associee: true },
    ini: { type: 'gestionnaire', associee: false },
    inm: { type: 'gestionnaire', associee: false },
    inr: { type: 'locale', associee: true },
    pcc: { type: 'gestionnaire', associee: false },
    prf: { type: 'locale', associee: true },
    prg: { type: 'locale', associee: true },
    prh: { type: 'locale', associee: true },
    pri: { type: 'gestionnaire', associee: false },
    prm: { type: 'gestionnaire', associee: false },
    prr: { type: 'locale', associee: true },
    prs: { type: 'locale', associee: true },
    prw: { type: 'gestionnaire', associee: false },
    pxf: { type: 'locale', associee: true },
    pxg: { type: 'locale', associee: true },
    pxh: { type: 'locale', associee: true },
    pxi: { type: 'gestionnaire', associee: false },
    pxm: { type: 'gestionnaire', associee: false },
    pxr: { type: 'locale', associee: true },
    pxw: { type: 'gestionnaire', associee: false }
  },
  'min-mtes-dgec-01': {
    apc: { type: 'locale', associee: true },
    aph: { type: 'gestionnaire', associee: false },
    apm: { type: 'locale', associee: true },
    apw: { type: 'locale', associee: true },
    arc: { type: 'locale', associee: true },
    arg: { type: 'gestionnaire', associee: false },
    arm: { type: 'locale', associee: true },
    axm: { type: 'locale', associee: true },
    cxf: { type: 'gestionnaire', associee: false },
    cxg: { type: 'gestionnaire', associee: false },
    cxh: { type: 'gestionnaire', associee: false },
    cxi: { type: 'locale', associee: true },
    cxm: { type: 'locale', associee: true },
    cxr: { type: 'locale', associee: true },
    cxs: { type: 'gestionnaire', associee: false },
    cxw: { type: 'locale', associee: true },
    inh: { type: 'gestionnaire', associee: false },
    ini: { type: 'locale', associee: true },
    inm: { type: 'locale', associee: true },
    inr: { type: 'locale', associee: true },
    pcc: { type: 'locale', associee: true },
    prf: { type: 'gestionnaire', associee: false },
    prg: { type: 'gestionnaire', associee: false },
    prh: { type: 'gestionnaire', associee: false },
    pri: { type: 'locale', associee: true },
    prm: { type: 'locale', associee: true },
    prr: { type: 'locale', associee: true },
    prs: { type: 'gestionnaire', associee: false },
    prw: { type: 'locale', associee: true },
    pxf: { type: 'gestionnaire', associee: false },
    pxg: { type: 'gestionnaire', associee: false },
    pxh: { type: 'gestionnaire', associee: false },
    pxi: { type: 'locale', associee: true },
    pxm: { type: 'locale', associee: true },
    pxr: { type: 'locale', associee: true },
    pxw: { type: 'locale', associee: true }
  },
  'min-mtes-dgpr-01': {
    apc: { type: 'locale', associee: true },
    aph: { type: 'locale', associee: true },
    apm: { type: 'locale', associee: true },
    apw: { type: 'locale', associee: true },
    arc: { type: 'locale', associee: true },
    arg: { type: 'locale', associee: true },
    arm: { type: 'locale', associee: true },
    axm: { type: 'locale', associee: true },
    cxf: { type: 'locale', associee: true },
    cxg: { type: 'locale', associee: true },
    cxh: { type: 'locale', associee: true },
    cxi: { type: 'locale', associee: true },
    cxm: { type: 'locale', associee: true },
    cxr: { type: 'gestionnaire', associee: false },
    cxs: { type: 'locale', associee: true },
    cxw: { type: 'locale', associee: true },
    inh: { type: 'locale', associee: true },
    ini: { type: 'locale', associee: true },
    inm: { type: 'locale', associee: true },
    inr: { type: 'gestionnaire', associee: false },
    pcc: { type: 'locale', associee: true },
    prf: { type: 'locale', associee: true },
    prg: { type: 'locale', associee: true },
    prh: { type: 'locale', associee: true },
    pri: { type: 'locale', associee: true },
    prm: { type: 'locale', associee: true },
    prr: { type: 'gestionnaire', associee: false },
    prs: { type: 'locale', associee: true },
    prw: { type: 'locale', associee: true },
    pxf: { type: 'locale', associee: true },
    pxg: { type: 'locale', associee: true },
    pxh: { type: 'locale', associee: true },
    pxi: { type: 'locale', associee: true },
    pxm: { type: 'locale', associee: true },
    pxr: { type: 'gestionnaire', associee: false },
    pxw: { type: 'locale', associee: true }
  },
  'ope-brgm-01': {
    pcc: { type: 'locale', associee: true }
  },
  'ope-brgm-02': {
    axm: { type: 'locale', associee: true }
  },
  'ope-onf-973-01': {
    arm: { type: 'gestionnaire', associee: false },
    axm: { type: 'gestionnaire', associee: false }
  },
  'ope-ptmg-973-01': {
    arm: { type: 'gestionnaire', associee: true }
  },
  'pre-97302-01': {
    arm: { type: 'locale', associee: true }
  }
}

export const getTitreTypeIdsByAdministration = (administrationId: AdministrationId): { titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[] => {
  const administrationTitresTypes = AdministrationsTitresTypes[administrationId]

  if (!administrationTitresTypes) {
    return []
  }

  return getKeys(administrationTitresTypes, isTitreType).reduce<{ titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[]>((acc, titreTypeId) => {
    acc.push({ titreTypeId, gestionnaire: (administrationTitresTypes[titreTypeId]?.type ?? 'locale') === 'gestionnaire', associee: administrationTitresTypes[titreTypeId]?.associee ?? false })

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
