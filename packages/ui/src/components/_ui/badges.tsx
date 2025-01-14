import { FunctionalComponent } from 'vue'
import { Badge } from './badge'

interface Props {
  elements?: string[]
}
export const Badges: FunctionalComponent<Props> = props => {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>{props.elements?.map(element => <Badge systemLevel="new" ariaLabel={element} />)}</div>
}
