import { caminoDefineComponent, useState } from '@/utils/vue-tsx-utils'
import { InputDate } from '../_ui/input-date'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { watch, computed, DeepReadonly, FunctionalComponent } from 'vue'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { TypeEdit } from './type-edit'
import { DemarcheId } from 'camino-common/src/demarche'
import { ApiClient } from '../../api/api-client'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'

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
export const DateTypeEdit = caminoDefineComponent<Props>(['etape', 'demarcheId', 'apiClient', 'completeUpdate'], (props) => {

  const [date, setDate] = useState(props.etape.date)
  const [typeStatut, setTypeStatut] = useState({etapeTypeId: props.etape.typeId, etapeStatutId: props.etape.statutId})


  watch(() => [date.value, typeStatut.value], () => {
    const complete = isNotNullNorUndefined(date.value) && isNotNullNorUndefined(typeStatut.value.etapeTypeId) && isNotNullNorUndefined(typeStatut.value.etapeStatutId)

    props.completeUpdate({id: props.etape.id, date: date.value, typeId: typeStatut.value.etapeTypeId, statutId: typeStatut.value.etapeStatutId}, complete)
  }, {immediate: true})



  const onDateChanged= (date: CaminoDate | null) => {
    if( isNotNullNorUndefined(date)){
      setDate(date)
    }
  }

  const onEtapeTypeChange= (etapeStatutId: EtapeStatutId| null, etapeTypeId: EtapeTypeId | null) => {
    if(isNotNullNorUndefined(etapeTypeId) && isNotNullNorUndefined(etapeStatutId)){
      setTypeStatut({etapeStatutId, etapeTypeId})
    }
  }

  return () => (
    <>
      <DateEdit date={props.etape.date} onDateChanged={onDateChanged} />
      <TypeEdit etape={{...props.etape, date: date.value}} demarcheId={props.demarcheId} apiClient={props.apiClient} onEtapeChange={onEtapeTypeChange} />
    </>
  )
})



type DateEditProps = {
  date: CaminoDate | null
  onDateChanged: (date: CaminoDate | null) => void
}

const DateEdit: FunctionalComponent<DateEditProps> = props => {
  return (
    <div class="tablet-blobs">
      <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        <h5>Date</h5>
      </div>
      <div class="tablet-blob-2-3">
        <InputDate dateChanged={props.onDateChanged} initialValue={props.date} class="mb-s" />
      </div>
    </div>
  )
}
