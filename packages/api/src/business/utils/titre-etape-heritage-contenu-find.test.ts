import { IContenu, IHeritageContenu, ITitreEtape } from '../../types'

import { objectClone } from '../../tools/index'

import { heritageContenuFind, titreEtapeHeritageContenuFind } from './titre-etape-heritage-contenu-find'
import { describe, test, expect } from 'vitest'
import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { newEtapeId } from '../../database/models/_format/id-create'

describe('retourne le contenu spécifique d’un élément d’une section en fonction de son héritage', () => {
  test('l’étape n’est pas modifiée si elle n’a pas d’étape précédente et qu’elle n’a aucun héritage d’actif', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false } },
    }
    const titreEtape = {
      heritageContenu,
    } as ITitreEtape

    expect(heritageContenuFind('section', 'element', titreEtape)).toEqual({
      actif: false,
      hasChanged: false,
      value: undefined,
      etapeId: undefined,
    })
  })

  test('l’étape est modifiée si elle a une étape précédente et que son héritage n’est pas renseigné', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false } },
    }

    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      heritageContenu,
    } as ITitreEtape

    const titreEtape = {
      heritageContenu,
    } as ITitreEtape

    expect(heritageContenuFind('section', 'element', titreEtape, titreEtapePrecedente)).toEqual({
      actif: false,
      hasChanged: true,
      value: undefined,
      etapeId: titreEtapePrecedente.id,
    })
  })

  test('l’étape est modifiée si elle a une étape précédente et que son héritage est actif', () => {
    const contenu: IContenu = {
      section: { element: 'toto' },
    }
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false } },
    }

    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      contenu,
      heritageContenu,
    } as ITitreEtape

    const titreEtape = {
      heritageContenu,
    } as ITitreEtape
    titreEtape.heritageContenu!.section.element.actif = true

    expect(heritageContenuFind('section', 'element', titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      actif: true,
      value: contenu.section.element,
      etapeId: titreEtapePrecedente.id,
    })
  })

  test('l’étape est modifiée et récupère l’héritage déjà présent sur l’étape précédente', () => {
    const contenu: IContenu = {
      section: { element: 'toto' },
    }
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: true, etapeId: newEtapeId('firstEtapeId') } },
    }

    const titreEtapePrecedente = {
      id: 'titreEtapePrecedenteId',
      contenu,
      heritageContenu,
    } as ITitreEtape

    const titreEtape = {
      heritageContenu: objectClone(heritageContenu),
    } as ITitreEtape
    titreEtape.heritageContenu!.section.element.actif = true
    delete titreEtape.heritageContenu!.section.element.etapeId

    expect(heritageContenuFind('section', 'element', titreEtape, titreEtapePrecedente)).toEqual({
      hasChanged: true,
      actif: true,
      value: contenu.section.element,
      etapeId: 'firstEtapeId',
    })
  })

  test('l’héritage est désactivé si l’étape précédente n’existe plus', () => {
    const titreEtape = {
      contenu: {
        section: { element: 'toto' },
      } as IContenu,
      heritageContenu: {
        section: { element: { actif: true, etapeId: newEtapeId('prevEtapeId') } },
      } as IHeritageContenu,
    } as ITitreEtape

    expect(heritageContenuFind('section', 'element', titreEtape, null)).toEqual({
      hasChanged: true,
      actif: false,
      value: titreEtape.contenu!.section.element,
      etapeId: undefined,
    })
  })
})

