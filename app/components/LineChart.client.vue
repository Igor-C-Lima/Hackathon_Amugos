<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  labels: string[]
  values: number[]
  label: string
  /** Índice a partir do qual a janela de safra é destacada (RF-30). */
  destaqueDe?: number
}>()

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.values,
      borderColor: 'oklch(0.65 0.17 155)',
      backgroundColor: 'oklch(0.65 0.17 155 / 0.12)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: props.labels.map((_, i) =>
        props.destaqueDe !== undefined && i >= props.destaqueDe ? 5 : 3,
      ),
      pointBackgroundColor: props.labels.map((_, i) =>
        props.destaqueDe !== undefined && i >= props.destaqueDe
          ? 'oklch(0.65 0.2 30)'
          : 'oklch(0.65 0.17 155)',
      ),
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(128,128,128,0.15)' } },
  },
}
</script>

<template>
  <div class="h-48">
    <Line :data="data" :options="options" />
  </div>
</template>
