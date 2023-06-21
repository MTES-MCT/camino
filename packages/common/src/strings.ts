export const capitalize = (text: string): string => {
  if (text.length > 0) {
    return text[0].toUpperCase() + text.substring(1)
  }

  return text
}

export const levenshtein = (s: string, t: string): number => {
  if (s === t) {
    return 0
  }
  const n = s.length
  const m = t.length
  if (n === 0 || m === 0) {
    return n + m
  }
  let x = 0
  let y: number
  let a: number
  let b: number
  let c: number
  let d: number
  let g: number
  let h = 0
  let k: number
  const p = new Array(n)
  for (y = 0; y < n; ) {
    p[y] = ++y
  }

  for (; x + 3 < m; x += 4) {
    const e1 = t.charCodeAt(x)
    const e2 = t.charCodeAt(x + 1)
    const e3 = t.charCodeAt(x + 2)
    const e4 = t.charCodeAt(x + 3)
    c = x
    b = x + 1
    d = x + 2
    g = x + 3
    h = x + 4
    for (y = 0; y < n; y++) {
      k = s.charCodeAt(y)
      a = p[y]
      if (a < c || b < c) {
        c = a > b ? b + 1 : a + 1
      } else {
        if (e1 !== k) {
          c++
        }
      }

      if (c < b || d < b) {
        b = c > d ? d + 1 : c + 1
      } else {
        if (e2 !== k) {
          b++
        }
      }

      if (b < d || g < d) {
        d = b > g ? g + 1 : b + 1
      } else {
        if (e3 !== k) {
          d++
        }
      }

      if (d < g || h < g) {
        g = d > h ? h + 1 : d + 1
      } else {
        if (e4 !== k) {
          g++
        }
      }
      p[y] = h = g
      g = d
      d = b
      b = c
      c = a
    }
  }

  for (; x < m; ) {
    const e = t.charCodeAt(x)
    c = x
    d = ++x
    for (y = 0; y < n; y++) {
      a = p[y]
      if (a < c || d < c) {
        d = a > d ? d + 1 : a + 1
      } else {
        if (e !== s.charCodeAt(y)) {
          d = c + 1
        } else {
          d = c
        }
      }
      p[y] = d
      c = a
    }
    h = d
  }

  return h
}
const decamelize = (value: string): string => {
  return value
    .replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
    .replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-rt-z\d]+)/g, '$1 $2')
}

export const slugify = (value: string): string => {
  return decamelize(value.replace(/^\s+|\s+$/g, ''))
    .toLowerCase()
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ä/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/&/g, 'and')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
