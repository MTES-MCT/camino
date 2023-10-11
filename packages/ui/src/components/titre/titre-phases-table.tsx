import { DemarcheGet, DemarcheSlug } from 'camino-common/src/demarche'
import { FunctionalComponent } from 'vue'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { Column, TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { dateFormat } from 'camino-common/src/date'
import styles from './titre-phases-table.module.css'
import { capitalize } from 'camino-common/src/strings'
import './titre-phases-table.css'

interface Props {
  phases: DemarcheGet['titre']['phases']
  currentPhaseSlug: DemarcheSlug | null
}

const columns = [
  { id: 'phase', name: 'Phase', noSort: true },
  { id: 'demarche_date_debut', name: 'Début', noSort: true },
  { id: 'demarche_date_fin', name: 'Fin', noSort: true },
] as const satisfies readonly Column[]

type TitrePhasesTableRow = TableRow<(typeof columns)[number]['id']>

export const TitrePhasesTable: FunctionalComponent<Props> = (props: Props) => {
  const rows: TitrePhasesTableRow[] = props.phases.map(phase => {
    const isCurrent = phase.slug === props.currentPhaseSlug

    return {
      id: phase.slug,
      class: [isCurrent ? styles['titre-phase-current-row'] : ''],
      link: isCurrent ? null : { name: 'demarche', params: { demarcheId: phase.slug } },
      columns: {
        phase: { class: [isCurrent ? `fr-text--md fr-text--bold ${styles['type-statut']}` : ''], value: capitalize(DemarchesTypes[phase.demarche_type_id].nom) },
        demarche_date_debut: { value: dateFormat(phase.demarche_date_debut) },
        demarche_date_fin: { value: dateFormat(phase.demarche_date_fin) },
      },
    }
  })

  return <TableAuto class="titre-phases-table" initialSort={{ column: 'demarche_date_debut', order: 'desc' }} caption="" columns={columns} rows={rows} />
}
