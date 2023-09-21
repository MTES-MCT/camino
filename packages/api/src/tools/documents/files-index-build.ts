import { execSync } from 'child_process'
import { basename } from 'path'

import { Index } from '../../types.js'

export const filesIndexBuild = (path = './files'): Index<string> => {
  const filesNames = execSync(`find ${path} | grep -v entreprises | grep -v activites | grep pdf`).toString().split('\n')

  return filesNames.reduce((res: Index<string>, fileName) => {
    if (fileName) {
      res[basename(fileName.split('/').pop()!, '.pdf')] = fileName.substring(path.length + 1)
    }

    return res
  }, {})
}
