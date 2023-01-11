import { dateValidate } from 'camino-common/src/date.js'
import { IDocument } from '../../types.js'

export const documentUpdationValidate = async (document: IDocument) => {
  const errors = [] as string[]

  const error = dateValidate(document.date)

  if (error) {
    errors.push(error)
  }

  return errors
}
