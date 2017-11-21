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

  /**
   * Initial chart
   */
  window.drawChart = function (group, centers) {
    const length = group.length

    let data = []
    let cls = []
    let labels = Array(length)

    group.forEach(element => {
      data.push(element.value)
      cls.push(colors[element.label])
    })

    centers.forEach((center, centerIndex) => {
      labels[center] = centerIndex
    })

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

    let data = []
    let cls = []
    let labels = Array(length)

    group.forEach(element => {
      data.push(element.value)
      cls.push(colors[element.label])
    })

    centers.forEach((center, centerIndex) => {
      labels[center] = centerIndex
    })

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

  drawChart(group, centers)
})
