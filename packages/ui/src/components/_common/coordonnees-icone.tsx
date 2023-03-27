import { FunctionalComponent } from 'vue'
import { Icon } from '@/components/_ui/icon'

interface Props {
  coordonnees?: unknown
}
export const CoordonneesIcone: FunctionalComponent<Props> = props => {
  return (
    <>
      {props.coordonnees ? (
        <div class="p-xs">
          <Icon size="S" name="globe" />
        </div>
      ) : null}
    </>
  )
}
