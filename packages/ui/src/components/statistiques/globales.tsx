import Loader from '../_ui/loader.vue'
import { statistiquesGlobales } from '@/api/statistiques'
import { defineComponent, onMounted, ref, FunctionalComponent } from 'vue'
import { QuantiteParMois, Statistiques } from 'camino-common/src/statistiques'

import type { ChartConfiguration } from 'chart.js'

import { ADMINISTRATION_TYPE_IDS_ARRAY, AdministrationTypeId, sortedAdministrationTypes } from 'camino-common/src/static/administrations'
import { ConfigurableChart } from '../_charts/configurable-chart'
import { numberFormat } from 'camino-common/src/number'
import styles from './statistiques.module.css'

const pieConfiguration = (data: ChartConfiguration<'pie'>['data']): ChartConfiguration<'pie'> => ({
  type: 'pie',
  data,
  options: {
    locale: 'fr-FR',
    aspectRatio: 1.33,
  },
})

const lineConfiguration = (data: ChartConfiguration<'line'>['data']): ChartConfiguration<'line'> => ({
  type: 'line',
  data,
  options: {
    locale: 'fr-FR',
    responsive: true,
    aspectRatio: 1.33,
    interaction: {
      mode: 'index',
      intersect: false,
    },
  },
})
const statsLineFormat = ({ stats, labelY }: { stats: QuantiteParMois[]; labelY: string }) =>
  stats.reduce<{
    labels: string[]
    datasets: {
      label: string
      data: number[]
      fill: 'start'
      tension: number
      backgroundColor: string
      borderColor: string
    }[]
  }>(
    (acc, stat) => {
      acc.labels.push(stat.mois)
      acc.datasets[0].data.push(stat.quantite)

      return acc
    },
    {
      labels: [],
      datasets: [
        {
          label: labelY,
          data: [],
          fill: 'start',
          tension: 0.5,
          backgroundColor: 'rgba(118, 182, 189, 0.2)',
          borderColor: 'rgb(118, 182, 189)',
        },
      ],
    }
  )
export const Globales = defineComponent({
  setup() {
    const statistiques = ref<Statistiques | null>(null)

    onMounted(async () => {
      try {
        statistiques.value = await statistiquesGlobales()
      } catch (e) {}
    })

    return () => (
      <>
        {statistiques.value ? (
          <div class="content">
            <PureGlobales statistiques={statistiques.value} />
          </div>
        ) : (
          <Loader class="content" />
        )}
      </>
    )
  },
})

interface Props {
  statistiques: Statistiques
}

