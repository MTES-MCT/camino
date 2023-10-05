import { Journal } from 'camino-common/src/journaux'
import { formatters } from 'jsondiffpatch-rc'
import 'jsondiffpatch-rc/dist/formatters-styles/html.css'
import { FunctionalComponent } from 'vue'
import styles from './differences.module.css'

interface Props {
  journal: { operation: Extract<Journal['operation'], 'create'>; elementId: Journal['elementId'] } | Pick<Journal, 'differences' | 'operation' | 'elementId'>
}
export const Differences: FunctionalComponent<Props> = props => {
  const differencesHtml =
    props.journal.operation !== 'create' && props.journal.differences ? formatters.html.format(props.journal.differences, null).replaceAll('jsondiffpatch-child-node-type-object', '') : ''

  return (
    <>
      {props.journal.operation === 'create' ? (
        <div>{props.journal.elementId}</div>
      ) : (
        <div class={['overflow-scroll-y', styles.differences]}>
          <div v-html={differencesHtml}></div>
        </div>
      )}
    </>
  )
}
