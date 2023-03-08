import { Index } from '../../types.js'

const hashGet = (str: string) => str.split('-').pop()

export const matchFuzzy = (name: string, index: Index<any>, partGet = hashGet) => {
  const hash = name.split('-').pop()

  return Object.keys(index).reduce((r: string[], key) => {
    // on ne garde pas les matches entiers pendant un fuzzy
    if (key === name) {
      return r
    }

    const part = partGet(key)

    if (part === hash) {
      r.push(key)
    }

    return r
  }, [])
}
