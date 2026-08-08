/**
 * Download a Chart.js instance as a PNG image.
 * @param {import('chart.js').Chart} chartInstance - the Chart.js instance
 * @param {string} filename - without extension
 */
export function downloadChartAsPng(chartInstance, filename = 'chart') {
  const url = chartInstance.toBase64Image('image/png', 1)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
