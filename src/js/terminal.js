const DOCS = 
`
  clear
  show
  sort
  update
  -------------------
  random         / r
  input          / i       point11-point12 point21-point22 ... / value1 value2 ...
  init-centers   / ic
  update-centers / uc
  assign-label   / al
  auto           / a       [-d delay] [-n numberCluster] [-c centers]`



const { initCenters, assignLabel, updateCenters } = require('./kmean')

function goBot() {
  terminal.scrollTop = terminal.scrollHeight
}

function addLog(meg, type) {
  result.innerHTML += `<p class='${type}'>- ${meg}</p>`
  goBot()
}

// Service command
function serviceCmd(request)
{
  // remove space begin and end of request
  request = request.trim()

  // Handle multi request
  if (request.indexOf(';') !== -1) {
    return request.split(';').forEach(cmd => {
      serviceCmd(cmd)
    })
  }

  // remove double space
  while (request.indexOf('  ') !== -1) request = request.replace('  ', ' ')
  
  // Split params
  const params = request.split(' ')

  switch (params[0]) {
    case 'h':
    case 'help':
      addLog('<pre>' + DOCS + '</pre>')
      break

    case 'clear':
      window.result.innerHTML = ''
      break

    case 'show':
      let mesg = '<p><table>'
      mesg += `<tr> <th>ID</th> <th>Point1</th> <th>Point2</th> <th>Value</th> <th>Cluster</th> </tr>`
      window.group.forEach((e, ei) => {
        mesg += `<tr>
          <td>${ei}</td>
          <td>${e.point1}</td>
          <td>${e.point2}</td>
          <td>${e.value}</td>
          <td>${e.label === undefined? 'no cluster' : e.label}</td>
        </tr>`
      })
      mesg += '</table></p>'
      addLog(mesg)
      break

    case 'it':
    case 'init-centers':
      if (params[1] && +params[1] > 1 && +params[1] < 13) {
        window.centers = initCenters(window.group.length, +params[1]).sort((x, y) => x - y)
        updateChart()
        addLog('initial centers = <span class="info">' + JSON.stringify(window.centers) + '</span>')
      } else {
        addLog('Err: Cluster number invalidate', 'danger')
      }
      break

    case 'i':
    case 'input':
      window.group = []
      window.centers = []
      params.forEach(e => {  
        if (!Number.isNaN(+e)) {
          window.group.push({ value: +e })
        } else if (e.split('-').length === 2) {
          const dualPoint = e.split('-')
          if (!Number.isNaN(+dualPoint[0]) && !Number.isNaN(+dualPoint[1])) {
            window.group.push({
              point1: dualPoint[0],
              point2: dualPoint[1],
              value: Math.floor((+dualPoint[0]*0.25 + +dualPoint[1]*0.01)*100) / 100
            })
          }
        }
      })

      addLog('input group success!', 'success')
      addLog('group = <span class="info">' + JSON.stringify(window.group) + '</span>')
      updateChart()
      break

    case 'sort':
      // Set centers label
      window.centers.forEach((center, centerIndex) => window.group[center].center = centerIndex)

      // Sort
      group.sort((x, y) => x.value - y.value)

      // Update centers
      group.forEach((e, ei) => {
        if (e.center != undefined) window.centers[e.center] = ei
      })

      updateChart()
      addLog('group is sorted', 'success')
      break

    case 'uc':
    case 'update-centers':
      const oc = window.centers
      uCenters()
      updateChart()
      addLog('update centers......')
      addLog(` ===> centers change: [<span class="info">${oc}</span>] => [<span class="primary">${window.centers}</span>] `)
      break

    case 'al':
    case 'assign-label':
      const count = aLabel()
      window.stop = count === 0
      updateChart()
      addLog('assigning label......')

      const className = count === 0? 'danger' : 'primary'
      addLog(` ===> "<span class="${className}">${count}</span>" element has assigned`)
      break

    case 'update':
      updateChart()
      addLog('visualization is updated', 'success')
      break

    // auto -d 100 (ms)
    case 'a':
    case 'auto':
      // handle option -c
      const ic = params.indexOf('-c')
      let centers = null
      if (ic !== -1) centers = eval(params[ic+1])
      if (!(ic !== -1 && Array.isArray(centers) && centers.length > 1 && centers.length < 12)) centers = null

      // handle option -d
      const id = params.indexOf('-d')
      let delay = +params[id+1]
      if (!(id !== -1 && !Number.isNaN(delay) && delay > -1 && delay < 1e9)) delay = 1200

      // handle option -n. only run if lost -c
      const j = params.indexOf('-n')
      let nCluster = +params[j+1]
      if (!(j !== -1 && !Number.isNaN(nCluster) && nCluster > 1 && nCluster < window.group.length-1)) {
        nCluster = Math.floor(window.group.length / 5)
        if (nCluster > 12) nCluster = 12
        if (nCluster < 2) nCluster = 2
      }

      addLog(`start auto solving...`)
      addLog(` ===> set step delay = <span class="primary">${delay}</span>(ms)`)
      

      if (centers) {
        addLog(` ===> set centers = <span class="primary">${JSON.stringify(centers)}</span>`)
        window.centers = centers;
        updateChart();
      } else {
        addLog(` ===> set number of cluster = <span class="primary">${nCluster}</span>`)
        serviceCmd('init-centers ' + nCluster)
      }

      let flag = true
      const interval = setInterval(() => {
        if (flag) {
          flag = false
          serviceCmd('assign-label')
          if (window.stop) {
            clearInterval(interval)
            addLog('solving conpleted!', 'success')
          }
        } else {
          flag = true
          serviceCmd('update-centers')
        }
      }, delay)
      break

    //random 12
    case 'r':
    case 'random':
      const n = +params[1]
      if (Number.isNaN(n) || n < 0) {
        addLog('Err: Invalidate size!', 'danger')
      } else {
        window.group = []
        window.centers = []
        for (let i = 0; i < n; i++) {
          const point1 = Math.floor(Math.random()*5)
          const point2 = Math.floor(Math.random()*101)
          const value = Math.floor((point1*0.25 + point2*0.01) * 100) / 100
          window.group.push({ point1, point2, value })
        }
        addLog('random group complete!', 'success')
        updateChart()
      }
      break

    case 's':
      window.sorting()
      break

    default:
      addLog('Err: command not found! "help" to see docs', 'danger')
  }
}

// Goto bottom when input focus
cmd.addEventListener('focus', () => {
  goBot()
})

// Keydown - focus input, if key == enter service request
cmd.addEventListener('keydown', event => {
  goBot()
  if (event.keyCode == 13) {
    result.innerHTML += `<p><span class='primary'>root@k-mean:~#</span> ${cmd.value}</p>`
    serviceCmd(cmd.value)
    cmd.value = ""
  }
})

module.exports = { addLog, serviceCmd }
