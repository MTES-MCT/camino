import fs from 'fs'
import decamelize from 'decamelize'
import camelcase from 'camelcase'

import { IEtapeType, ITitre, ITitreDemarche, ITitreEtape, ITitreType, ITitreTypeDemarcheTypeEtapeType } from '../../types.js'

import { titreDemarcheEtatValidate } from '../validations/titre-demarche-etat-validate.js'
import { demarcheDefinitionFind, isDemarcheDefinitionRestriction } from './definitions.js'
import { contenusTitreEtapesIdsFind } from '../utils/props-titre-etapes-ids-find.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { vi, expect, test } from 'vitest'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
test('teste EtatsValidate', () => {
  const octEtatsValidate = demarcheEtatsValidate('ren', 'arm', toCaminoDate('2021-01-01'))

  expect(octEtatsValidate).toBeTruthy()
  expect(octEtatsValidate([], {})).toHaveLength(0)
})

vi.mock('../../database/models/_format/titre-contenu', () => ({
  __esModule: true,
  titreContenuFormat: vi.fn(),
}))

vi.mock('../utils/props-titre-etapes-ids-find', () => ({
  __esModule: true,
  contenusTitreEtapesIdsFind: vi.fn(),
}))

const contenusTitreEtapesIdsFindMock = vi.mocked(contenusTitreEtapesIdsFind, true)

const elementsGet = <T>(fileName: string): T[] => {
  fileName = decamelize(fileName, { separator: '-' })
  const filePath = `./sources/${fileName}`
  const results = JSON.parse(fs.readFileSync(filePath).toString())

  return results.map((result: any) =>
    Object.keys(result).reduce((acc: { [key: string]: any }, key) => {
      acc[camelcase(key)] = result[key]

      return acc
    }, {})
  )
}

export const etapesTypesGet = (demarcheTypeId: string, titreTypeId: string) => {
  const titresTypesDemarchesTypesEtapesTypes = elementsGet<ITitreTypeDemarcheTypeEtapeType>('titres-types--demarches-types--etapes-types.json').filter(
    tde => tde.titreTypeId === titreTypeId && tde.demarcheTypeId === demarcheTypeId
  )

  return elementsGet<IEtapeType>('etapes-types.json').reduce((acc, etapeType) => {
    const tde = titresTypesDemarchesTypesEtapesTypes.find(tde => tde.etapeTypeId === etapeType.id)

    if (tde) {
      etapeType.titreTypeId = tde.titreTypeId
      etapeType.ordre = tde.ordre
      acc.push(etapeType)
    }

    return acc
  }, [] as IEtapeType[])
}

export const demarcheEtatsValidate = (demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId, date: CaminoDate) => {
  return (titreDemarcheEtapes: Partial<ITitreEtape>[], titre: Partial<ITitre> = {}) => {
    contenusTitreEtapesIdsFindMock.mockReturnValue({})

    const demarcheDefinitions = demarcheDefinitionFind(titreTypeId, demarcheTypeId, [{ typeId: 'mfr', date }], newDemarcheId())
    if (!isDemarcheDefinitionRestriction(demarcheDefinitions)) {
      throw new Error('cette démarche n’a pas de restrictions')
    }
    const demarcheDefinitionRestrictions = demarcheDefinitions!.restrictions

    const titreDemarche = { typeId: demarcheTypeId } as ITitreDemarche
    titre = {
      ...titre,
      typeId: titreTypeId,
      type: {
        id: titreTypeId,
        contenuIds: [],
      } as unknown as ITitreType,
      demarches: [titreDemarche] as ITitreDemarche[],
    }

    return titreDemarcheEtatValidate(date, demarcheDefinitionRestrictions!, demarcheTypeId, titreDemarche, titreDemarcheEtapes as ITitreEtape[], titre as ITitre)
  }
}
