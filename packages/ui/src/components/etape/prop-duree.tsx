import { FunctionalComponent } from 'vue'

interface Props {
  duree?: number
}
export const PropDuree: FunctionalComponent<Props> = props => {
  const ans = props.duree ? Math.floor(props.duree / 12) : null
  const mois = props.duree ? Math.floor(props.duree % 12) : null

  return (
    <span>
      {ans ? <span>{`${ans} an${ans > 1 ? 's' : ''}`}</span> : null}
      {ans && mois ? <span> et </span> : null}
      {mois ? <span>{`${mois} mois`}</span> : null}
    </span>
  )
}
