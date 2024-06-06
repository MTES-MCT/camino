import { ITitreDemarche, ITitre } from '../../types.js'

import { titreEtapeUpdationValidate } from './titre-etape-updation-validate.js'
import { userSuper } from '../../database/user-super.js'
import { describe, test, expect } from 'vitest'
import { FlattenEtape } from 'camino-common/src/etape-form.js'
import { ETAPE_IS_NOT_BROUILLON, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { demarcheIdValidator } from 'camino-common/src/demarche.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'
import { titreIdValidator } from 'camino-common/src/validators/titres.js'

describe('valide l’étape avant de l’enregistrer', () => {
  test("une ARM ou une AXM ne peuvent pas recevoir d'amodiataires", () => {
    const titreDemarche: ITitreDemarche = { id: demarcheIdValidator.parse('demarcheId'), typeId: 'oct', titreId: titreIdValidator.parse('titreId') }

    // ARM
    const titreEtape: FlattenEtape = {
      id: etapeIdValidator.parse('etapeId'),
      titulaires: {
        value: [],
        heritee: false,
        etapeHeritee: null,
      },
      amodiataires: {
        value: [],
        heritee: false,
        etapeHeritee: null,
      },
      dateDebut: {
        value: caminoDateValidator.parse('2024-01-01'),
        heritee: false,
        etapeHeritee: null,
      },
      dateFin: {
        value: caminoDateValidator.parse('2030-01-01'),
        heritee: false,
        etapeHeritee: null,
      },
      perimetre: {
        value: null,
        heritee: false,
        etapeHeritee: null,
      },
      duree: {
        value: null,
        heritee: false,
        etapeHeritee: null,
      },
      substances: {
        value: [],
        heritee: false,
        etapeHeritee: null,
      },
      contenu: {},
      date: caminoDateValidator.parse('2024-01-01'),
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      notes: '',
      slug: etapeSlugValidator.parse('etapeSlug'),
      statutId: 'fai',
      titreDemarcheId: demarcheIdValidator.parse('demarcheId'),
      typeId: 'mfr',
    }

    const titreARM: Pick<ITitre, 'typeId'> = {
      typeId: 'arm',
    }

    let errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titreARM, [], [], [], [], [], userSuper, null, null)
    expect(errors).not.toContain("une autorisation de recherche ne peut pas inclure d'amodiataires")
    expect(errors).not.toContain("une autorisation d'exploitation ne peut pas inclure d'amodiataires")

    const titreEtapeWithAmodiataires = {
      ...titreEtape,
      amodiataires: {
        value: [entrepriseIdValidator.parse('amodiataireId1')],
        heritee: false,
        etapeHeritee: null,
      },
    }

    errors = titreEtapeUpdationValidate(titreEtapeWithAmodiataires, titreDemarche, titreARM, [], [], [], [], [], userSuper, null, null)
    expect(errors).toContain("une autorisation de recherche ne peut pas inclure d'amodiataires")

    // AXM
    const titreAxm: Pick<ITitre, 'typeId'> = {
      typeId: 'axm',
    }

    errors = titreEtapeUpdationValidate(titreEtape, titreDemarche, titreAxm, [], [], [], [], [], userSuper, null, null)
    expect(errors).not.toContain("une autorisation d'exploitation ne peut pas inclure d'amodiataires")
    expect(errors).not.toContain("une autorisation de recherche ne peut pas inclure d'amodiataires")

    errors = titreEtapeUpdationValidate(titreEtapeWithAmodiataires, titreDemarche, titreAxm, [], [], [], [], [], userSuper, null, null)
    expect(errors).toContain("une autorisation d'exploitation ne peut pas inclure d'amodiataires")
  })
})
