import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Tag } from './tag'

type Props = {
  elements: string[]
} & HTMLAttributes

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
