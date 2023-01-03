import { FunctionalComponent } from 'vue'
import { Tag } from './tag'

export interface Props {
  elements: string[]
}

export const TagList: FunctionalComponent<Props> = props => {
  return (
    <ul class="list-inline">
      {props.elements.map(element => {
        return (
          <li key={element} class="mr-xs mb-xs">
            <Tag class="lh-2" text={element} />
          </li>
        )
      })}
    </ul>
  )
}
