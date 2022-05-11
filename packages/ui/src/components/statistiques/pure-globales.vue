<template>
  <div id="engagement" class="mb-xxl">
    <h2 class="mt">Engagement général sur le site</h2>
    <span class="separator" />
    <p class="mb-xl">
      Les données retenues ici témoignent du comportement général des
      utilisateurs sur le site et de leur engagement auprès du service
    </p>
    <div class="tablet-float-blobs clearfix">
      <div class="tablet-float-blob-1-3">
        <div class="mb-xl mt">
          <p class="h0 text-center">
            {{ numberFormatInternal(recherches) }}
          </p>
          <p class="bold text-center">recherches effectuées le mois dernier</p>
          <p>
            Le nombre de recherches mensuelles est l'indicateur clé de
            l'utilisation du service de "cadastre minier"
          </p>
        </div>

        <div class="mb-xl">
          <p class="h0 text-center">
            {{ Math.round(statistiques.actions) }}
          </p>
          <p class="bold text-center">
            nombre moyen d'actions effectuées par utilisateur
          </p>
        </div>

        <div class="mb-xl">
          <p class="h0 text-center">{{ statistiques.sessionDuree }} min</p>
          <p class="bold text-center">temps de session moyen par utilisateur</p>
        </div>
      </div>
      <div class="tablet-float-blob-2-3 mb-xxl">
        <LineChart
          :data="
            statsLineFormatInternal({
              stats: statistiques['recherches'],
              labelY: 'recherches',
              labelX: 'mois',
              id: 'quantite'
            })
          "
        />
      </div>
    </div>
  </div>
  <div id="utilisateurs" class="mb-xxl content">
    <h2>Les utilisateurs de Camino</h2>
    <span class="separator" />
    <div class="tablet-float-blobs clearfix">
      <div class="tablet-float-blob-1-3">
        <div class="mb-xl mt">
          <p class="h0 text-center">
            {{ numberFormatInternal(statistiques.utilisateurs.total) }}
          </p>
          <p class="bold text-center">utilisateurs enregistrés</p>
        </div>
        <div class="mb-xl mt">
          <p class="h0 text-center">
            {{
              numberFormatInternal(
                statistiques.utilisateurs.rattachesAUneEntreprise
              )
            }}
          </p>
          <p class="bold text-center">utilisateurs ayant une entreprise</p>
        </div>

        <div class="mb-xl mt">
          <p class="h0 text-center">
            {{ numberFormatInternal(utilisateursAdmin) }}
          </p>
          <p class="bold text-center">
            utilisateurs appartenant à une administration
          </p>
        </div>
      </div>
      <div class="tablet-float-blob-2-3 mb-xxl">
        <PieChart :data="utilisateurs" />
      </div>
    </div>
  </div>
  <div id="administrations" class="mb-xxl content">
    <h2>Les administrations de Camino</h2>
    <span class="separator" />
    <div class="tablet-float-blobs clearfix">
      <div class="tablet-float-blob-1-3">
        <div class="mb-xl mt">
          <p class="h0 text-center">
            {{ numberFormatInternal(utilisateursAdmin) }}
          </p>
          <p class="bold text-center">utilisateurs ayant une administration</p>
        </div>
      </div>
      <div class="tablet-float-blob-2-3 mb-xxl">
        <PieChart :data="utilisateursAdminChart" />
      </div>
    </div>
  </div>
  <div id="amelioration" class="mb-xxl content">
    <h2>Amélioration continue et accès aux données publiques</h2>
    <span class="separator" />
    <p class="mb-xl">
      En tant que secteur régulé par l'État, la publication en ligne des données
      minières doit permettre leur amélioration et leur utilisation par la
      communauté
    </p>
    <div class="tablet-float-blobs clearfix">
      <div class="tablet-float-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ titresModifies }}
        </p>
        <p class="bold text-center">
          mise à jour de titres miniers par l'administration et les entreprises
          du secteur le mois dernier
        </p>
        <p>
          Le nombre de mises à jour mensuelles du cadastre par les différents
          services de l'administration ou par les professionnels du secteur
          reflète l'intensité de l'activité d'instruction et administrative sur
          le domaine minier en France. Une mise à jour peut être l'ajout d'un
          titre, une modification de son statut ou des documents concernant son
          instruction.
        </p>
      </div>
      <div class="tablet-float-blob-2-3 mb-xxl">
        <LineChart
          :data="
            statsLineFormatInternal({
              stats: statistiques['titresModifies'],
              labelY: 'titres modifiés',
              labelX: 'mois',
              id: 'quantite'
            })
          "
        />
      </div>
    </div>
    <div class="desktop-blobs">
      <div class="desktop-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ statistiques.telechargements }}
        </p>
        <p class="bold text-center">
          téléchargements de pièces relatives à la bonne instruction des titres
          et autorisations miniers le mois dernier
        </p>
      </div>
      <div class="desktop-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ statistiques.signalements }}
        </p>
        <p class="bold text-center">
          erreurs corrigées sur les bases de données de l'État grâce à la
          participation des utilisateurs
        </p>
      </div>
      <div class="desktop-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ statistiques.reutilisations }}
        </p>
        <p class="bold text-center">
          réutilisations connues des données ouvertes distribuées
        </p>
      </div>
    </div>
  </div>

  <div id="gains" class="mb-xxl">
    <h2>Gains de la dématérialisation sur l'instruction minière</h2>
    <span class="separator" />
    <p>
      La dématérialisation des démarches relatives à l'instruction minière doit
      permettre un gain de temps pour ceux qui les effectuent et ceux qui les
      instruisent
    </p>
    <div class="desktop-blobs">
      <div class="desktop-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ statistiques.demarches }}
        </p>
        <p class="bold text-center">
          démarches effectuées en ligne cette année
        </p>
      </div>
      <div class="desktop-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ statistiques.titresActivitesBeneficesEntreprise }}
        </p>
        <p class="bold text-center">
          jours de travail sans valeur ajoutée économisés par les entreprises en
          Guyane
        </p>
        <p>
          La dématérialisation d’un rapport trimestriel d’activité de production
          d’or en Guyane permet en moyenne l’économie de 2 heures de travail de
          saisie ou de déplacement pour son dépôt physique à l’administration.
        </p>
      </div>
      <div class="desktop-blob-1-3 mb-xl">
        <p class="h0 text-center">
          {{ statistiques.titresActivitesBeneficesAdministration }}
        </p>
        <p class="bold text-center">
          jours de travail à faible valeur ajoutée économisés par
          l’administration
        </p>
        <p>
          La dématérialisation d’un rapport trimestriel d’activité de production
          d’or en Guyane permet en moyenne l’économie d’une heure de travail de
          traitement et re-saisie de données par un agent de l’administration.
          Le gain de temps est réinvesti sur l’accompagnement et le contrôle de
          l’activité.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LineChart from '../_charts/line.vue'
