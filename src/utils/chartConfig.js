import { Chart, registerables } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

// Register all Chart.js components once, globally.
Chart.register(...registerables, zoomPlugin)

/* ── Brand colors for charts ──────────────────────────────────── */
export const CHART_COLORS = {
  blue: '#4E63DA',
  navy: '#1E2B5B',
  green: '#22C55E',
  greenDk: '#5AF61F',
  amber: '#F59E0B',
  red: '#EF4444',
  gray: '#9CA3AF',
  grayLt: '#E5E7EB',
  sky: '#7B93F0',
  riskHigh: '#EF4444',
  riskMedium: '#F59E0B',
  riskLow: '#22C55E',
}

/* ── Default Chart.js options factory ─────────────────────────── */
export function makeBaseOptions(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    font: {
      family: "'Satoshi', system-ui, sans-serif",
      size: 12,
    },
    plugins: {
      tooltip: {
        backgroundColor: '#1E2B5B',
        titleFont: { weight: 'bold' },
        bodyFont: { size: 11 },
        cornerRadius: 12,
        padding: 12,
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 11 },
          color: '#6B7280',
        },
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          drag: { enabled: true, backgroundColor: 'rgba(78,99,218,0.08)', borderColor: '#4E63DA' },
          mode: 'x',
        },
        pan: { enabled: true, mode: 'x' },
      },
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 10 } },
      },
      y: {
        grid: { color: '#F3F4F6', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 10 } },
        beginAtZero: true,
      },
    },
    ...overrides,
  }
}

/** Call once from main.js or the shell to set global defaults */
export function registerChartDefaults() {
  Chart.defaults.font.family = "'Satoshi', system-ui, sans-serif"
  Chart.defaults.font.size = 12
  Chart.defaults.plugins.tooltip.backgroundColor = '#1E2B5B'
  Chart.defaults.plugins.tooltip.cornerRadius = 12
  Chart.defaults.plugins.legend.labels.usePointStyle = true
}

/* ── Risk color helpers ────────────────────────────────────────── */
export function colorForLevel(level) {
  if (level === 'tinggi') return CHART_COLORS.red
  if (level === 'sedang') return CHART_COLORS.amber
  if (level === 'rendah') return CHART_COLORS.green
  return CHART_COLORS.gray
}
