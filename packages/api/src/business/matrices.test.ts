import { getRawLines, rawMatriceValidator } from './matrices'
import { describe, expect, test } from 'vitest'
import { BodyMatrice } from '../tools/matrices/tests-creation'
import { z } from 'zod'
const matricesProd = require('./matrices.cas.json')

describe('matrices', () => {
  const rawMatricesValidator = z.array(rawMatriceValidator)
  // pour regénérer le fichier matrices.cas.json: `npm run test:generate-matrices-data -w packages/api`
  test.only.each(matricesProd as BodyMatrice[])('cas réel N°%#', async ({ entries, expected }) => {

    const communes = entries.titres.flatMap(titre => titre.communes.map(commune => ({ id: commune.id, nom: commune.id })))
    expect(getRawLines(entries.activitesAnnuelles, entries.activitesTrimestrielles, entries.titres, entries.annee, communes, entries.entreprises)).toStrictEqual(rawMatricesValidator.parse(expected))
  })
})