import PieChart from '../_charts/pie.vue'
import { numberFormat } from '@/utils/number-format'
import { statsLineFormat } from './_utils'
import { computed } from 'vue'
import { Statistiques } from 'camino-common/src/statistiques'
import {
  ADMINISTRATION_TYPE_IDS,
  ADMINISTRATION_TYPE_IDS_ARRAY,
  ADMINISTRATION_TYPES,
  AdministrationTypeId,
  sortedAdministrationTypes
} from 'camino-common/src/administrations'

const props = defineProps<{ statistiques: Statistiques }>()

const recherches = computed(() => {
  const recherchesStats = props.statistiques.recherches
  return recherchesStats[recherchesStats.length - 1].quantite
})

const utilisateursAdmin = computed(() => {
  return Object.keys(
    props.statistiques.utilisateurs.rattachesAUnTypeDAdministration
  )
    .filter((value: string): value is AdministrationTypeId =>
      ADMINISTRATION_TYPE_IDS_ARRAY.includes(value)
    )
    .reduce(
      (value: number, adminTypeId: AdministrationTypeId) =>
        value +
        props.statistiques.utilisateurs.rattachesAUnTypeDAdministration[
          adminTypeId
        ],
      0
    )
})

const utilisateurs = computed(() => {
  return {
    labels: ['Entreprises', 'Administrations', 'Défaut'],
    datasets: [
      {
        label: 'Utilisateurs',
        data: [
          props.statistiques.utilisateurs.rattachesAUneEntreprise,
          utilisateursAdmin.value,
          props.statistiques.utilisateurs.visiteursAuthentifies
        ],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }
    ]
  }
})

const labelsAdministrations = sortedAdministrationTypes.map(admin => admin.nom)
const utilisateursAdminChart = computed(() => {
  const data = sortedAdministrationTypes.map(
    admin =>
      props.statistiques.utilisateurs.rattachesAUnTypeDAdministration[admin.id]
  )
  return {
    labels: labelsAdministrations,
    datasets: [
      {
        label: 'Administrations',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132)',
          'rgba(54, 162, 235)',
          'rgba(255, 206, 86)',
          'rgba(75, 192, 192)',
          'rgba(153, 102, 255)',
          'rgba(255, 159, 64)'
        ],
        hoverOffset: 4
      }
    ]
  }
})

const titresModifies = computed(() => {
  const titresModifiesStats = props.statistiques.titresModifies
  return titresModifiesStats[titresModifiesStats.length - 1].quantite
})

const statistiques = computed(() => props.statistiques)

const statsLineFormatInternal = ({ stats, id, labelX, labelY }) => {
  return statsLineFormat({ stats, id, labelX, labelY })
}

const numberFormatInternal = (number: number): string => {
  return numberFormat(number)
}
</script>
