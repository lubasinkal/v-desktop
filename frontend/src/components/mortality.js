import { destroyChart, createLineChart } from '../lib/charts.js'

let tableNames = []
let qxChart = null
let lxChart = null

export async function init(container) {
  try {
    tableNames = await window.go.main.App.GetTableNames()
  } catch (e) { tableNames = ['cso2017_male'] }

  container.innerHTML = `
    <h2>Mortality Tables</h2>
    <div class="calc-grid">
      <div class="card">
        <div class="field"><label>Table</label>
          <select id="mort-table" onchange="window._mortLoad()">
            ${tableNames.map(n => `<option>${n}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Age (for single query)</label><input id="mort-age" type="number" value="65"></div>
        <div class="field"><label>Term</label><input id="mort-term" type="number" value="10"></div>
        <button onclick="window._mortQuery()">Query</button>
        <div class="result-box" id="mort-query-result"></div>
      </div>
      <div class="card">
        <h3>Load Custom CSV</h3>
        <div class="field"><label>Table Name</label><input id="mort-custom-name" type="text" placeholder="my_table"></div>
        <div class="field">
          <input type="file" id="mort-file" accept=".csv">
        </div>
        <button onclick="window._mortLoadFile()">Load &nbsp;Table</button>
        <div class="result-box" id="mort-load-result"></div>
      </div>
    </div>
    <div id="mort-charts" class="card">
      <div class="chart-wrap"><canvas id="mort-qx-chart"></canvas></div>
      <div class="chart-wrap"><canvas id="mort-lx-chart"></canvas></div>
    </div>
    <div class="card" id="mort-table-wrap" style="max-height:400px;overflow:auto">
      <h3>Table Data</h3>
      <div id="mort-table-data"></div>
    </div>`

  window._mortLoad = async () => {
    const name = document.getElementById('mort-table').value
    try {
      const data = await window.go.main.App.GetTableData({ name })
      let html = '<table><tr><th>Age</th><th>q(x)</th><th>l(x)</th><th>e(x)</th></tr>'
      for (let i = 0; i < data.ages.length; i += 5) {
        html += `<tr><td>${data.ages[i]}</td><td>${data.qx[i].toFixed(6)}</td><td>${data.lx[i].toFixed(2)}</td><td>${data.ex[i].toFixed(2)}</td></tr>`
      }
      document.getElementById('mort-table-data').innerHTML = html

      destroyChart(qxChart); destroyChart(lxChart)
      qxChart = createLineChart(document.getElementById('mort-qx-chart'), data.ages, [
        { label: 'q(x)', data: data.qx, borderColor: 'rgb(239, 68, 68)', borderWidth: 1.5, pointRadius: 0 },
      ])
      lxChart = createLineChart(document.getElementById('mort-lx-chart'), data.ages, [
        { label: 'l(x) — radix 100,000', data: data.lx, borderColor: 'rgb(59, 130, 246)', borderWidth: 1.5, pointRadius: 0 },
      ])
    } catch (e) { document.getElementById('mort-table-data').textContent = 'Error: ' + e }
  }

  window._mortQuery = async () => {
    const name = document.getElementById('mort-table').value
    const age = parseInt(document.getElementById('mort-age').value)
    const term = parseInt(document.getElementById('mort-term').value)
    try {
      const qx = await window.go.main.App.QueryQx(name, age)
      const px = await window.go.main.App.QueryPx(name, age, term)
      const ex = await window.go.main.App.QueryEx(name, age)
      document.getElementById('mort-query-result').innerHTML =
        `Age ${age}: qx = <strong>${qx.toFixed(6)}</strong> | ${term}-year px = <strong>${px.toFixed(6)}</strong> | e(x) = <strong>${ex.toFixed(2)}</strong>`
    } catch (e) { document.getElementById('mort-query-result').textContent = 'Error: ' + e }
  }

  window._mortLoadFile = async () => {
    const name = document.getElementById('mort-custom-name').value
    const fileInput = document.getElementById('mort-file')
    if (!name || !fileInput.files.length) {
      document.getElementById('mort-load-result').textContent = 'Please fill name and select file'
      return
    }
    document.getElementById('mort-load-result').textContent = 'Selected: ' + fileInput.files[0].name + ' (Go backend uses file path — for now, use bundled tables)'
  }

  setTimeout(() => window._mortLoad(), 100)
}
