import { FunctionalComponent, AnchorHTMLAttributes } from 'vue'
import { RouteLocationRaw, Router } from 'vue-router'

type Props = {
  router: Router
  to: RouteLocationRaw
  title: string
  render: () => JSX.Element
} & AnchorHTMLAttributes
export const Navigation: FunctionalComponent<Props> = (props: Props) => {
  const Children = props.render
  return (
    <a title={props.title} aria-label={props.title} onClick={() => props.router.push(props.to)}>
      <Children />
    </a>
  )
}
