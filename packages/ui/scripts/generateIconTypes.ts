import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'url'

const iconExtractor = /id="icon-([^ ]*)"/
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fileName = 'iconSprite.tsx'

function generateDsfrIconTypes(): void {
  function getIconPath(): string {
    return path.join(__dirname, '..', 'src', 'styles', 'dsfr', 'icons')
  }

  function getIconSpritePathTypes(): string {
    return path.join(__dirname, '..', 'src', 'components', '_ui', 'dsfrIconSpriteType.ts')
  }

  const iconPath = getIconPath()
  const folders = fs.readdirSync(getIconPath())

  const iconNames = folders.flatMap(folder => {
    const iconFiles = fs.readdirSync(path.join(iconPath, folder))
    return (
      iconFiles
        .map(fileName => fileName.replace(/\.[^/.]+$/, ''))
        // TODO 2023-07-03 les noms de fichiers des icones du dsfr ne sont pas consistants avec les noms des classes........
        .map(fileName => fileName.replace('fr--', ''))
    )
  })

  fs.writeFileSync(
    getIconSpritePathTypes(),
    `// Generated by 'scripts/generateIconTypes.ts', DO NOT MODIFY MANUALLY
// add new icons in the ${fileName} and run 'npm run generate-icon-types -w packages/ui', or commit and husky will do it
// prettier-ignore
export const icons=${JSON.stringify(iconNames.sort())} as const
export type DsfrIcon = \`fr-icon-\${typeof icons[number]}\`
    `
  )
}

generateDsfrIconTypes()
