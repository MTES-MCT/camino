import { filesPathCheck } from './files-path-check.js'
import { IndexFile } from './_types.js'
import { expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { newDocumentId } from '../../database/models/_format/id-create.js'

test('filesPathCheck', () => {
  const fileIndex = {
    file: 'file.pdf',
    file2: 'file2.pdf',
    file3: 'demarches/file3.pdf',
  }

  const documentIndex: IndexFile = {
    file3: {
      document: {
        id: newDocumentId(toCaminoDate('2020-08-04'), 'acd'),
        typeId: 'acd',
        date: toCaminoDate('2020-08-04'),
      },
      path: 'demarches/anotherFolder/file3.pdf',
    },
    file2: {
      document: {
        id: newDocumentId(toCaminoDate('2020-08-04'), 'aac'),
        typeId: 'aac',
        date: toCaminoDate('2020-08-04'),
      },
      path: 'file2.pdf',
    },
  }
  expect(filesPathCheck(documentIndex, fileIndex, false)).toEqual(['file3'])
})
