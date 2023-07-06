import { markRaw } from 'vue'
import { List } from '../_ui/list'
import { Statut } from '../_common/statut'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'

const activitesColonnes = [
  {
    id: 'titre',
    name: 'Titre',
  },
  {
    id: 'titulaires',
    name: 'Titulaires',
    class: ['min-width-10'],
  },
  {
    id: 'annee',
    name: 'Année',
  },
  {
    id: 'periode',
    name: 'Période',
  },
  {
    id: 'statut',
    name: 'Statut',
    class: ['min-width-5'],
  },
]

const activitesLignesBuild = activites =>
  activites.map(activite => {
    const activiteStatut = ActivitesStatuts[activite.activiteStatutId]
    const columns = {
      titre: { value: activite.titre.nom },
      titulaires: {
        component: markRaw(List),
        props: {
          elements: activite.titre.titulaires.map(({ nom }) => nom),
          mini: true,
        },
        class: 'mb--xs',
        value: activite.titre.titulaires.map(({ nom }) => nom).join(', '),
      },
      annee: { value: activite.annee },
      periode: {
        value: getPeriode(activite.type.frequenceId, activite.periodeId),
      },
      statut: {
        component: markRaw(Statut),
        props: {
          color: activiteStatut.couleur,
          nom: activiteStatut.nom,
        },
        value: activiteStatut.nom,
      },
    }

    return {
      id: activite.id,
      link: { name: 'activite', params: { id: activite.slug } },
      columns,
    }
  })

export { activitesColonnes, activitesLignesBuild }
