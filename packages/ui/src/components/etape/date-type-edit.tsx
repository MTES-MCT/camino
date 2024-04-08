import { caminoDefineComponent, useState } from '@/utils/vue-tsx-utils'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { watch, DeepReadonly } from 'vue'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TypeEdit } from './type-edit'
import { DemarcheId } from 'camino-common/src/demarche'
import { ApiClient } from '../../api/api-client'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { DsfrInput } from '../_ui/dsfr-input'

export type EtapeDateTypeEdit = DeepReadonly<{
  statutId: EtapeStatutId | null
  typeId: EtapeTypeId | null
  id: EtapeId | null | undefined
  date: CaminoDate
}>

export interface Props {
  etape: EtapeDateTypeEdit
  demarcheId: DemarcheId
  apiClient: Pick<ApiClient, 'getEtapesTypesEtapesStatuts'>
  completeUpdate: (etape: Props['etape'], complete: boolean) => void
}
export const DateTypeEdit = caminoDefineComponent<Props>(['etape', 'demarcheId', 'apiClient', 'completeUpdate'], props => {
  const [date, setDate] = useState(props.etape.date)
  const [typeStatut, setTypeStatut] = useState({ etapeTypeId: props.etape.typeId, etapeStatutId: props.etape.statutId })

  watch(
    () => [date.value, typeStatut.value],
    () => {
      const complete = isNotNullNorUndefined(date.value) && isNotNullNorUndefined(typeStatut.value.etapeTypeId) && isNotNullNorUndefined(typeStatut.value.etapeStatutId)

      props.completeUpdate({ id: props.etape.id, date: date.value, typeId: typeStatut.value.etapeTypeId, statutId: typeStatut.value.etapeStatutId }, complete)
    },
    { immediate: true }
  )

  const onDateChanged = (date: CaminoDate | null) => {
    if (isNotNullNorUndefined(date)) {
      setDate(date)
    }
  }

  const onEtapeTypeChange = (etapeStatutId: EtapeStatutId | null, etapeTypeId: EtapeTypeId | null) => {
    if (isNotNullNorUndefined(etapeTypeId) && isNotNullNorUndefined(etapeStatutId)) {
      setTypeStatut({ etapeStatutId, etapeTypeId })
    }
  }

  return () => (
    <>
      <DsfrInput type={{ type: 'date' }} valueChanged={onDateChanged} initialValue={props.etape.date} legend={{ main: 'Date' }} />
      <TypeEdit etape={{ ...props.etape, date: date.value }} demarcheId={props.demarcheId} apiClient={props.apiClient} onEtapeChange={onEtapeTypeChange} />
    </>
  )
})
