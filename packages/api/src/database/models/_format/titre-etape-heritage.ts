import { IHeritageProps, IFields, IHeritageContenu } from '../../../types.js'
import { userSuper } from '../../user-super.js'
import { titreEtapeGet } from '../../queries/titres-etapes.js'
import { newEtapeId } from './id-create.js'
import { isHeritageProps } from 'camino-common/src/heritage.js'
import { getKeys } from 'camino-common/src/typescript-tools.js'

export const heritagePropsFormat = async (heritageProps: IHeritageProps) => {
  for (const propId of getKeys(heritageProps, isHeritageProps)) {
    if (heritageProps[propId]?.etapeId) {
      const fields = { type: { id: {} } } as IFields
      if (['titulaires', 'amodiataires'].includes(propId)) {
        fields[propId] = { id: {} }
      }

      const titreEtape = await titreEtapeGet(newEtapeId(heritageProps[propId].etapeId!), { fields }, userSuper)

      heritageProps[propId].etape = titreEtape
    }
  }

  return heritageProps
}

export const heritageContenuFormat = async (heritageContenu: IHeritageContenu) => {
  const fields = { type: { id: {} } } as IFields
  for (const sectionId of Object.keys(heritageContenu)) {
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
