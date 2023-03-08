import { FunctionalComponent, HTMLAttributes } from 'vue'
import { LocationQuery } from 'vue-router'
import { Icon } from '../_ui/icon'
import { saveAs } from 'file-saver'

export type Props = {
  section: string
  format: string
  query: LocationQuery
  onClicked: () => void
  matomo?: { trackLink: (url: string, params: string) => void }
} & HTMLAttributes

async function download(props: Props) {
  props.onClicked()
  const query = new URLSearchParams({
    format: props.format,
    ...props.query,
  }).toString()

  const url = `/${props.section}?${query}`

  saveAs(`/apiUrl${url}`)

  if (props.matomo) {
    props.matomo.trackLink(`${window.location.origin}${url}`, 'download')
  }
}

export const Download: FunctionalComponent<Props> = props => {
  return (
    <button class="flex" onClick={() => download(props)}>
      <span class="mt-xxs">{props.format}</span>
      <div class="flex-right pl-xs">
        <Icon size="M" name="download" />
      </div>
    </button>
  )
}
