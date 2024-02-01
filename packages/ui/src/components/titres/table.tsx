import { FunctionalComponent } from 'vue'
import { TableAuto } from '../_ui/table-auto'
import { titresColonnes, titresLignesBuild } from './table-utils'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { User } from 'camino-common/src/roles'
import { TitreEntreprise } from 'camino-common/src/entreprise'

interface Props {
  titres: TitreEntreprise[]
  user: User
  caption: string
}

export const TitresTable: FunctionalComponent<Props> = props => {
  const accessActivites = canReadActivites(props.user)

  const colonnes = titresColonnes.filter(({ id }) => (accessActivites ? true : id !== 'activites'))

  const lignes = titresLignesBuild(props.titres, accessActivites)

  return (
    <div class="dsfr">
      <TableAuto caption={props.caption} columns={colonnes} rows={lignes} class="width-full-p" initialSort={'firstColumnAsc'} />
    </div>
  )
}
