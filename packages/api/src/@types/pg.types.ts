import { z } from 'zod'

const geometry = z.string().brand('PgGeometry')
export type PgGeometry = z.infer<typeof geometry>
