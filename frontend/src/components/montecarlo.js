import { destroyChart, createLineChart } from '../lib/charts.js'

let pathChart = null
let distChart = null

export function init(container) {
  container.innerHTML = `
    <h2>Monte Carlo Simulation</h2>
    <div class="calc-grid">
      <div class="card">
        <div class="field"><label>Model</label>
          <select id="mc-model">
            <option value="gbm">Geometric Brownian Motion</option>
            <option value="vasicek">Vasicek Mean-Reverting</option>
          </select>
        </div>
        <div class="field"><label>Initial Rate</label><input id="mc-init" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>Drift / Long-Term Mean</label><input id="mc-mean" type="number" value="0.05" step="0.001"></div>
        <div class="field"><label>Mean Reversion Speed (Vasicek)</label><input id="mc-rev" type="number" value="0.5" step="0.01"></div>
        <div class="field"><label>Volatility</label><input id="mc-vol" type="number" value="0.02" step="0.001"></div>
        <div class="field"><label>Number of Paths</label><input id="mc-paths" type="number" value="10000"></div>
        <div class="field"><label>Steps</label><input id="mc-steps" type="number" value="10"></div>
        <div class="field"><label>dt</label><input id="mc-dt" type="number" value="1.0" step="0.1"></div>
        <div class="field"><label>Seed (0 = random)</label><input id="mc-seed" type="number" value="42"></div>
        <button onclick="window._mcRun()">Run Simulation</button>
      </div>
      <div class="card" id="mc-results-card">
        <h3>Summary Statistics</h3>
        <div id="mc-stats"></div>
        <button onclick="window._mcComputeRisk()">Compute Risk Metrics</button>
        <div id="mc-risk-result"></div>
      </div>
    </div>
    <div class="card">
      <div class="chart-row">
        <div class="chart-wrap"><canvas id="mc-path-chart"></canvas></div>
        <div class="chart-wrap"><canvas id="mc-dist-chart"></canvas></div>
      </div>
    </div>`

  window._mcRun = async () => {
    const model = document.getElementById('mc-model').value
    const req = {
      model,
      initialRate: parseFloat(document.getElementById('mc-init').value),
      drift: parseFloat(document.getElementById('mc-mean').value),
      volatility: parseFloat(document.getElementById('mc-vol').value),
      longTermMean: parseFloat(document.getElementById('mc-mean').value),
      meanReversion: parseFloat(document.getElementById('mc-rev').value),
      numPaths: parseInt(document.getElementById('mc-paths').value),
      steps: parseInt(document.getElementById('mc-steps').value),
      dt: parseFloat(document.getElementById('mc-dt').value),
      seed: parseInt(document.getElementById('mc-seed').value),
    }
    try {
      const resp = model === 'gbm'
        ? await window.go.main.App.RunGBM(req)
        : await window.go.main.App.RunVasicek(req)

      const fv = resp.finalValues
      let min = Infinity, max = -Infinity, sum = 0
      fv.forEach(v => { min = Math.min(min, v); max = Math.max(max, v); sum += v })
      const mean = sum / fv.length
      let sqSum = 0
      fv.forEach(v => sqSum += (v - mean) ** 2)
      const std = Math.sqrt(sqSum / fv.length)

      document.getElementById('mc-stats').innerHTML =
        `Paths: ${fv.length.toLocaleString()}<br>
         Mean: <strong>${mean.toFixed(4)}</strong><br>
         Std Dev: <strong>${std.toFixed(4)}</strong><br>
         Min: ${min.toFixed(4)}<br>
         Max: ${max.toFixed(4)}<br>
         Sample paths charted: ${resp.samplePathsCount}`

      window._mcFinalValues = fv

      // Plot path chart
      destroyChart(pathChart)
      const labels = resp.paths.map(p => p.step)
      const datasets = []
      for (let i = 0; i < resp.paths[0]?.values?.length && i < 20; i++) {
        datasets.push({
          label: `Path ${i + 1}`,
          data: resp.paths.map(p => p.values[i]),
          borderWidth: 0.8,
          pointRadius: 0,
          borderColor: `hsl(${(i * 137.5) % 360}, 60%, 50%)`,
        })
      }
      pathChart = createLineChart(document.getElementById('mc-path-chart'), labels, datasets)

      // Plot distribution histogram
      const bins = 20
      const binWidth = (max - min) / bins || 0.001
      const hist = new Array(bins).fill(0)
      fv.forEach(v => {
        const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1)
        hist[idx]++
      })
      const binLabels = hist.map((_, i) => (min + (i + 0.5) * binWidth).toFixed(4))
      destroyChart(distChart)
      const canvas = document.getElementById('mc-dist-chart')
      if (canvas) {
        const { createBarChart } = await import('../lib/charts.js')
        distChart = createBarChart(canvas, binLabels, hist, 'Final Rate Distribution')
      }
    } catch (e) { document.getElementById('mc-stats').textContent = 'Error: ' + e }
  }

  window._mcComputeRisk = async () => {
    const fv = window._mcFinalValues
    if (!fv || !fv.length) {
      document.getElementById('mc-risk-result').textContent = 'Run simulation first'
      return
    }
    try {
      const report = await window.go.main.App.ComputeRiskMetrics(fv)
      document.getElementById('mc-risk-result').innerHTML =
        `VaR(95%): <strong>${report.var95.toFixed(4)}</strong><br>
         VaR(99%): <strong>${report.var99.toFixed(4)}</strong><br>
         CTE(95%): <strong>${report.cte95.toFixed(4)}</strong><br>
         CTE(99%): <strong>${report.cte99.toFixed(4)}</strong><br>
         95% CI: [${report.confidence95Lo.toFixed(4)}, ${report.confidence95Hi.toFixed(4)}]`
    } catch (e) { document.getElementById('mc-risk-result').textContent = 'Error: ' + e }
  }
}
