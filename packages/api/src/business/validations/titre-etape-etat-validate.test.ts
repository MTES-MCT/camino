import { ITitreEtape } from '../../types.js'

import { etapesSuivantesEnAttenteGet, titreEtapeTypeIdRestrictionsFind } from './titre-etape-etat-validate.js'
import { etatInformationsGet } from '../rules-demarches/etat-cycles.js'
import { describe, test, expect } from 'vitest'
describe('teste etapesSuivantesEnAttenteGet', () => {
  test('retourne les 2 dernières étapes des chemins parallèles', () => {
    const etapes = [{ typeId: 'mfr' }, { typeId: 'mdp' }] as ITitreEtape[]
    const etapesEnAttente = etapesSuivantesEnAttenteGet(etapes, etapes, [], {
      mfr: { justeApres: [] },
      mdp: { justeApres: [] },
      mno: {
        justeApres: [[{ etapeTypeId: 'mfr' }, { etapeTypeId: 'mdp' }]],
      },
    })
    expect(etapesEnAttente).toHaveLength(2)
    expect(etapesEnAttente[0]).toEqual({ typeId: 'mfr' })
    expect(etapesEnAttente[1]).toEqual({ typeId: 'mdp' })
  })

  test('retourne la dernière étape après la fusion de 2 chemins parallèles', () => {
    const etapes = [{ typeId: 'mfr' }, { typeId: 'mcp' }, { typeId: 'mno' }] as ITitreEtape[]
    const etapesEnAttente = etapesSuivantesEnAttenteGet(etapes, etapes, [], {
      mfr: { justeApres: [] },
      mcp: { justeApres: [] },
      mno: {
        justeApres: [[{ etapeTypeId: 'mfr' }, { etapeTypeId: 'mcp' }]],
      },
    })
    expect(etapesEnAttente).toHaveLength(1)
    expect(etapesEnAttente[0]).toEqual({ typeId: 'mno' })
  })
  test('retourne l’étape sur le premier chemin et l’étape sur le chemin commun', () => {
    const etapes = [{ typeId: 'ide' }, { typeId: 'mno' }] as ITitreEtape[]
    const etapesEnAttente = etapesSuivantesEnAttenteGet(etapes, etapes, [], {
      ide: { separation: ['css'], justeApres: [] },
      mno: {
        justeApres: [[{ etapeTypeId: 'ide' }]],
      },
      mfr: {
        justeApres: [[{ etapeTypeId: 'ide' }]],
      },
      css: {
        justeApres: [[{ etapeTypeId: 'mno' }, { etapeTypeId: 'mfr' }]],
      },
    })
    expect(etapesEnAttente).toHaveLength(2)
    expect(etapesEnAttente[0]).toEqual({ typeId: 'ide' })
    expect(etapesEnAttente[1]).toEqual({ typeId: 'mno' })
  })
  test('retourne l’étape sur la dernière étape sur le chemin commun', () => {
    const etapes = [{ typeId: 'ide' }, { typeId: 'mno' }, { typeId: 'mfr' }, { typeId: 'css' }] as ITitreEtape[]
    const etapesEnAttente = etapesSuivantesEnAttenteGet(etapes, etapes, [], {
      ide: { separation: ['css'], justeApres: [] },
      mno: {
        justeApres: [[{ etapeTypeId: 'ide' }]],
      },
      mfr: {
        justeApres: [[{ etapeTypeId: 'ide' }]],
      },
      css: {
        justeApres: [[{ etapeTypeId: 'mno' }, { etapeTypeId: 'mfr' }]],
      },
    })
    expect(etapesEnAttente).toHaveLength(1)
    expect(etapesEnAttente[0]).toEqual({ typeId: 'css' })
  })
  test('retourne seulement l’étape "rif" dés qu’une demande d’info a commencé', () => {
    const etapes = [{ typeId: 'vfd' }, { typeId: 'mif-mcr' }] as ITitreEtape[]
    const etapesEnAttente = etapesSuivantesEnAttenteGet(etapes, etapes, [], {
      vfd: { justeApres: [] },
      ...etatInformationsGet('mif-mcr', 'rif-mcr', {
        etapeTypeId: 'mcr',
        separation: ['eof'],
        justeApres: [[{ etapeTypeId: 'vfd' }]],
      }),
    })
    expect(etapesEnAttente).toHaveLength(1)
    expect(etapesEnAttente[0]).toEqual({ typeId: 'mif-mcr' })
  })

  test('retourne la dernière étape sur le chemin commun à la fin du démarche', () => {
    const etapes = [{ typeId: 'dex' }, { typeId: 'mno' }] as ITitreEtape[]
    const etapesEnAttente = etapesSuivantesEnAttenteGet(etapes, etapes, [], {
      dex: { justeApres: [], separation: [] },
      mno: {
        justeApres: [[{ etapeTypeId: 'dex' }]],
      },
      mfr: {
        justeApres: [[{ etapeTypeId: 'dex' }]],
      },
      mcp: {
        justeApres: [[{ etapeTypeId: 'dex' }]],
      },
    })
    expect(etapesEnAttente).toHaveLength(2)
    expect(etapesEnAttente[0]).toEqual({ typeId: 'dex' })
  })
})

describe('teste titreEtapeTypeIdRestrictionsFind', () => {
  test('émet une erreur si l’étape est inconnue', () => {
    // @ts-ignore
    expect(() => titreEtapeTypeIdRestrictionsFind({ dex: { justeApres: [], separation: [] } }, 'aaa')).toThrowError()
  })
})
