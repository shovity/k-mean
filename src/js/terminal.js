const DOCS = 
`
clear     XX
show      YY
sort
update
---------------------
random
input
init-centers
update-centers
assign-label
auto`



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
    case 'help':
      addLog(DOCS.replace(/\n/g, '<br>'))
      break

    case 'clear':
      window.result.innerHTML = ''
      break

    case 'show':
      const result = `<prev>${JSON.stringify(group)}</prev>`
      addLog(result)
      break

    case 'init-centers':
      if (params[1] && +params[1] > 1 && +params[1] < 13) {
        window.centers = initCenters(window.group.length, +params[1]).sort((x, y) => x - y)
        updateChart()
        addLog('initial centers = <span class="info">' + JSON.stringify(window.centers) + '</span>')
      } else {
        addLog('Err: Cluster number invalidate', 'danger')
      }
      break

    case 'input':
      window.group = []
      window.centers = []
      params.forEach(e => {
        if (!Number.isNaN(+e)) window.group.push({ value: +e })
      })
      addLog('input group success!', 'success')
      addLog('group = <span class="info">' + JSON.stringify(params.slice(1).map(e => +e)) + '</span>')
      updateChart()
      break

    case 'sort':
      // Set centers label
      centers.forEach((center, centerIndex) => window.group[center].center = centerIndex)

      // Sort
      group.sort((x, y) => x.value - y.value)

      // Update centers
      group.forEach((e, ei) => {
        if (e.center != undefined) centers[e.center] = ei
      })

      updateChart()
      addLog('group is sorted', 'success')
      break

    case 'update-centers':
      const oc = window.centers
      uCenters()
      updateChart()
      addLog('update centers......')
      addLog(` ===> centers change: [<span class="info">${oc}</span>] => [<span class="primary">${window.centers}</span>] `)
      break

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
    case 'auto':
      const i = params.indexOf('-d')
      let delay = +params[i+1]
      if (!(i !== -1 && !Number.isNaN(delay) && delay > -1 && delay < 1e9)) delay = 1200

      const j = params.indexOf('-n')
      let nCluster = +params[j+1]
      if (!(j !== -1 && !Number.isNaN(nCluster) && nCluster > 1 && nCluster < window.group.length-1)) {
        nCluster = Math.floor(window.group.length / 5)
      }

      addLog(`start auto solving...`)
      addLog(` ===> set step delay = <span class="primary">${delay}</span>(ms)`)
      addLog(` ===> set number of cluster = <span class="primary">${nCluster}</span>`)

      serviceCmd('init-centers ' + nCluster)
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
    case 'random':
      const n = +params[1]
      if (Number.isNaN(n) || n < 0) {
        addLog('Err: Invalidate size!', 'danger')
      } else {
        window.group = []
        window.centers = []
        for (let i = 0; i < n; i++) {
          window.group.push(
            {
              value: Math.floor(Math.random()*1000+1) / 100
            }
          )
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
