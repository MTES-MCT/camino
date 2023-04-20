import { GroupeBuildPoint } from '@/utils/titre-etape-edit'
import { numberFormat } from 'camino-common/src/number'
import { FunctionalComponent } from 'vue'

interface Props {
  references?: { x?: string; y?: string } | string | GroupeBuildPoint['references']
}

const round = (v: string): number => {
  return Math.round(Number.parseFloat(v) * 1000000) / 1000000
}

const pointReference = (props: Props) => {
  if (props.references && typeof props.references !== 'string' && 'x' in props.references && props.references.x && props.references.y) {
    return [numberFormat(round(props.references.x)), numberFormat(round(props.references.y))]
  }

  return ['–', '–']
}
export const PointReference: FunctionalComponent<Props> = props => {
  const reference = pointReference(props)

  return (
    <div class="blobs-packed mb-s">
      <div class="blob-packed-1-2 border-l px-s">
        <p class="h6 flex my-xxs">
          <span class="flex-right mono bold">{reference[0]}</span>
        </p>
      </div>
      <div class="blob-packed-1-2 border-l px-s">
        <p class="h6 flex my-xxs">
          <span class="flex-right mono bold">{reference[1]}</span>
        </p>
      </div>
    </div>
  )
}
