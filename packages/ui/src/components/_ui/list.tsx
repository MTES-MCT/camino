import { FunctionalComponent } from 'vue'

interface Props {
  elements?: string[]
  mini?: boolean
}
export const List: FunctionalComponent<Props> = props => {
  return (
    <span class="dsfr">
      <ul>
        {props.elements?.map(element => (
          <li key={element} class={[props.mini ?? false ? 'fr-text--xs' : null]}>
            {element}
          </li>
        ))}
      </ul>
    </span>
  )
}
