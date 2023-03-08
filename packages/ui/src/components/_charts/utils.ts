export const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
  black: 'rgb(0, 0, 0)',
} as const

type ChartColor = (typeof CHART_COLORS)[keyof typeof CHART_COLORS]

const chartColors: readonly ChartColor[] = Object.values(CHART_COLORS)

export const nextColor = (index: number): ChartColor => {
  return chartColors[index % chartColors.length]
}
