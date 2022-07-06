import { ActiviteTypeReduced, TitreReduced } from '../titre-activite-type-check'

const activiteTypeMAxmPxmGuyane: ActiviteTypeReduced = {
  titresTypes: [{ id: 'axm' }, { id: 'pxm' }],
  activitesTypesPays: [{ paysId: 'GF' }]
}

const activiteTypeMPrmMetropole: ActiviteTypeReduced = {
  titresTypes: [{ id: 'prm' }],
  activitesTypesPays: [{ paysId: 'FR' }]
}

const activiteTypeWPrwSansPays: ActiviteTypeReduced = {
  titresTypes: [{ id: 'prw' }],
  activitesTypesPays: []
}

const titreMAxmGuyane: TitreReduced = {
  typeId: 'axm',
  communes: [{ departementId: '973' }]
}

const titreMAxmMetropole: TitreReduced = {
  typeId: 'axm',
  communes: [{ departementId: '72' }]
}

const titreMPrmMetropole: TitreReduced = {
  typeId: 'prm',
  communes: [{ departementId: '72' }]
}

const titreSansPays: TitreReduced = {
  typeId: 'axm',
  communes: []
}

const titrePrwSansPays: TitreReduced = {
  typeId: 'prw',
  communes: []
}

export {
  activiteTypeMAxmPxmGuyane,
  activiteTypeMPrmMetropole,
  activiteTypeWPrwSansPays,
  titreSansPays,
  titreMAxmGuyane,
  titreMAxmMetropole,
  titreMPrmMetropole,
  titrePrwSansPays
}
