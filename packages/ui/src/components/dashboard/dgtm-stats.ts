import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import { SDOMZoneIds } from 'camino-common/src/static/sdom'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js'
import { nextColor } from '../_charts/utils'

const datasetParams = (index: number) => {
  return {
    fill: false,
    tension: 0.5,
    backgroundColor: nextColor(index),
    borderColor: nextColor(index)
  }
}

export const delaiChartConfiguration = (
  data: StatistiquesDGTM
): ChartConfiguration => {
  const chartData: ChartData = graphDelaiData(data)

  return {
    type: 'line',
    data: chartData,
    options: {
      plugins: {
        title: { display: true, text: "Délais d'instruction" },
        legend: {
          labels: {
            boxHeight: 0
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
      scales: {
        y: {
          display: true,
          title: {
            display: true,
            text: 'Mois'
          }
        }
      }
    }
  }
}

const graphDelaiData = (item: StatistiquesDGTM) => {
  const annees: CaminoAnnee[] = Object.keys(item.delais).filter(isAnnee)
  const datasets = []
  datasets.push({
    label: "Délai minimum d'instruction",
    data: annees.map(annee =>
      Math.round(Math.min(...item.delais[annee].delaiInstructionEnJours) / 30)
    ),
    ...datasetParams(0)
  })
  datasets.push({
    label: "Délai moyen d'instruction",
    data: annees.map(annee =>
      Math.round(
        item.delais[annee].delaiInstructionEnJours.reduce(
          (acc, current) => acc + current,
          0
        ) /
          item.delais[annee].delaiInstructionEnJours.length /
          30
      )
    ),
    ...datasetParams(1)
  })
  datasets.push({
    label: "Délai maximum d'instruction",
    data: annees.map(annee =>
      Math.round(Math.max(...item.delais[annee].delaiInstructionEnJours) / 30)
    ),
    ...datasetParams(2)
  })
  datasets.push({
    label: 'Délai minimum de CDM',
    data: annees.map(annee =>
      Math.round(
        Math.min(...item.delais[annee].delaiCommissionDepartementaleEnJours) /
          30
      )
    ),
    ...datasetParams(3)
  })
  datasets.push({
    label: 'Délai moyen de CDM',
    data: annees.map(annee =>
      Math.round(
        item.delais[annee].delaiCommissionDepartementaleEnJours.reduce(
          (acc, current) => acc + current,
          0
        ) /
          item.delais[annee].delaiCommissionDepartementaleEnJours.length /
          30
      )
    ),
    ...datasetParams(4)
  })
  datasets.push({
    label: 'Délai maximum de CDM',
    data: annees.map(annee =>
      Math.round(
        Math.max(...item.delais[annee].delaiCommissionDepartementaleEnJours) /
          30
      )
    ),
    ...datasetParams(5)
  })

  return {
    labels: annees,
    datasets
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
        title: {
          display: true,
          text: 'Titres déposés ou octroyés en zones du SDOM'
        },
        legend: {
          labels: {
            boxHeight: 0
          }
        }
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
  const datasets = [
    {
      label: 'Zone 0',
      data: annees.map(
        annee =>
          item.sdom[annee][SDOMZoneIds.Zone0].depose +
          item.sdom[annee][SDOMZoneIds.Zone0].octroye
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: '#0000ff',
      borderColor: '#0000ff'
    },
    {
      label: 'Zone 0 potentielle',
      data: annees.map(
        annee =>
          item.sdom[annee][SDOMZoneIds.Zone0Potentielle].depose +
          item.sdom[annee][SDOMZoneIds.Zone0Potentielle].octroye
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: '#ffffff',
      borderDash: [1, 5],
      borderColor: '#0000ff'
    },

    {
      label: 'Zone 1',
      data: annees.map(
        annee =>
          item.sdom[annee][SDOMZoneIds.Zone1].depose +
          item.sdom[annee][SDOMZoneIds.Zone1].octroye
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: '#00ff7f',
      borderColor: '#00ff7f'
    },

    {
      label: 'Zone 2',
      data: annees.map(
        annee =>
          item.sdom[annee][SDOMZoneIds.Zone2].depose +
          item.sdom[annee][SDOMZoneIds.Zone2].octroye
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: '#ffaa00',
      borderColor: '#ffaa00'
    },
    {
      label: 'Zone 3',
      data: annees.map(
        annee => item.sdom[annee][3].depose + item.sdom[annee][3].octroye
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: '#E0E0DD',
      borderColor: '#E0E0DD'
    }
  ]

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
