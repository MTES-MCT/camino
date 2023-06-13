import { mkdirSync } from 'fs'

export const dirCreate = (name: string) => mkdirSync(name, { recursive: true })
