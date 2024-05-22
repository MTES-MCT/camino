import { FunctionalComponent } from 'vue'

type Props = {
  size?: 'sm' | 'md'
}
export const DsfrSeparator: FunctionalComponent<Props> = props => (
  <div class={[props.size === 'sm' ? 'fr-mb-1w fr-mt-1w' : 'fr-mb-3w fr-mt-3w']} style={{ height: '1px', width: '100%', backgroundColor: 'var(--grey-900-175)' }}></div>
)
