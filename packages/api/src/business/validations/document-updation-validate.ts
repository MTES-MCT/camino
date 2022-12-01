import { IDocument } from '../../types.js'

import { dateValidate } from '../../tools/date.js'

export const documentUpdationValidate = async (document: IDocument) => {
  const errors = [] as string[]

  const error = dateValidate(document.date)

  if (error) {
    errors.push(error)
  }

  return errors
}
