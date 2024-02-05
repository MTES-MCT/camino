import { z } from 'zod'
import { toCaminoDate } from '../date.js'
import { StatistiquesDataGouv } from '../statistiques'

// prettier-ignore
const IDS = ['Nombre d\'utilisateurs sur la plateforme', 'Nombre d\'utilisateurs affiliés à une entreprise', 'Nombre d\'utilisateurs rattachés à une préfecture','Nombre d\'utilisateurs rattachés à un ministère','Nombre d\'utilisateurs rattachés à une Dréal','Nombre d\'utilisateurs rattachés à une Déal','Nombre d\'utilisateurs rattachés à une Autorité'] as const

const caminoStatistiquesDataGouvIdValidator = z.enum(IDS)
export type CaminoStatistiquesDataGouvId = z.infer<typeof caminoStatistiquesDataGouvIdValidator>
type TemplateDataGouv = Pick<StatistiquesDataGouv, 'indicateur' | 'unite_mesure' | 'frequence_monitoring' | 'date_debut' | 'dataviz_wish'>

export const CaminoStatistiquesDataGouv = {
  "Nombre d'utilisateurs sur la plateforme": {
    indicateur: "Nombre d'utilisateurs sur la plateforme",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
  "Nombre d'utilisateurs affiliés à une entreprise": {
    indicateur: "Nombre d'utilisateurs affiliés à une entreprise",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
  "Nombre d'utilisateurs rattachés à une préfecture": {
    indicateur: "Nombre d'utilisateurs rattachés à une préfecture",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
  "Nombre d'utilisateurs rattachés à un ministère": {
    indicateur: "Nombre d'utilisateurs rattachés à un ministère",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
  "Nombre d'utilisateurs rattachés à une Dréal": {
    indicateur: "Nombre d'utilisateurs rattachés à une Dréal",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
  "Nombre d'utilisateurs rattachés à une Déal": {
    indicateur: "Nombre d'utilisateurs rattachés à une Déal",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
  "Nombre d'utilisateurs rattachés à une Autorité": {
    indicateur: "Nombre d'utilisateurs rattachés à une Autorité",
    unite_mesure: 'unité',
    frequence_monitoring: 'mensuelle',
    date_debut: toCaminoDate('2023-01-01'),
    dataviz_wish: 'piechart',
  },
} as const satisfies Record<(typeof IDS)[number], TemplateDataGouv>
