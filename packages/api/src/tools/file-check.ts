import { createReadStream } from 'node:fs'

export const isPdf = async (filePath: string): Promise<boolean> => {
  const chunks = []
  const stream = createReadStream(filePath, { start: 0, end: 4 })
  try {
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    const header = buffer.toString('utf-8')
    if (header !== '%PDF-') {
      console.error('Ce PDF ne semble pas être un PDF valide')

      return false
    }

    return true
  } finally {
    stream.destroy()
  }
}
