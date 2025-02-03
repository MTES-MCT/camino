import { FunctionalComponent } from 'vue'
import { EtapeAvisId, EtapeAvis } from 'camino-common/src/etape'
import { User, isAdministration, isSuper } from 'camino-common/src/roles'
import { getDownloadRestRoute } from '../../api/client-rest'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { AvisTypeId, AvisVisibilityId, getAvisNom } from 'camino-common/src/static/avisTypes'
import { AvisStatut } from '../_common/etape-statut'
import { dateFormat } from 'camino-common/src/date'
import { VisibilityLabel } from './etape-documents'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'

interface Props {
  etapeAvis: EtapeAvis[]
  user: User
}

type ColumnId = 'nom' | 'date' | 'statut' | 'visibility'
export const getAvisVisibilityLabel = (avisVisibility: AvisVisibilityId): string => {
  const value = {
    Public: VisibilityLabel.public,
    Administrations: VisibilityLabel.administrations,
    TitulairesEtAdministrations: VisibilityLabel.entreprises,
  } as const satisfies { [key in AvisVisibilityId]: string }

  return value[avisVisibility]
}

export const EtapeAvisTable: FunctionalComponent<Props> = props => {
  if (isNullOrUndefinedOrEmpty(props.etapeAvis)) {
    return null
  }

  const orderedAvis = [...props.etapeAvis].sort((a, b) => b.date.localeCompare(a.date))
  const columns: Column<ColumnId>[] = [
    { id: 'nom', contentTitle: 'Nom' },
    { id: 'date', contentTitle: 'Date' },
    { id: 'statut', contentTitle: 'Statut' },
  ]

  if (isSuper(props.user) || isAdministration(props.user)) {
    columns.push({ id: 'visibility', contentTitle: 'Visibilité' })
  }

  const rows: TableRow<ColumnId>[] = orderedAvis.map(avis => ({
    id: avis.id,
    link: null,
    columns: {
      nom: avis.has_file
        ? { type: 'jsx', jsxElement: <EtapeAvisLink avisId={avis.id} avisTypeId={avis.avis_type_id} description={avis.description} />, value: avis.avis_type_id }
        : { type: 'text', value: getAvisNom(avis.avis_type_id) },
      date: { type: 'text', value: dateFormat(avis.date) },
      statut: { type: 'jsx', jsxElement: <AvisStatut avisStatutId={avis.avis_statut_id} />, value: avis.avis_statut_id },
      visibility: { type: 'text', value: getAvisVisibilityLabel(avis.avis_visibility_id) },
    },
  }))

  return <TableSimple caption={{ value: 'Avis', visible: false }} columns={columns} rows={rows} />
}

type EtapeAvisLinkProps = { avisId: EtapeAvisId; avisTypeId: AvisTypeId; description: string | null }
const EtapeAvisLink: FunctionalComponent<EtapeAvisLinkProps> = props => {
  const label = isNotNullNorUndefinedNorEmpty(props.description) ? props.description : getAvisNom(props.avisTypeId)
  return (
    <a href={getDownloadRestRoute('/download/avisDocument/:etapeAvisId', { etapeAvisId: props.avisId })} title={`Télécharger l'avis ${label} - nouvelle fenêtre`} target="_blank">
      {label}
    </a>
  )
}
