// https://cacoo.com/diagrams/mdAnl7m9V2ViBlxA/C4063

import { IDemarcheDefinitionRestrictions } from '../definitions'

const etatsDefinitionPrmOct: IDemarcheDefinitionRestrictions = {
  mfr: {
    justeApres: [[]]
  },
  mdp: {
    justeApres: [[{ etapeTypeId: 'mfr' }]]
  },
  nis: {
    apres: [[{ etapeTypeId: 'mdp' }]],
    justeApres: [],
    final: false
  },
  mod: {
    justeApres: [[]],
    apres: [[{ etapeTypeId: 'mdp' }]],
    avant: [[{ etapeTypeId: 'dex' }]],
    final: false
  },
  mif: {
    justeApres: [[]],
    apres: [[{ etapeTypeId: 'mdp' }]],
    avant: [[{ etapeTypeId: 'dex' }]],
    final: false
  },
  rif: {
    justeApres: [[{ etapeTypeId: 'mif' }]],
    avant: [[{ etapeTypeId: 'sas' }]],
    final: false
  },
  spp: {
    justeApres: [[{ etapeTypeId: 'mdp' }]]
  },
  mcr: {
    separation: ['scg'],
    justeApres: [[{ etapeTypeId: 'spp' }], [{ etapeTypeId: 'rco' }]]
  },
  mco: {
    justeApres: [
      [{ etapeTypeId: 'mcr', statutId: 'def' }],
      [{ etapeTypeId: 'rco' }]
    ]
  },
  rco: { justeApres: [[{ etapeTypeId: 'mco' }]] },
  anf: {
    justeApres: [[{ etapeTypeId: 'mcr', statutId: 'fav' }]]
  },
  mec: {
    justeApres: [[{ etapeTypeId: 'anf' }]]
  },
  scl: {
    separation: ['apo', 'spo'],
    avant: [[{ etapeTypeId: 'scl' }]],
    justeApres: [
      [{ etapeTypeId: 'mcr', statutId: 'fav' }],
      [{ etapeTypeId: 'anf' }],
      [{ etapeTypeId: 'mec' }]
    ]
  },
  ama: {
    justeApres: [[{ etapeTypeId: 'scl' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  aep: {
    justeApres: [[{ etapeTypeId: 'scl' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  acl: {
    justeApres: [[{ etapeTypeId: 'scl' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  ssr: {
    separation: ['apo', 'spo'],
    avant: [[{ etapeTypeId: 'ssr' }]],
    justeApres: [
      [{ etapeTypeId: 'mcr', statutId: 'fav' }],
      [{ etapeTypeId: 'anf' }],
      [{ etapeTypeId: 'mec' }]
    ]
  },
  apl: {
    justeApres: [[{ etapeTypeId: 'ssr' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  apm: {
    justeApres: [[{ etapeTypeId: 'ssr' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  pnr: {
    justeApres: [[{ etapeTypeId: 'ssr' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  apn: {
    justeApres: [[{ etapeTypeId: 'ssr' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  aof: {
    justeApres: [[{ etapeTypeId: 'ssr' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  aop: {
    justeApres: [[{ etapeTypeId: 'ssr' }]],
    avant: [[{ etapeTypeId: 'apo' }], [{ etapeTypeId: 'spo' }]]
  },
  spo: {
    justeApres: [],
    avant: [[{ etapeTypeId: 'spo' }], [{ etapeTypeId: 'apo' }]],
    apres: [[{ etapeTypeId: 'scl' }, { etapeTypeId: 'ssr' }]]
  },
  apo: {
    justeApres: [],
    avant: [[{ etapeTypeId: 'apo' }]],
    apres: [[{ etapeTypeId: 'scl' }, { etapeTypeId: 'ssr' }]]
  },
  apd: { justeApres: [[{ etapeTypeId: 'apo' }]] },
  app: { justeApres: [[{ etapeTypeId: 'apd' }]] },
  ppu: {
    justeApres: [
      [{ etapeTypeId: 'mcr', statutId: 'fav' }],
      [{ etapeTypeId: 'anf' }],
      [{ etapeTypeId: 'mec' }]
    ],
    avant: [[{ etapeTypeId: 'ppu' }]]
  },
  ppc: { justeApres: [[{ etapeTypeId: 'ppu' }]] },
  scg: {
    justeApres: [[{ etapeTypeId: 'app' }, { etapeTypeId: 'ppc' }]]
  },
  rcg: {
    justeApres: [[{ etapeTypeId: 'scg' }]]
  },
  acg: { justeApres: [[{ etapeTypeId: 'rcg' }]] },
  sas: { justeApres: [[{ etapeTypeId: 'acg' }]] },
  dex: { justeApres: [[{ etapeTypeId: 'sas' }]] },
  dpu: {
    justeApres: [
      [{ etapeTypeId: 'dex', statutId: 'acc' }],
      [{ etapeTypeId: 'abd' }],
      [{ etapeTypeId: 'rtd' }]
    ]
  },
  npp: {
    justeApres: [
      [{ etapeTypeId: 'dex', statutId: 'rej' }],
      [{ etapeTypeId: 'dpu', statutId: 'acc' }]
    ],
    avant: [[{ etapeTypeId: 'abd' }], [{ etapeTypeId: 'rtd' }]]
  },
  mno: {
    apres: [[{ etapeTypeId: 'npp' }]],
    avant: [[{ etapeTypeId: 'mno' }]],
    justeApres: []
  },
  rpu: {
    apres: [[{ etapeTypeId: 'dex', statutId: 'acc' }, { etapeTypeId: 'npp' }]],
    avant: [[{ etapeTypeId: 'rpu' }]],
    justeApres: []
  },
  ncl: {
    apres: [[{ etapeTypeId: 'dex', statutId: 'acc' }, { etapeTypeId: 'npp' }]],
    avant: [[{ etapeTypeId: 'ncl' }]],
    justeApres: []
  },
  pqr: {
    apres: [[{ etapeTypeId: 'dex', statutId: 'acc' }, { etapeTypeId: 'npp' }]],
    avant: [[{ etapeTypeId: 'pqr' }]],
    justeApres: []
  },
  dim: {
    justeApres: [[{ etapeTypeId: 'mdp' }]],
    avant: [[{ etapeTypeId: 'dex' }]]
  },
  and: {
    justeApres: [[{ etapeTypeId: 'dim' }], [{ etapeTypeId: 'dex' }]],
    final: true
  },
  abd: {
    justeApres: [[{ etapeTypeId: 'dex' }]],
    avant: [[{ etapeTypeId: 'and' }], [{ etapeTypeId: 'rtd' }]]
  },
  rtd: {
    justeApres: [[{ etapeTypeId: 'dex' }]],
    avant: [[{ etapeTypeId: 'and' }], [{ etapeTypeId: 'abd' }]]
  },
  des: {
    justeApres: [[]],
    avant: [
      [{ etapeTypeId: 'dex' }],
      [{ etapeTypeId: 'css' }],
      [{ etapeTypeId: 'dim' }]
    ],
    final: true,
    apres: [[{ etapeTypeId: 'mdp' }]]
  },
  css: {
    justeApres: [[]],
    avant: [
      [{ etapeTypeId: 'dex' }],
      [{ etapeTypeId: 'des' }],
      [{ etapeTypeId: 'dim' }]
    ],
    final: true,
    apres: [[{ etapeTypeId: 'mdp' }]]
  },
  edm: {
    justeApres: [[]],
    avant: [[{ etapeTypeId: 'mfr' }]],
    apres: [[{ etapeTypeId: 'mfr' }]]
  }
}

export { etatsDefinitionPrmOct }
