import { CaminoRoutePaths } from '@/router'
import { FunctionalComponent, AnchorHTMLAttributes } from 'vue'

type Props = {
  to: CaminoRoutePaths
  title: string
  render: () => JSX.Element
} & AnchorHTMLAttributes
export const Navigation: FunctionalComponent<Props> = (props: Props) => {
  const Children = props.render

  return (
    <router-link title={props.title} aria-label={props.title} to={props.to}>
      <Children />
    </router-link>
  )
}
