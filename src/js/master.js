const Chart = require('chart.js')
const { addLog, serviceCmd } = require('./terminal')
const { initCenters, assignLabel, updateCenters } = require('./kmean')

// Load css
require('../css/master.css')
require('../css/terminal.css')

window.addEventListener('DOMContentLoaded', () => {
  // Mock Data
  window.group = []
  window.centers = []


  // Initial varible
  const dW = document.documentElement.clientWidth
  const dH = document.documentElement.clientHeight

  const colors = [
  '#F44336', '#009688', '#E91E63', '#4CAF50', '#9C27B0', '#CDDC39',
  '#3F51B5', '#FFC107', '#2196F3', '#FF9800', '#00BCD4', '#FF5722'
  ]

  // Setup ev
  visual.width = dW
  visual.height = dH - 220

  // Setup canvas context
  const ctx = visual.getContext("2d");
  let chart = null

  // Make timeout fun return promise
  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Convert data to chart
   */
  function convertDate(length) {
    let [data, cls, labels] = [
      [],
      [],
      Array(length)
    ]

    group.forEach(element => {
      data.push(element.value)
      if (element.focus && element.focus !== false) {
        cls.push(element.focus)
      } else {
        cls.push(colors[element.label])
      }
    })

    centers.forEach((center, centerIndex) => {
      labels[center] = centerIndex
    })

    return [data, cls, labels]
  }

  /**
   * Initial chart
   */
  window.drawChart = function (group, centers) {
    const length = group.length
    let [data, cls, labels ] = convertDate(length)

    convertDate()

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '',
          data,
          backgroundColor: cls,
        }
      ]
      },
      options: {
        animation: {
          duration: 0
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    })
  }

  window.updateChart = function () {
    const length = group.length
    let [data, cls, labels ] = convertDate(length)

    chart.data.labels = labels
    chart.data.datasets[0].backgroundColor = cls
    chart.data.datasets[0].data = data
    chart.update()
  }

  window.uCenters = () => {
    centers = updateCenters(group, centers)
  }

  window.aLabel = () => {
    return assignLabel(group, centers)
  }

  window.sorting = async function () {
    let delay = 0
    for (let i = 0, length = group.length; i < length - 1; i++) {
      for (let j = i + 1; j < length; j++) {

        // group[i].focus = '#222'
        // group[j].focus = '#222'
        // updateChart()
        // await timeout(delay)


        if (group[i].value > group[j].value) {
          group[i].focus = '#f00'
          group[j].focus = '#f00'
          updateChart()
          await timeout(delay * 3)
          const tmp = group[i].value
          group[i].value = group[j].value
          group[j].value = tmp
          updateChart()
          await timeout(delay * 3)
        }

        group[i].focus = false
        group[j].focus = false
        updateChart()
        // await timeout(delay)
        //--
      }
    }

    // Check
    for (let i = 0, length = group.length - 1; i < length; i++) {
      await timeout(delay * 3)
      if (group[i].value <= group[i+1].value) {
        group[i].focus = '#0f0'
        updateChart()
      }
    }
    await timeout(delay * 3)
    group[group.length-1].focus = '#0f0'
    updateChart()

    group.forEach(e => {
      e.focus = false
    })
  }

  drawChart(group, centers)
})
