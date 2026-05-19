import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export function createLineChart(canvas, labels, datasets, options = {}) {
  return new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: false },
      },
      ...options,
    },
  })
}

export function createBarChart(canvas, labels, data, label, color) {
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: color || 'rgba(59, 130, 246, 0.7)',
        borderColor: color || 'rgb(59, 130, 246)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true },
      },
    },
  })
}

export function destroyChart(chart) {
  if (chart) {
    chart.destroy()
    chart = null
  }
}
