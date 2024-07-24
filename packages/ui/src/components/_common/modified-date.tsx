import { CaminoDate, dateFormat } from 'camino-common/src/date'
import { DsfrIcon } from '../_ui/icon'
import { JSX } from 'vue/jsx-runtime'
import { HTMLAttributes } from 'vue'

export const ModifiedDate = (props: { modified_date: CaminoDate } & Pick<HTMLAttributes, 'class'>): JSX.Element => {
  return (
    <div>
      <DsfrIcon name="fr-icon-calendar-line" class="fr-mr-1w" size="sm" color="text-title-blue-france" aria-hidden="true" />
      Modifié le {dateFormat(props.modified_date)}
    </div>
  )
}
