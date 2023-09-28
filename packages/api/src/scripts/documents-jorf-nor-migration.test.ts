import { expect, test } from 'vitest'
import { processDocument } from './documents-jorf-nor-migration'

test('coucou', () => {
  expect(processDocument({ url: 'https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000181939', uri: null, jorf: 'JORFTEXT000000181939', nor: 'INDE9400220A' })).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000000181939",
      "nor": "INDE9400220A",
    }
  `)

  expect(processDocument({ url: 'https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000181939', uri: null, jorf: null, nor: 'INDE9400220A' })).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000000181939",
      "nor": "INDE9400220A",
    }
  `)

  expect(processDocument({ url: 'https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000786577', uri: null, jorf: null, nor: 'INDI0301072D' })).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000000786577",
      "nor": "INDI0301072D",
    }
  `)

  expect(processDocument({ url: 'https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000773542&categorieLien=cid', uri: null, jorf: null, nor: 'ECOI0100441D' })).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000000773542",
      "nor": "ECOI0100441D",
    }
  `)

  expect(processDocument({ url: 'https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000861966', uri: null, jorf: 'JORFTEXT000000861966', nor: null })).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000000861966",
      "nor": null,
    }
  `)

  expect(processDocument({ url: 'https://www.legifrance.gouv.fr/affichTexte.do;?cidTexte=JORFTEXT000018080987', uri: null, jorf: '', nor: null })).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000018080987",
      "nor": null,
    }
  `)

  expect(
    processDocument({
      url: 'https://www.legifrance.gouv.fr/affichTexte.do;?cidTexte=JORFTEXT000018080987',
      uri: 'https://www.legifrance.gouv.fr/eli/arrete/2008/1/29/DEVE0801087A/jo/texte',
      jorf: 'JORFTEXT000000861966',
      nor: null,
    })
  ).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000000861966",
      "nor": "DEVE0801087A",
    }
  `)

  expect(
    processDocument({
      url: 'https://www.legifrance.gouv.fr/eli/arrete/2015/8/3/EINL1518062A/jo/texte',
      uri: 'https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000031053068',
      jorf: null,
      nor: null,
    })
  ).toMatchInlineSnapshot(`
    {
      "jorf": "JORFTEXT000031053068",
      "nor": "EINL1518062A",
    }
  `)

  expect(processDocument({ url: null, uri: null, jorf: null, nor: 'R03-2018-01-11-002' })).toMatchInlineSnapshot(`
    {
      "jorf": null,
      "nor": null,
    }
  `)

  expect(processDocument({ url: null, uri: null, jorf: null, nor: 'INDE8800S81A' })).toMatchInlineSnapshot(`
    {
      "jorf": null,
      "nor": "INDE8800581A",
    }
  `)
})
