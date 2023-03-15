const dropsHistory = []

function countByFrequency(arrValues) {
  const counted = {}

  arrValues.forEach((value) => {
    count(value, counted)
  })

  return counted
}

function count(value, obj) {
  if (obj[value]) obj[value]++
  else obj[value] = 1
}

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  // Ran every time a balls drops into a bucket
  dropsHistory.push([dropPosition, bounciness, size, bucketLabel])
}

function runAnalysis() {
  const [trainingData, testData] = splitDataset(dropsHistory, 100)

  const resultGlobal = []

  for (let k = 1; k < 31; k++) {
    const resultsTest = []
    let accuracy = 0
    for (let i = 0; i < testData.length; i++) {
      const eachResult = {
        waitings: knn(trainingData, testData[i][0], k),
        result: testData[i][3],
      }

      accuracy =
        eachResult.result === eachResult.waitings ? ++accuracy : accuracy

      // Сохраняем результат тестирования
      resultsTest.push(eachResult)
    }

    resultGlobal.push({
      k: k,
      "Точность расчетов (%)": (accuracy / testData.length) * 100,
    })
  }

  console.table(resultGlobal)
}

function distance(pointA, pointB) {
  if (pointA.length === pointB.length) {
    return Math.pow(
      pointA
        .map((e, i) => Math.pow(Math.abs(e - pointB[i]), 2))
        .reducer((accumulator, currentValue) => accumulator + currentValue, 0),
      0.5
    )
  } else throw new Error("Не возможно расчитать растояние между точками!")
}

function knn(data, point, k) {
  //       0             1        2        3
  // [dropPosition, bounciness, size, bucketLabel]

  const withLength = data.map((drop) => [
    distance([drop[0], drop[1], drop[2]]),
    drop[3],
  ])

  const sorted = withLength.sort((dropA, dropB) => dropA[0] - dropB[0])

  const countedByFrequency = countByFrequency(
    sorted.slice(0, k).map((drop) => drop[1])
  )

  const mostCommon = Object.entries(countedByFrequency).sort(
    ([value1, count1], [value2, count2]) => count2 - count1
  )[0][0]

  return +mostCommon
}

function splitDataset(data, testsetValue) {
  const shuffledData = data
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  const testData = shuffledData.slice(0, testsetValue)
  const trainingData = shuffledData.slice(testsetValue)

  return [trainingData, testData]
}
