import { ETAPE_IS_NOT_BROUILLON, ETAPE_IS_BROUILLON } from 'camino-common/src/etape'
import type { ITitre, ITitreEtape, ITitreDemarche } from '../../types'
import { titreDemarcheDepotCheck } from './titres-demarches-depot-create'

import { describe, expect, test } from 'vitest'

describe('créer le dépot de la démarche', () => {
  test.each<[string, ITitreEtape[], boolean]>([
    ['crée un dépot d’une ARM avec une demande faite', [{ date: '2021-01-01', typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON }] as ITitreEtape[], true],
    ['ne crée pas un dépot d’une ARM si sa demande est en construction', [{ date: '2021-01-01', typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON }] as ITitreEtape[], false],
    ['ne crée pas un dépot d’une ARM si sa demande est historique', [{ date: '2018-01-01', typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON }] as ITitreEtape[], false],
    [
      'ne crée pas un dépot d’une ARM si déjà déposée',
      [
        { date: '2021-01-01', typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON },
        { date: '2021-01-02', typeId: 'mdp', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON },
      ] as ITitreEtape[],
      false,
    ],
  ])('%s', (_test, etapes, creation) => {
    const titresDemarchesDepotCreated = titreDemarcheDepotCheck({
      titre: { typeId: 'arm' } as ITitre,
      typeId: 'oct',
      etapes,
    } as ITitreDemarche)
    expect(titresDemarchesDepotCreated).toEqual(creation)
  })
})
