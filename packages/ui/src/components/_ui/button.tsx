import { FunctionalComponent, ButtonHTMLAttributes } from 'vue'

type Props = {
  onClick: () => void
  title: string
  render: () => JSX.Element
} & ButtonHTMLAttributes
export const Button: FunctionalComponent<Props> = (props: Props) => {
  const Children = props.render
  return (
    <button title={props.title} aria-label={props.title} onClick={props.onClick}>
      <Children />
    </button>
  )
}
