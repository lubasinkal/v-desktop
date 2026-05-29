import { destroyChart, createLineChart } from '../lib/charts.js'
import { showToast } from '../lib/toast.js'
import { validatePositive, validateRate, setButtonLoading, copyToClipboard } from '../lib/utils.js'

let pathChart = null
let distChart = null

function id(s) { return document.getElementById(s) }

export function init(container) {
  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; monte-carlo</div>
    <h2>Monte Carlo Simulation</h2>
    <div class="calc-grid">
      <div class="card" onkeydown="if(event.key==='Enter')window._mcRun()">
        <div class="field"><label>Model</label>
          <select id="mc-model">
            <option value="gbm">Geometric Brownian Motion</option>
            <option value="vasicek">Vasicek Mean-Reverting</option>
          </select>
        </div>
        <div class="field"><label>Initial Rate</label><input id="mc-init" type="number" value="0.05" step="0.001" min="0"></div>
        <div class="calc-grid" style="gap:8px">
          <div class="field"><label>Drift / LT Mean</label><input id="mc-mean" type="number" value="0.05" step="0.001"></div>
          <div class="field"><label>Mean Rev Speed</label><input id="mc-rev" type="number" value="0.5" step="0.01" min="0"></div>
        </div>
        <div class="field"><label>Volatility</label><input id="mc-vol" type="number" value="0.02" step="0.001" min="0.001"></div>
        <div class="calc-grid" style="gap:8px">
          <div class="field"><label>Paths</label><input id="mc-paths" type="number" value="10000" min="100"></div>
          <div class="field"><label>Steps</label><input id="mc-steps" type="number" value="10" min="1"></div>
        </div>
        <div class="calc-grid" style="gap:8px">
          <div class="field"><label>dt</label><input id="mc-dt" type="number" value="1.0" step="0.1" min="0.01"></div>
          <div class="field"><label>Seed (0=random)</label><input id="mc-seed" type="number" value="42"></div>
        </div>
        <button id="mc-run-btn" onclick="window._mcRun()" style="width:100%">Run Simulation</button>
      </div>
      <div class="card">
        <h3>Summary</h3>
        <div id="mc-stats"></div>
        <div style="margin-top:12px">
          <button id="mc-risk-btn" onclick="window._mcComputeRisk()" class="btn-secondary">Compute Risk Metrics</button>
        </div>
        <div class="result-box" id="mc-risk-result"></div>
      </div>
    </div>
    <div class="card">
      <div class="chart-row">
        <div class="chart-wrap"><canvas id="mc-path-chart"></canvas></div>
        <div class="chart-wrap"><canvas id="mc-dist-chart"></canvas></div>
      </div>
    </div>`

  window._mcRun = async () => {
    const model = id('mc-model').value
    const initialRate = parseFloat(id('mc-init').value)
    const drift = parseFloat(id('mc-mean').value)
    const volatility = parseFloat(id('mc-vol').value)
    const meanReversion = parseFloat(id('mc-rev').value)
    const numPaths = parseInt(id('mc-paths').value)
    const steps = parseInt(id('mc-steps').value)
    const dt = parseFloat(id('mc-dt').value)

    const err = validatePositive(volatility, 'Volatility') || validatePositive(numPaths, 'Paths') || validatePositive(steps, 'Steps') || validatePositive(dt, 'dt')
    if (err) { showToast(err, 'warning'); return }

    const req = {
      model, initialRate, drift, volatility,
      longTermMean: drift, meanReversion,
      numPaths, steps, dt,
      seed: parseInt(id('mc-seed').value),
    }

    id('mc-stats').innerHTML = '<span class="spinner" style="border-top-color:#3cffd0"></span> Running...'
    setButtonLoading(id('mc-run-btn'), true)
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

      const statsEl = id('mc-stats')
      statsEl.innerHTML =
        `Paths: ${fv.length.toLocaleString()}<br>
         Mean: <strong>${mean.toFixed(4)}</strong><br>
         Std Dev: <strong>${std.toFixed(4)}</strong><br>
         Min: ${min.toFixed(4)} &nbsp;|&nbsp; Max: ${max.toFixed(4)}`
      statsEl.innerHTML += ` <button class="copy-btn" onclick="window._copyText('MC: Mean=${mean.toFixed(4)}, Std=${std.toFixed(4)}, Min=${min.toFixed(4)}, Max=${max.toFixed(4)}')">Copy</button>`

      window._mcFinalValues = fv
      id('mc-risk-result').innerHTML = ''

      destroyChart(pathChart)
      const labels = resp.paths.map(p => p.step)
      const datasets = []
      const colors = ['#3cffd0', '#5200ff', '#3860be', '#ff5f57', '#febc2e', '#28c840', '#ff8c00', '#ff69b4']
      for (let i = 0; i < resp.paths[0]?.values?.length && i < 8; i++) {
        datasets.push({
          label: `Path ${i + 1}`,
          data: resp.paths.map(p => p.values[i]),
          borderWidth: 1, pointRadius: 0,
          borderColor: colors[i % colors.length],
        })
      }
      pathChart = createLineChart(id('mc-path-chart'), labels, datasets, {
        plugins: { legend: { display: false } },
      })

      const bins = 20
      const binWidth = (max - min) / bins || 0.001
      const hist = new Array(bins).fill(0)
      fv.forEach(v => {
        const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1)
        hist[idx]++
      })
      const binLabels = hist.map((_, i) => (min + (i + 0.5) * binWidth).toFixed(4))
      destroyChart(distChart)
      const canvas = id('mc-dist-chart')
      if (canvas) {
        const { createBarChart } = await import('../lib/charts.js')
        distChart = createBarChart(canvas, binLabels, hist, 'Final Rate Distribution', '#3cffd0')
      }
      showToast('Simulation complete', 'success')
    } catch (e) { id('mc-stats').textContent = 'Error: ' + e; showToast('Simulation failed', 'error') }
    finally { setButtonLoading(id('mc-run-btn'), false) }
  }

  window._mcComputeRisk = async () => {
    const fv = window._mcFinalValues
    if (!fv || !fv.length) {
      id('mc-risk-result').innerHTML = 'Run simulation first'
      showToast('Run simulation first', 'warning')
      return
    }
    setButtonLoading(id('mc-risk-btn'), true)
    try {
      const report = await window.go.main.App.ComputeRiskMetrics(fv)
      const el = id('mc-risk-result')
      el.innerHTML =
        `VaR(95%): <strong>${report.var95.toFixed(4)}</strong><br>
         VaR(99%): <strong>${report.var99.toFixed(4)}</strong><br>
         CTE(95%): <strong>${report.cte95.toFixed(4)}</strong><br>
         CTE(99%): <strong>${report.cte99.toFixed(4)}</strong><br>
         95% CI: [${report.confidence95Lo.toFixed(4)}, ${report.confidence95Hi.toFixed(4)}]`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('VaR95=${report.var95.toFixed(4)}, VaR99=${report.var99.toFixed(4)}, CTE95=${report.cte95.toFixed(4)}, CTE99=${report.cte99.toFixed(4)}')">Copy</button>`
      showToast('Risk metrics computed', 'success')
    } catch (e) { id('mc-risk-result').textContent = 'Error: ' + e; showToast('Risk computation failed', 'error') }
    finally { setButtonLoading(id('mc-risk-btn'), false) }
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }
}
