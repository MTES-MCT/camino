import { dateValidate } from 'camino-common/src/date.js'
import { IDocument } from '../../types.js'

export const documentInputValidate = (document: IDocument): string[] => {
  const errors: string[] = []

  if (!document.id && !document.typeId) {
    errors.push('type de fichier manquant')
  }

  if (document.fichierNouveau && !document.fichierTypeId) {
    errors.push('extension du fichier manquante')
  }

  const dateCheck = dateValidate(document.date)
  if (!dateCheck.valid) {
    errors.push(dateCheck.error)
  }

  return errors
}
