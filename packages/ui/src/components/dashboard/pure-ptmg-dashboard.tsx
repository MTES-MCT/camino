import { defineComponent, onMounted, ref } from 'vue'
import { TableAuto } from '../_ui/table-auto'

import { nomColumn, nomCell, referencesColumn, statutColumn, titulairesColumn, statutCell, referencesCell, titulairesCell } from '@/components/titres/table-utils'
import { CommonTitrePTMG } from 'camino-common/src/titres'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { ComponentColumnData, TableRow, TextColumnData } from '../_ui/table'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export interface Props {
  getPtmgTitres: () => Promise<CommonTitrePTMG[]>
}
const columns = [nomColumn, statutColumn, referencesColumn, titulairesColumn] as const
type Columns = (typeof columns)[number]['id']

const titresLignesBuild = (titres: CommonTitrePTMG[]): TableRow<Columns>[] => {
  return titres.map(titre => {
    const columns: { [key in Columns]: ComponentColumnData | TextColumnData } = {
      nom: nomCell(titre),
      statut: statutCell(titre),
      references: referencesCell(titre),
      titulaires: titulairesCell(titre),
    }
    return {
      id: titre.id,
      link: { name: 'titre', params: { id: titre.slug } },
      columns,
    }
  })
}

export const PurePTMGDashboard = caminoDefineComponent<Props>(['getPtmgTitres'], props => {
  const data = ref<
    AsyncData<{
      ptmgTitres: TableRow[]
      ptmgTitresBloques: TableRow[]
    }>
  >({ status: 'LOADING' })

  const initialColumnId = columns[1].id
  onMounted(async () => {
    try {
      const titres = await props.getPtmgTitres()
      const ptmgTitres = titresLignesBuild(titres.filter(titre => !titre.enAttenteDePTMG))

      const ptmgTitresBloques = titresLignesBuild(titres.filter(titre => titre.enAttenteDePTMG))

      data.value = {
        status: 'LOADED',
        value: { ptmgTitres, ptmgTitresBloques },
      }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  })
  return () => (
    <div>
      <div class="desktop-blobs">
        <div class="desktop-blob-2-3">
          <h1 class="mt-xs mb-xxl">Tableau de bord PTMG</h1>
        </div>
      </div>

      <LoadingElement
        data={data.value}
        renderItem={item => (
          <>
            {item.ptmgTitresBloques.length ? (
              <>
                <div class="line-neutral width-full mb-l"></div>
                <h3>ARM en attente</h3>
                <TableAuto class="mb-xxl" columns={columns.slice(0, 5)} rows={item.ptmgTitresBloques} initialSort={{ column: initialColumnId, order: 'asc' }} />
              </>
            ) : null}
            <div class="line-neutral width-full mb-l"></div>
            <h3>ARM en cours d’instruction</h3>
            <TableAuto columns={columns} rows={item.ptmgTitres} initialSort={{ column: initialColumnId, order: 'asc' }} class="width-full-p" />
          </>
        )}
      />
    </div>
  )
})
