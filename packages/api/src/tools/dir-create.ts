import { mkdirSync } from 'fs'

export const dirCreate = (name: string): string | undefined => mkdirSync(name, { recursive: true })
