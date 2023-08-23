import { FunctionalComponent, ButtonHTMLAttributes } from 'vue'

type Props = {
  onClick: () => void
  title: string
  render: () => JSX.Element
  disabled?: boolean
} & ButtonHTMLAttributes
/**
 * @deprecated use DsfrButton
 */
export const Button: FunctionalComponent<Props> = (props: Props) => {
  const Children = props.render
  return (
    <button disabled={props.disabled ?? false} title={props.title} aria-label={props.title} onClick={props.onClick}>
      <Children />
    </button>
  )
}
