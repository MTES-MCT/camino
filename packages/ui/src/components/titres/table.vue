<template>
  <TableAuto :columns="colonnes" :rows="lignes" class="width-full-p" />
</template>

<script>
import { TableAuto } from '../_ui/table-auto'

import { titresColonnes, titresLignesBuild } from './table-utils'
import { canReadActivites } from 'camino-common/src/permissions/activites'
export default {
  name: 'Titres',

  components: { TableAuto },

  props: {
    titres: { type: Array, required: true }
  },

  computed: {
    activitesCol() {
      const user = this.$store.state.user.element

      return canReadActivites(user)
    },

    colonnes() {
      return titresColonnes.filter(({ id }) =>
        this.activitesCol ? true : id !== 'activites'
      )
    },

    lignes() {
      return titresLignesBuild(this.titres, this.activitesCol)
    }
  }
}
</script>
