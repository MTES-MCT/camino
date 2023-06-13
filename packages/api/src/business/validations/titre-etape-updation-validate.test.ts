import { ITitreEtape, ITitreDemarche, ITitre } from '../../types.js'

import { titreEtapeUpdationValidate } from './titre-etape-updation-validate.js'
import { userSuper } from '../../database/user-super.js'
import { describe, test, expect } from 'vitest'

describe('valide l’étape avant de l’enregistrer', () => {
  test("une ARM ou une AXM ne peuvent pas recevoir d'amodiataires", () => {
    const titreDemarche = { typeId: 'oct' } as unknown as ITitreDemarche

    // ARM
    let titreEtape = {
      typeId: 'mfr',
      amodiataires: [],
    } as unknown as ITitreEtape

    let titre = {
      id: 'foo',
      typeId: 'arm',
    } as unknown as ITitre

    let errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titre, [], [], [], userSuper)
    expect(errors).not.toContain("une autorisation de recherche ne peut pas inclure d'amodiataires")
    expect(errors).not.toContain("une autorisation d'exploitation ne peut pas inclure d'amodiataires")

    titreEtape = {
      typeId: 'mfr',
      amodiataires: [{ id: 'foo', nom: 'bar', operateur: true }],
    } as unknown as ITitreEtape

    errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titre, [], [], [], userSuper)
    expect(errors).toContain("une autorisation de recherche ne peut pas inclure d'amodiataires")

    // // AXM
    titreEtape = {
      typeId: 'mfr',
      amodiataires: [],
    } as unknown as ITitreEtape

    titre = {
      id: 'foo',
      typeId: 'axm',
    } as unknown as ITitre

    errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titre, [], [], [], userSuper)
    expect(errors).not.toContain("une autorisation d'exploitation ne peut pas inclure d'amodiataires")
    expect(errors).not.toContain("une autorisation de recherche ne peut pas inclure d'amodiataires")

    titreEtape = {
      typeId: 'mfr',
      amodiataires: [{ id: 'foo', nom: 'bar', operateur: true }],
    } as unknown as ITitreEtape

    errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titre, [], [], [], userSuper)
    expect(errors).toContain("une autorisation d'exploitation ne peut pas inclure d'amodiataires")
  })
})
