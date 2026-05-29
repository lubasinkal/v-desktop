import { destroyChart, createLineChart } from '../lib/charts.js'
import { showToast } from '../lib/toast.js'
import { validateAge, validatePositive, setButtonLoading, copyToClipboard } from '../lib/utils.js'

let tableNames = []
let qxChart = null
let lxChart = null
let _mortData = null
let _mortPage = 0
let _mortPageSize = 20
let _pendingFileContent = null // CSV content from HTML file input fallback

function id(s) { return document.getElementById(s) }

export async function init(container) {
  try {
    tableNames = await window.go.main.App.GetTableNames()
  } catch (e) { tableNames = ['cso2017_male'] }

  container.innerHTML = `
    <div class="section-label">~/v-desktop &gt; mortality</div>
    <h2>Mortality Tables</h2>
    <div class="calc-grid">
      <div class="card" onkeydown="if(event.key==='Enter')window._mortQuery()">
        <div class="field"><label>Table</label>
          <select id="mort-table" onchange="window._mortLoad()">
            ${tableNames.map(n => `<option>${n}</option>`).join('')}
          </select>
        </div>
        <div class="calc-grid" style="gap:8px">
          <div class="field"><label>Age</label><input id="mort-age" type="number" value="65" min="0" max="120"></div>
          <div class="field"><label>Term</label><input id="mort-term" type="number" value="10" min="1"></div>
        </div>
        <button id="mort-query-btn" onclick="window._mortQuery()">Query</button>
        <div class="result-box" id="mort-query-result"></div>
      </div>
      <div class="card">
        <h3>Load Custom Table</h3>
        <div class="field"><label>Table Name</label><input id="mort-custom-name" type="text" placeholder="my_table"></div>
        <div class="field"><label>CSV File Path</label>
          <div style="display:flex;gap:8px">
            <input id="mort-custom-path" type="text" placeholder="path/to/table.csv" style="flex:1">
            <button id="mort-browse-btn" onclick="window._mortBrowse()" class="btn-secondary" style="white-space:nowrap">Browse</button>
            <input id="mort-file-input" type="file" accept=".csv" style="display:none" onchange="window._mortFileSelected(event)">
          </div>
          <span class="field-hint">Columns: age, qx (0–1 mortality rate) &nbsp;or&nbsp; age, px (0–1 survival rate)</span>
        </div>
        <button id="mort-load-btn" onclick="window._mortLoadPath()">Load Table</button>
        <div class="result-box" id="mort-load-result"></div>
      </div>
    </div>
    <div class="card">
      <div class="chart-row">
        <div class="chart-wrap"><canvas id="mort-qx-chart"></canvas></div>
        <div class="chart-wrap"><canvas id="mort-lx-chart"></canvas></div>
      </div>
    </div>
    <div class="card">
      <h3>Table Data <span id="mort-data-info" style="font-family:'Space Mono',monospace;font-size:10px;color:#949494;font-weight:400"></span></h3>
      <div style="max-height:400px;overflow:auto" id="mort-table-scroll">
        <div id="mort-table-data"></div>
      </div>
      <div id="mort-pagination" class="pagination"></div>
    </div>`

  window._mortLoad = async () => {
    const name = id('mort-table').value
    setButtonLoading(id('mort-query-btn'), true)
    try {
      _mortData = await window.go.main.App.GetTableData({ name })
      _mortPage = 0
      _renderTable()
      _renderPagination()

      destroyChart(qxChart); destroyChart(lxChart)
      qxChart = createLineChart(id('mort-qx-chart'), _mortData.ages, [
        { label: 'q(x)', data: _mortData.qx, borderColor: '#ff5f57', borderWidth: 1.5, pointRadius: 0 },
      ])
      lxChart = createLineChart(id('mort-lx-chart'), _mortData.ages, [
        { label: 'l(x) — radix 100,000', data: _mortData.lx, borderColor: '#3cffd0', borderWidth: 1.5, pointRadius: 0 },
      ])
    } catch (e) { id('mort-table-data').textContent = 'Error: ' + e; showToast('Failed to load table', 'error') }
    finally { setButtonLoading(id('mort-query-btn'), false) }
  }

  window._mortQuery = async () => {
    const name = id('mort-table').value
    const age = parseInt(id('mort-age').value)
    const term = parseInt(id('mort-term').value)
    const err = validateAge(age) || validatePositive(term, 'Term')
    if (err) { showToast(err, 'warning'); return }

    setButtonLoading(id('mort-query-btn'), true)
    try {
      const qx = await window.go.main.App.QueryQx(name, age)
      const px = await window.go.main.App.QueryPx(name, age, term)
      const ex = await window.go.main.App.QueryEx(name, age)
      const el = id('mort-query-result')
      el.innerHTML =
        `q<sub>${age}</sub> = <strong>${qx.toFixed(6)}</strong><br>
         <sub>${age}</sub>p<sub>${term}</sub> = <strong>${px.toFixed(6)}</strong><br>
         e<sub>${age}</sub> = <strong>${ex.toFixed(2)}</strong>`
      el.innerHTML += ` <button class="copy-btn" onclick="window._copyText('q(${age})=${qx.toFixed(6)}, p(${age},${term})=${px.toFixed(6)}, e(${age})=${ex.toFixed(2)}')">Copy</button>`
    } catch (e) { id('mort-query-result').textContent = 'Error: ' + e; showToast('Query failed', 'error') }
    finally { setButtonLoading(id('mort-query-btn'), false) }
  }

  window._mortBrowse = async () => {
    try {
      const result = await window.runtime.OpenFileDialog({
        filters: [{ displayName: 'CSV Files', pattern: '*.csv' }],
        properties: ['openFile'],
      })
      if (result) {
        id('mort-custom-path').value = result
        _pendingFileContent = null
        showToast('File selected', 'info')
      }
    } catch (e) {
      // Runtime dialog unavailable (dev mode) — use HTML file input fallback
      id('mort-file-input').click()
    }
  }

  window._mortFileSelected = (event) => {
    const file = event.target.files[0]
    if (!file) return
    id('mort-custom-path').value = file.name
    // Read file content for backend processing
    const reader = new FileReader()
    reader.onload = (e) => {
      _pendingFileContent = e.target.result
      showToast('File loaded: ' + file.name, 'success')
    }
    reader.onerror = () => {
      showToast('Failed to read file', 'error')
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  window._mortLoadPath = async () => {
    const name = id('mort-custom-name').value
    const path = id('mort-custom-path').value
    if (!name) { showToast('Enter a table name', 'warning'); return }
    if (!path) { showToast('Enter a file path', 'warning'); return }
    setButtonLoading(id('mort-load-btn'), true)
    try {
      if (_pendingFileContent) {
        // Use in-memory content (dev mode via HTML file input)
        await window.go.main.App.LoadTableFromData(name, _pendingFileContent)
        _pendingFileContent = null
      } else {
        // Use file path (production mode via runtime dialog)
        await window.go.main.App.LoadTableFromFile(name, path)
      }
      id('mort-load-result').textContent = `Loaded "${name}"`
      showToast(`Table "${name}" loaded`, 'success')
      const names = await window.go.main.App.GetTableNames()
      id('mort-table').innerHTML = names.map(n => `<option>${n}</option>`).join('')
      window._mortLoad()
      // Notify other tabs that the table list changed
      window.dispatchEvent(new CustomEvent('tables-updated'))
    } catch (e) {
      id('mort-load-result').textContent = 'Error: ' + e
      showToast('Failed to load file', 'error')
    }
    finally { setButtonLoading(id('mort-load-btn'), false) }
  }

  function _renderTable() {
    if (!_mortData) return
    const start = _mortPage * _mortPageSize
    const end = Math.min(start + _mortPageSize, _mortData.ages.length)
    let html = '<table><tr><th>Age</th><th>q(x)</th><th>l(x)</th><th>e(x)</th></tr>'
    for (let i = start; i < end; i++) {
      html += `<tr><td>${_mortData.ages[i]}</td><td>${_mortData.qx[i].toFixed(6)}</td><td>${_mortData.lx[i].toFixed(2)}</td><td>${_mortData.ex[i].toFixed(2)}</td></tr>`
    }
    html += '</table>'
    id('mort-table-data').innerHTML = html
    id('mort-data-info').textContent = `— showing ${start + 1}–${end} of ${_mortData.ages.length}`
  }

  function _renderPagination() {
    if (!_mortData) return
    const total = _mortData.ages.length
    const totalPages = Math.ceil(total / _mortPageSize)
    const el = id('mort-pagination')
    el.innerHTML = `
      <button onclick="window._mortPageChange(-1)" ${_mortPage === 0 ? 'disabled' : ''}>← Prev</button>
      <span class="page-info">Page ${_mortPage + 1} of ${totalPages}</span>
      <button onclick="window._mortPageChange(1)" ${_mortPage >= totalPages - 1 ? 'disabled' : ''}>Next →</button>
      <span style="margin-left:12px;color:#525252;font-size:10px;font-family:'Space Mono',monospace">Show</span>
      <select onchange="window._mortPageSizeChange(this.value)">
        <option value="10" ${_mortPageSize === 10 ? 'selected' : ''}>10</option>
        <option value="20" ${_mortPageSize === 20 ? 'selected' : ''} selected>20</option>
        <option value="50" ${_mortPageSize === 50 ? 'selected' : ''}>50</option>
        <option value="100" ${_mortPageSize === 100 ? 'selected' : ''}>100</option>
      </select>
      <span style="color:#525252;font-size:10px;font-family:'Space Mono',monospace">per page</span>
    `
  }

  window._mortPageChange = delta => {
    _mortPage = Math.max(0, Math.min(_mortPage + delta, Math.ceil(_mortData.ages.length / _mortPageSize) - 1))
    _renderTable()
    _renderPagination()
    id('mort-table-scroll').scrollTop = 0
  }

  window._mortPageSizeChange = size => {
    _mortPageSize = parseInt(size)
    _mortPage = 0
    _renderTable()
    _renderPagination()
  }

  window._copyText = async text => {
    if (await copyToClipboard(text)) showToast('Copied', 'success')
  }

  window.addEventListener('tables-updated', async () => {
    const names = await window.go.main.App.GetTableNames()
    const sel = id('mort-table')
    if (sel && names.length > 0) {
      const current = sel.value
      sel.innerHTML = names.map(n => `<option>${n}</option>`).join('')
      if (!names.includes(current)) window._mortLoad()
    }
  })

  setTimeout(() => window._mortLoad(), 100)
}
