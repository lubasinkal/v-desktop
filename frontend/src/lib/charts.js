import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// Global defaults for dark theme
Chart.defaults.color = '#949494'
Chart.defaults.borderColor = '#313131'

export function createLineChart(canvas, labels, datasets, options = {}) {
  return new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 8,
            font: { size: 10, family: 'Space Mono, monospace' },
            color: '#949494',
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#313131', display: true },
          ticks: { font: { size: 10, family: 'JetBrains Mono, monospace' }, color: '#949494' },
        },
        y: {
          beginAtZero: false,
          grid: { color: '#313131', display: true },
          ticks: { font: { size: 10, family: 'JetBrains Mono, monospace' }, color: '#949494' },
        },
        y1: {
          beginAtZero: false,
          position: 'right',
          grid: { display: false },
          ticks: { font: { size: 10, family: 'JetBrains Mono, monospace' }, color: '#949494' },
        },
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
        backgroundColor: color || 'rgba(60, 255, 208, 0.4)',
        borderColor: color || '#3cffd0',
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
        x: {
          grid: { display: false },
          ticks: { font: { size: 9, family: 'JetBrains Mono, monospace' }, color: '#949494' },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#313131' },
          ticks: { font: { size: 9, family: 'JetBrains Mono, monospace' }, color: '#949494' },
        },
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
