import { filesPathCheck } from './files-path-check.js'
import { IndexFile } from './_types.js'
import { expect, test } from 'vitest'

test('filesPathCheck', () => {
  const fileIndex = {
    file: 'file.pdf',
    file2: 'file2.pdf',
    file3: 'demarches/file3.pdf'
  }

  const documentIndex: IndexFile = {
    file3: {
      document: {
        id: 'file3',
        typeId: 'not',
        date: '2020-08-04'
      },
      path: 'demarches/anotherFolder/file3.pdf'
    },
    file2: {
      document: {
        id: 'file2',
        typeId: 'not',
        date: '2020-08-04'
      },
      path: 'file2.pdf'
    }
  }
  expect(filesPathCheck(documentIndex, fileIndex, false)).toEqual(['file3'])
})
