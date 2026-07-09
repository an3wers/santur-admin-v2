import {
  Chart,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Однократная tree-shakeable регистрация нужных частей Chart.js.
// Импортируется обёртками LineChart/BarChart.
let registered = false

export function registerCharts() {
  if (registered) return
  Chart.register(
    LineController,
    BarController,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Filler
  )
  registered = true
}
