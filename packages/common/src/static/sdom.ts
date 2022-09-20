export const SDOMZoneIds = {
  Zone0: '0',
  Zone0Potentielle: '0_potentielle',
  Zone1: '1',
  Zone2: '2'
} as const

export type SDOMZoneId = typeof SDOMZoneIds[keyof typeof SDOMZoneIds]