describe('retourne le contenu de l’étape en fonction de son héritage', () => {
  test('l’étape n’est pas modifiée si elle n’a pas d’étape précédente et qu’elle n’a aucun héritage d’actif', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false } },
    }
    const titreEtape = {
      id: 'etapeId',
      heritageContenu,
    } as ITitreEtape

    expect(
      titreEtapeHeritageContenuFind([titreEtape], titreEtape, {
        [titreEtape.id]: [],
      })
    ).toEqual({
      hasChanged: false,
      contenu: undefined,
      heritageContenu,
    })
  })

  test('l’étape est modifiée si elle un héritage actif et une étape précédente avec un élément d’une section en commun', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false } },
    }
    const prevTitreEtape = {
      id: 'prevEtapeId',
      contenu: { section: { element: '2022-01-01' } } as IContenu,
      heritageContenu,
    } as ITitreEtape

    const titreEtape = {
      id: 'etapeId',
      heritageContenu,
    } as ITitreEtape
    titreEtape.heritageContenu!.section.element.actif = true

    const dictionary: Record<string, DeepReadonly<Section>[]> = {
      [prevTitreEtape.id]: [
        {
          id: 'section',
          elements: [{ id: 'element', type: 'date', optionnel: false }],
        },
      ],
      [titreEtape.id]: [
        {
          id: 'section',
          elements: [{ id: 'element', type: 'date', optionnel: false }],
        },
      ],
    }

    expect(titreEtapeHeritageContenuFind([prevTitreEtape, titreEtape], titreEtape, dictionary)).toEqual({
      hasChanged: true,
      contenu: prevTitreEtape.contenu,
      heritageContenu: {
        section: { element: { actif: true, etapeId: prevTitreEtape.id } },
      },
    })
  })

  test('l’étape est modifiée si elle un héritage actif et que son contenu est supprimé', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false } },
    }
    const prevTitreEtape = {
      id: 'prevEtapeId',
      heritageContenu,
    } as ITitreEtape

    const titreEtape = {
      id: 'etapeId',
      contenu: { section: { element: 'toto' } } as IContenu,
      heritageContenu,
    } as ITitreEtape
    titreEtape.heritageContenu!.section.element.actif = true

    const dictionary: Record<string, DeepReadonly<Section>[]> = {
      [prevTitreEtape.id]: [{ id: 'section', elements: [{ id: 'element', type: 'text', optionnel: false }] }],
      [titreEtape.id]: [{ id: 'section', elements: [{ id: 'element', type: 'text', optionnel: false }] }],
    }

    expect(titreEtapeHeritageContenuFind([prevTitreEtape, titreEtape], titreEtape, dictionary)).toEqual({
      hasChanged: true,
      contenu: { section: {} },
      heritageContenu: {
        section: { element: { actif: true, etapeId: prevTitreEtape.id } },
      },
    })
  })

  test('l’étape n’est pas modifiée si l’héritage est actif, la valeur est null et que le contenu de l’étape précédente est vide', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false, etapeId: null } },
    }
    const prevTitreEtape = {
      id: 'prevEtapeId',
      heritageContenu,
      contenu: null,
    } as ITitreEtape

    const titreEtape = {
      id: 'etapeId',
      contenu: { section: {} } as IContenu,
      heritageContenu,
    } as ITitreEtape
    titreEtape.heritageContenu!.section.element.actif = true
    titreEtape.heritageContenu!.section.element.etapeId = newEtapeId('prevEtapeId')

    const dictionary: Record<string, DeepReadonly<Section>[]> = {
      [prevTitreEtape.id]: [{ id: 'section', elements: [{ id: 'element', type: 'text', optionnel: false }] }],
      [titreEtape.id]: [{ id: 'section', elements: [{ id: 'element', type: 'text', optionnel: false }] }],
    }

    expect(titreEtapeHeritageContenuFind([prevTitreEtape, titreEtape], titreEtape, dictionary)).toEqual({
      hasChanged: false,
      contenu: { section: {} },
      heritageContenu: {
        section: { element: { actif: true, etapeId: prevTitreEtape.id } },
      },
    })
  })

  test('l’étape n’est pas modifiée si l’héritage est actif, le contenu est vide et que la valeur de l’étape précédente est null', () => {
    const heritageContenu: IHeritageContenu = {
      section: { element: { actif: false, etapeId: null } },
    }
    const prevTitreEtape = {
      id: 'prevEtapeId',
      heritageContenu,
      contenu: { autre: {} } as IContenu,
    } as ITitreEtape

    const titreEtape = {
      id: 'etapeId',
      contenu: null,
      heritageContenu,
    } as ITitreEtape
    titreEtape.heritageContenu!.section.element.actif = true
    titreEtape.heritageContenu!.section.element.etapeId = newEtapeId('prevEtapeId')

    const dictionary: Record<string, DeepReadonly<Section>[]> = {
      [prevTitreEtape.id]: [{ id: 'section', elements: [{ id: 'element', type: 'text', optionnel: false }] }],
      [titreEtape.id]: [{ id: 'section', elements: [{ id: 'element', type: 'text', optionnel: false }] }],
    }

    expect(titreEtapeHeritageContenuFind([prevTitreEtape, titreEtape], titreEtape, dictionary)).toEqual({
      hasChanged: false,
      contenu: null,
      heritageContenu: {
        section: { element: { actif: true, etapeId: prevTitreEtape.id } },
      },
    })
  })
})
