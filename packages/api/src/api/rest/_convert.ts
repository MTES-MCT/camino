import { DownloadFormat } from 'camino-common/src/rest.js'
import xlsx from 'xlsx'

import { Index } from '../../types.js'

export const tableConvert = (section: 'titres' | 'demarches' | 'activites' | 'utilisateurs' | 'entreprises', elements: Index<any>[], format: DownloadFormat) => {
  let contenu = ''

  const sheet = xlsx.utils.json_to_sheet(elements as Index<any>[])

  if (format === 'xlsx') {
    const cells = Object.keys(sheet)
    for (const cell of cells) {
      if (typeof sheet[cell].v === 'string' && sheet[cell].v.length > 32767) {
        sheet[cell].v = 'la cellule est trop grosse pour le format xlsx, veuillez télécharger le document en ods si vous voulez y accéder'
      }
    }
  }

  if (format === 'csv') {
    contenu = xlsx.utils.sheet_to_csv(sheet)
  } else if (format === 'xlsx' || format === 'ods') {
    const wb = xlsx.utils.book_new()

    xlsx.utils.book_append_sheet(wb, sheet, section)

    contenu = xlsx.write(wb, { type: 'buffer', bookType: format })
  }

  return contenu
}