export const PureGlobales: FunctionalComponent<Props> = props => {
  const recherchesStats = props.statistiques.recherches

  const recherches = recherchesStats[recherchesStats.length - 1].quantite

  const utilisateursAdmin = Object.keys(props.statistiques.utilisateurs.rattachesAUnTypeDAdministration)
    .filter((value: string): value is AdministrationTypeId => ADMINISTRATION_TYPE_IDS_ARRAY.includes(value))
    .filter(value => value !== 'ope')
    .reduce((value: number, adminTypeId: AdministrationTypeId) => value + props.statistiques.utilisateurs.rattachesAUnTypeDAdministration[adminTypeId], 0)

  const totalUtilisateurs = utilisateursAdmin + props.statistiques.utilisateurs.rattachesAUneEntreprise + props.statistiques.utilisateurs.visiteursAuthentifies

  const utilisateurs = {
    labels: ['Utilisateurs avec un compte "Entreprise"', 'Utilisateurs avec un compte "Administration"', 'Utilisateurs par défaut'],
    datasets: [
      {
        label: 'Utilisateurs',
        data: [props.statistiques.utilisateurs.rattachesAUneEntreprise, utilisateursAdmin, props.statistiques.utilisateurs.visiteursAuthentifies],
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
        hoverOffset: 4,
      },
    ],
  }

  const adminSansOperateurs = sortedAdministrationTypes.filter(({ id }) => id !== 'ope')
  const labelsAdministrations = adminSansOperateurs.map(admin => admin.nom)
  const data = adminSansOperateurs.map(admin => props.statistiques.utilisateurs.rattachesAUnTypeDAdministration[admin.id])
  const utilisateursAdminChart = {
    labels: labelsAdministrations,
    datasets: [
      {
        label: 'Administrations',
        data,
        backgroundColor: ['rgba(255, 99, 132)', 'rgba(54, 162, 235)', 'rgba(255, 206, 86)', 'rgba(75, 192, 192)', 'rgba(153, 102, 255)', 'rgba(255, 159, 64)'],
        hoverOffset: 4,
      },
    ],
  }

  const titresModifiesStats = props.statistiques.titresModifies
  const titresModifies = titresModifiesStats[titresModifiesStats.length - 1].quantite

  return (
    <div>
      <div id="engagement" class="mb-xxl">
        <h2 class="mt">Engagement général sur le site</h2>
        <span class="separator" />
        <p class="mb-xl">Les données retenues ici témoignent du comportement général des utilisateurs sur le site et de leur engagement auprès du service</p>
        <div class="tablet-float-blobs clearfix">
          <div class="tablet-float-blob-1-3">
            <div class="mb-xl mt">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(recherches)}</p>
              <p class="bold text-center">recherches effectuées le mois dernier</p>
              <p>Le nombre de recherches mensuelles est l'indicateur clé de l'utilisation du service de "cadastre minier"</p>
            </div>

            <div class="mb-xl">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{Math.round(props.statistiques.actions)}</p>
              <p class="bold text-center">nombre moyen d'actions effectuées par utilisateur</p>
            </div>

            <div class="mb-xl">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.sessionDuree} min</p>
              <p class="bold text-center">temps de session moyen par utilisateur</p>
            </div>
          </div>
          <div class="tablet-float-blob-2-3 mb-xxl">
            <ConfigurableChart
              chartConfiguration={lineConfiguration(
                statsLineFormat({
                  stats: props.statistiques.recherches,
                  labelY: 'recherches',
                })
              )}
            />
          </div>
        </div>
      </div>
      <div id="utilisateurs" class="mb-xxl content">
        <h2>Les différents profils des utilisateurs de Camino</h2>
        <span class="separator" />
        <div class="tablet-float-blobs clearfix">
          <div class="tablet-float-blob-1-3">
            <div class="mb-xl mt">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(totalUtilisateurs)}</p>
              <p class="bold text-center">utilisateurs sur la plateforme</p>
            </div>
            <div class="mb-xl mt">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(props.statistiques.utilisateurs.rattachesAUneEntreprise)}</p>
              <p class="bold text-center">utilisateurs affiliés à une Entreprise</p>
            </div>

            <div class="mb-xl mt">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(utilisateursAdmin)}</p>
              <p class="bold text-center">utilisateurs rattachés à un compte Administration</p>
            </div>
          </div>
          <div class="tablet-float-blob-2-3 mb-xxl flex" style="justify-content: center">
            <div style="width: 70%">
              <ConfigurableChart chartConfiguration={pieConfiguration(utilisateurs)} />
            </div>
          </div>
        </div>
      </div>
      <div id="administrations" class="mb-xxl content">
        <h2>Répartition des différentes administrations sur Camino</h2>
        <span class="separator" />
        <div class="tablet-float-blobs clearfix">
          <div class="tablet-float-blob-1-3">
            <div class="mb-xl mt">
              <p class={['fr-display--xs', styles['donnee-importante']]}>{numberFormat(utilisateursAdmin)}</p>
              <p class="bold text-center">utilisateurs rattachés à un compte Administration</p>
            </div>
          </div>
          <div class="tablet-float-blob-2-3 flex" style="justify-content: center">
            <div style="width: 70%">
              <ConfigurableChart chartConfiguration={pieConfiguration(utilisateursAdminChart)} />
            </div>
          </div>
        </div>
      </div>
      <div id="amelioration" class="mb-xxl content">
        <h2>Amélioration continue et accès aux données publiques</h2>
        <span class="separator" />
        <p class="mb-xl">En tant que secteur régulé par l'État, la publication en ligne des données minières doit permettre leur amélioration et leur utilisation par la communauté</p>
        <div class="tablet-float-blobs clearfix">
          <div class="tablet-float-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{titresModifies}</p>
            <p class="bold text-center">mise à jour de titres miniers par l'administration et les entreprises du secteur le mois dernier</p>
            <p>
              Le nombre de mises à jour mensuelles du cadastre par les différents services de l'administration ou par les professionnels du secteur reflète l'intensité de l'activité d'instruction et
              administrative sur le domaine minier en France. Une mise à jour peut être l'ajout d'un titre, une modification de son statut ou des documents concernant son instruction.
            </p>
          </div>
          <div class="tablet-float-blob-2-3 mb-xxl">
            <ConfigurableChart
              chartConfiguration={lineConfiguration(
                statsLineFormat({
                  stats: props.statistiques.titresModifies,
                  labelY: 'titres modifiés',
                })
              )}
            />
          </div>
        </div>
        <div class="desktop-blobs">
          <div class="desktop-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.telechargements}</p>
            <p class="bold text-center">téléchargements de pièces relatives à la bonne instruction des titres et autorisations miniers le mois dernier</p>
          </div>
          <div class="desktop-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.signalements}</p>
            <p class="bold text-center">erreurs corrigées sur les bases de données de l'État grâce à la participation des utilisateurs</p>
          </div>
          <div class="desktop-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.reutilisations}</p>
            <p class="bold text-center">réutilisations connues des données ouvertes distribuées</p>
          </div>
        </div>
      </div>

      <div id="gains" class="mb-xxl">
        <h2>Gains de la dématérialisation sur l'instruction minière</h2>
        <span class="separator" />
        <p>La dématérialisation des démarches relatives à l'instruction minière doit permettre un gain de temps pour ceux qui les effectuent et ceux qui les instruisent</p>
        <div class="desktop-blobs">
          <div class="desktop-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.demarches}</p>
            <p class="bold text-center">démarches effectuées en ligne cette année</p>
          </div>
          <div class="desktop-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.titresActivitesBeneficesEntreprise}</p>
            <p class="bold text-center">jours de travail sans valeur ajoutée économisés par les entreprises en Guyane</p>
            <p>
              La dématérialisation d’un rapport trimestriel d’activité de production d’or en Guyane permet en moyenne l’économie de 2 heures de travail de saisie ou de déplacement pour son dépôt
              physique à l’administration.
            </p>
          </div>
          <div class="desktop-blob-1-3 mb-xl">
            <p class={['fr-display--xs', styles['donnee-importante']]}>{props.statistiques.titresActivitesBeneficesAdministration}</p>
            <p class="bold text-center">jours de travail à faible valeur ajoutée économisés par l’administration</p>
            <p>
              La dématérialisation d’un rapport trimestriel d’activité de production d’or en Guyane permet en moyenne l’économie d’une heure de travail de traitement et re-saisie de données par un
              agent de l’administration. Le gain de temps est réinvesti sur l’accompagnement et le contrôle de l’activité.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
