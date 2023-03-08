import type { ITitre, ITitreEtape, ITitreDemarche } from '../../types.js'
import { titreDemarcheDepotCheck } from './titres-demarches-depot-create.js'

import { describe, expect, test } from 'vitest'

describe('créer le dépot de la démarche', () => {
  test.each<[string, ITitreEtape[], boolean]>([
    ['crée un dépot d’une ARM avec une demande faite', [{ date: '2021-01-01', typeId: 'mfr', statutId: 'fai' }] as ITitreEtape[], true],
    ['ne crée pas un dépot d’une ARM si sa demande est en construction', [{ date: '2021-01-01', typeId: 'mfr', statutId: 'enc' }] as ITitreEtape[], false],
    ['ne crée pas un dépot d’une ARM si sa demande est historique', [{ date: '2018-01-01', typeId: 'mfr', statutId: 'fai' }] as ITitreEtape[], false],
    [
      'ne crée pas un dépot d’une ARM si déjà déposée',
      [
        { date: '2021-01-01', typeId: 'mfr', statutId: 'fai' },
        { date: '2021-01-02', typeId: 'mdp', statutId: 'fai' },
      ] as ITitreEtape[],
      false,
    ],
  ])('%s', (test, etapes, creation) => {
    const titresDemarchesDepotCreated = titreDemarcheDepotCheck({
      titre: { typeId: 'arm' } as ITitre,
      typeId: 'oct',
      etapes,
    } as ITitreDemarche)
    expect(titresDemarchesDepotCreated).toEqual(creation)
  })
})
