import { z, ZodIssue, ZodIssueCode, ZodParsedType } from 'zod'
import { exhaustiveCheck, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from './typescript-tools.js'
import { caminoDateValidator } from './date.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'

export const nullToDefault =
  <Y>(defaultWhenNullOrUndefined: NoInfer<Y>) =>
  (val: null | undefined | Y): Y => {
    if (isNullOrUndefined(val)) {
      return defaultWhenNullOrUndefined
    }

    return val
  }

export const makeFlattenValidator = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema,
    heritee: z.boolean(),
    etapeHeritee: z
      .object({
        etapeTypeId: etapeTypeIdValidator,
        date: caminoDateValidator,
        value: schema,
      })
      .nullable(),
  })

export type CaminoZodErrorReadableMessage = string & { __camino: 'ZodReadableMessage' }
export type CaminoError<T extends string> = {
  message: T
  extra?: any
  zodErrorReadableMessage?: CaminoZodErrorReadableMessage
  detail?: string
}

const fieldNameFromPath = (path: (string | number)[]): string | undefined => {
  const fieldName = path[path.length - 1]

  if (typeof fieldName === 'number') {
    return fieldNameFromPath(path.slice(0, path.length - 1))
  }

  return fieldName
}
export const translateIssue = (issue: ZodIssue): string => {
  const fieldName = fieldNameFromPath(issue.path)
  let message: string
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = `Le champ "${fieldName}" est obligatoire.`
      } else {
        if (isNotNullNorUndefinedNorEmpty(fieldName)) {
          message = `Le type du champ "${fieldName}" est incorrect, attendu "${issue.expected}" mais reçu "${issue.received}".`
        } else {
          message = `Le type "${issue.expected}" est attendu mais "${issue.received}" a été reçu.`
        }
      }
      break
    case ZodIssueCode.invalid_literal:
      if (isNotNullNorUndefinedNorEmpty(fieldName)) {
        message = `Le valeur du champ "${fieldName}" doit être "${issue.expected}" mais reçu "${issue.received}".`
      } else {
        message = `La valeur "${issue.received}" doit être "${issue.expected}".`
      }
      break

    case ZodIssueCode.invalid_union:
      if (isNotNullNorUndefinedNorEmpty(fieldName)) {
        message = `Le valeur du champ "${fieldName}" est invalide.`
      } else {
        message = `La valeur est invalide.`
      }
      break
    case ZodIssueCode.invalid_union_discriminator:
      message = `Le valeur du champ "${fieldName}" doit être "${issue.options.join('" ou "')}".`
      break
    case ZodIssueCode.invalid_enum_value:
      if (isNotNullNorUndefinedNorEmpty(fieldName)) {
        message = `Le valeur du champ "${fieldName}" `
      } else {
        message = `La valeur `
      }
      message += `doit être "${issue.options.join('" ou "')}" mais reçu "${issue.received}".`
      break

    case ZodIssueCode.invalid_string:
      if (isNotNullNorUndefinedNorEmpty(fieldName)) {
        message = `La valeur du champ "${fieldName}"`
      } else {
        message = `La valeur`
      }
      if (typeof issue.validation === 'object') {
        if ('includes' in issue.validation) {
          message = `${message} doit contenir "${issue.validation.includes}".`
        } else if ('startsWith' in issue.validation) {
          message = `${message} doit commencer par "${issue.validation.startsWith}".`
        } else if ('endsWith' in issue.validation) {
          message = `${message} doit finir par "${issue.validation.endsWith}".`
        } else {
          exhaustiveCheck(issue.validation)
        }
      } else if (issue.validation !== 'regex') {
        message = `${message} est invalide, on s'attend à un type "${issue.validation}".`
      } else {
        message = `${message} est invalide.`
      }
      break
    case ZodIssueCode.too_small:
      if (isNotNullNorUndefinedNorEmpty(fieldName)) {
        message = `La valeur du champ "${fieldName}"`
      } else {
        message = `La valeur`
      }
      if (issue.type === 'array') message = `${message} doit être un tableau avec ${issue.exact === true ? 'exactement' : issue.inclusive ? `au moins` : `plus de`} ${issue.minimum} élément(s).`
      else if (issue.type === 'string')
        message = `${message} doit être une chaine de caractère avec ${issue.exact === true ? 'exactement' : issue.inclusive ? `au moins` : `plus de`} ${issue.minimum} caractère(s).`
      else if (issue.type === 'number')
        message = `${message} doit être un nombre ${issue.exact === true ? `exactement égal à ` : issue.inclusive ? `plus grand ou égal à ` : `plus grand que `}${issue.minimum}.`
      else message = `${message} est invalide.`
      break
    case ZodIssueCode.too_big:
      if (isNotNullNorUndefinedNorEmpty(fieldName)) {
        message = `La valeur du champ "${fieldName}"`
      } else {
        message = `La valeur`
      }
      if (issue.type === 'array') message = `${message} doit être un tableau avec ${issue.exact === true ? `exactement` : issue.inclusive ? `au plus` : `moins de`} ${issue.maximum} élément(s).`
      else if (issue.type === 'string')
        message = `${message} doit être une chaine de caractère avec ${issue.exact === true ? `exactement ` : issue.inclusive ? `au plus` : `moins de`} ${issue.maximum} caractère(s).`
      else if (issue.type === 'number' || issue.type === 'bigint')
        message = `${message} doit être un nombre ${issue.exact === true ? `exactement égal à` : issue.inclusive ? `plus petit ou égal à` : `plus petit que`} ${issue.maximum}.`
      else message = `${message} est invalide.`
      break
    default:
      return issue.message
  }

  return message
}
