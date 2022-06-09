const fs = require('fs')
const path = require('path')
const readline = require('readline')
const iconExtractor = /id="icon-([^ ]*)"/

function generateTypes(): void {
  function getIconSpritePath(): string {
    return path.join(
      __dirname,
      '..',
      'src',
      'components',
      '_ui',
      'iconSprite.vue'
    )
  }

  function getIconSpritePathTypes(): string {
    return path.join(
      __dirname,
      '..',
      'src',
      'components',
      '_ui',
      'iconSpriteType.ts'
    )
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(getIconSpritePath()),
    output: process.stdout,
    terminal: false
  })

  const icons: string[] = []
  rl.on('line', line => {
    const captured = line.match(iconExtractor)
    if (captured != null) {
      icons.push(captured[1])
    }
  })
  rl.on('close', () => {
    fs.writeFileSync(
      getIconSpritePathTypes(),
      `// Generated by 'scripts/generateIconTypes.ts', DO NOT MODIFY MANUALLY
// add new icons in the iconSprite.svg and run 'npm run generate-icon-types -w packages/ui', or commit and husky will do it
export const icons=${JSON.stringify(icons.sort())} as const
export type Icon = typeof icons[number]
    `
    )
  })
}

generateTypes()
