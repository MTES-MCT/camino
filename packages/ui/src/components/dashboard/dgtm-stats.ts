import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import { SDOMZoneIds } from 'camino-common/src/static/sdom'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { ChartConfiguration, ChartData } from 'chart.js'
import { nextColor } from '../_charts/utils'

export const datasetParams = (index: number) => {
  return {
    fill: false,
    tension: 0.5,
    backgroundColor: nextColor(index),
    borderColor: nextColor(index)
  }
}

export const depotChartConfiguration = (
  data: StatistiquesDGTM
): ChartConfiguration => {
  const chartData: ChartData = graphDepoData(data)
  return {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        title: { display: true, text: 'Titres et AEX' },
        tooltip: {
          callbacks: {
            footer: tooltipItems => {
              let sumDepot = 0
              let sumOctroi = 0

              tooltipItems.forEach(function (tooltipItem) {
                if (tooltipItem.dataset.stack === 'octroi') {
                  sumOctroi += tooltipItem.parsed.y
                }
                if (tooltipItem.dataset.stack === 'depot') {
                  sumDepot += tooltipItem.parsed.y
                }
              })
              return `Total titres déposés: ${sumDepot} \nTotal titres octroyés: ${sumOctroi}`
            }
          }
        }
      },
      locale: 'fr-FR',
      aspectRatio: 1.33,
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: { x: { stacked: true }, y: { stacked: true } }
    }
  }
}
export const sdomChartConfiguration = (
  data: StatistiquesDGTM
): ChartConfiguration => {
  const chartData: ChartData = graphSdomData(data)

  return {
    type: 'line',
    data: chartData,
    options: {
      plugins: {
        title: { display: true, text: 'Titres en zones du SDOM' }
      },
      locale: 'fr-FR',
      aspectRatio: 1.33,
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  }
}
const graphSdomData = (item: StatistiquesDGTM): ChartData => {
  const annees: CaminoAnnee[] = Object.keys(item.sdom).filter(isAnnee)
  const datasets = []
  datasets.push({
    label: 'Déposés ou octroyés en zone 0',
    data: annees.map(
      annee =>
        item.sdom[annee][SDOMZoneIds.Zone0].depose +
        item.sdom[annee][SDOMZoneIds.Zone0].octroye
    ),
    ...datasetParams(0)
  })
  datasets.push({
    label: 'Déposés ou octroyés en zone 0 potentielle',
    data: annees.map(
      annee =>
        item.sdom[annee][SDOMZoneIds.Zone0Potentielle].depose +
        item.sdom[annee][SDOMZoneIds.Zone0Potentielle].octroye
    ),
    ...datasetParams(1)
  })

  datasets.push({
    label: 'Déposés ou octroyés en zone 1',
    data: annees.map(
      annee =>
        item.sdom[annee][SDOMZoneIds.Zone1].depose +
        item.sdom[annee][SDOMZoneIds.Zone1].octroye
    ),
    ...datasetParams(2)
  })

  datasets.push({
    label: 'Déposés ou octroyés en zone 2',
    data: annees.map(
      annee =>
        item.sdom[annee][SDOMZoneIds.Zone2].depose +
        item.sdom[annee][SDOMZoneIds.Zone2].octroye
    ),
    ...datasetParams(3)
  })

  return {
    labels: annees,
    datasets
  }
}

const graphDepoData = (item: StatistiquesDGTM): ChartData => {
  const annees: CaminoAnnee[] = Object.keys(item.depotEtInstructions).filter(
    isAnnee
  )
  const datasets = [
    {
      label: 'AEX déposés',
      data: annees.map(
        annee => item.depotEtInstructions[annee].totalAXMDeposees
      ),
      stack: 'depot',
      ...datasetParams(0)
    },
    {
      label: 'Autres titres déposés',
      data: annees.map(
        annee =>
          item.depotEtInstructions[annee].totalTitresDeposes -
          item.depotEtInstructions[annee].totalAXMDeposees
      ),
      stack: 'depot',
      ...datasetParams(1)
    },
    {
      label: 'AEX octroyés',
      data: annees.map(
        annee => item.depotEtInstructions[annee].totalAXMOctroyees
      ),
      stack: 'octroi',
      ...datasetParams(2)
    },
    {
      label: 'Autres titres octroyés',
      data: annees.map(
        annee =>
          item.depotEtInstructions[annee].totalTitresOctroyes -
          item.depotEtInstructions[annee].totalAXMOctroyees
      ),
      stack: 'octroi',
      ...datasetParams(3)
    }
  ]

  return {
    labels: annees,
    datasets
  }
}