import { IHeritageProps, IHeritageContenu } from '../../../types'
import { userSuper } from '../../user-super'
import { titreEtapeGet } from '../../queries/titres-etapes'
import { newEtapeId } from './id-create'
import { isHeritageProps } from 'camino-common/src/heritage'
import { getKeys } from 'camino-common/src/typescript-tools'
import { FieldsEtape } from '../../queries/_options'

export const heritagePropsFormat = async (heritageProps: IHeritageProps) => {
  for (const propId of getKeys(heritageProps, isHeritageProps)) {
    if (heritageProps[propId]?.etapeId) {
      const fields: FieldsEtape = { id: {} }

      const titreEtape = await titreEtapeGet(newEtapeId(heritageProps[propId].etapeId!), { fields }, userSuper)

      heritageProps[propId].etape = titreEtape
    }
  }

  return heritageProps
}

export const heritageContenuFormat = async (heritageContenu: IHeritageContenu) => {
  const fields: FieldsEtape = { id: {} }
  for (const sectionId of Object.keys(heritageContenu)) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (heritageContenu[sectionId]) {
      for (const elementId of Object.keys(heritageContenu[sectionId])) {
        if (heritageContenu[sectionId][elementId].etapeId) {
          const titreEtape = await titreEtapeGet(newEtapeId(heritageContenu[sectionId][elementId].etapeId!), { fields }, userSuper)

          heritageContenu[sectionId][elementId].etape = titreEtape
        }
      }
    }
  }

  return heritageContenu
}
