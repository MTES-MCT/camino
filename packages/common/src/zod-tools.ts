import { isNullOrUndefined } from "./typescript-tools"

export const nullToDefault = <Y>(defaultWhenNullOrUndefined: Y) => (val: null | undefined | Y): Y => {
  if (isNullOrUndefined(val)) {
    return defaultWhenNullOrUndefined
  }

  return val
}