/**
 * Get random position of cluster center
 * @param  {Number} length     [description]
 * @param  {Number} numCluster [description]
 * @return {Array}            [description]
 */
function initCenters(length, numCluster) {
  let result = []
  while (result.length < numCluster) {
    const seed = Math.floor(Math.random() * length)
    if (result.indexOf(seed) === -1) result.push(seed)
  }
  return result
}

/**
 * Assign label for element by centers
 * @param  {Array} group   [description]
 * @param  {Array} centers [description]
 * @return {Number}        Number of success assign labbel
 */
function assignLabel(group, centers) {
  let numAssign = 0
  group.forEach(element => {
    // Each element
    const ol = element.label
    element.label = 0
    centers.forEach((center, centerIndex) => {
      // Each center
      const dl2e = Math.abs(group[centers[element.label]].value - element.value)
      const dx2e = Math.abs(group[center].value - element.value)
      if (dl2e > dx2e && element.label !== centerIndex) {
        element.label = centerIndex
      }
    })

    if (ol !== element.label) numAssign++
  })
  return numAssign
}

/**
 * Update centers, just get MEAN =]]
 * @param  {Array} group   [description]
 * @param  {Array} centers [description]
 * @return {Array}         New centers array
 */
function updateCenters(group, centers) {
  let result = [...centers]
  centers.forEach((center, centerIndex) => {
    let sum = 0
    let count = 0
    group.forEach(element => {
      if (element.label === centerIndex) {
        sum += element.value
        count++
      }
    })
    const average = sum / count

    // Choose new center 456
    group.forEach((element, elementIndex) => {
      if (element.label === centerIndex) {
        if (Math.abs(average - element.value) < Math.abs(average - group[center].value)) result[centerIndex] = elementIndex
      }
    })
  })
  return result
}

module.exports = { initCenters, assignLabel, updateCenters }
