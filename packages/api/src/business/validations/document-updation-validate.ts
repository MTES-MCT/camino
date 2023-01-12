import { dateValidate } from 'camino-common/src/date.js'
import { IDocument } from '../../types.js'

export const documentUpdationValidate = (document: IDocument): string[] => {
  const errors: string[] = []

  const dateCheck = dateValidate(document.date)

  if (!dateCheck.valid) {
    errors.push(dateCheck.error)
  }

  return errors
}
