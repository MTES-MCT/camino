import { filesIndexBuild } from './files-index-build'

test('filesIndexBuild', () => {
  const dir = process.cwd()
  expect(filesIndexBuild(`${dir}/src/tools/documents/_assets`)).toEqual({
    file: 'file.pdf',
    file2: 'file2.pdf',
    file3: 'demarches/file3.pdf'
  })
})
