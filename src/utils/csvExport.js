/**
 * Generate and download a CSV file from an array of objects.
 * @param {object[]} rows - array of data objects
 * @param {string[]} columns - column keys to include
 * @param {string[]} headers - display headers (same order as columns)
 * @param {string} filename - without extension
 */
export function downloadCsv(rows, columns, headers, filename = 'data') {
  const bom = '﻿'
  const headerLine = headers.map((h) => `"${h}"`).join(',')
  const dataLines = rows.map((row) =>
    columns.map((col) => {
      const val = row[col]
      if (val === null || val === undefined) return ''
      const s = String(val)
      // Escape quotes and wrap if contains comma/newline/quote
      if (s.includes(',') || s.includes('\n') || s.includes('"')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }).join(',')
  )
  const csv = bom + [headerLine, ...dataLines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
