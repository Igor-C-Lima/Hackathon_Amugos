<script setup lang="ts">
import type { Rating } from '~~/types/firestore'

/**
 * Medidor circular do score (0–1000). Segue o padrão "Meter" da skill de dataviz:
 * é uma razão contra um limite (RF-02), não uma série — por isso vira medidor, não
 * um gráfico de pizza de 2 fatias. Preenchimento e trilha usam o MESMO matiz (o da
 * severidade/rating), só variando opacidade — nunca preenchido colorido + trilha
 * cinza neutro, que perderia a leitura "este tom é o estado do cliente".
 *
 * O número central fica na cor de texto do sistema (nunca a cor da série): a cor
 * mora no anel, o dado mora no texto — mesma regra que já vale pros badges de rating.
 */
const props = withDefaults(defineProps<{
  score: number
  rating: Rating
  tamanho?: number
}>(), {
  tamanho: 128,
})

const raio = computed(() => props.tamanho / 2 - 12)
const perimetro = computed(() => 2 * Math.PI * raio.value)
const progresso = computed(() => Math.max(0, Math.min(1, props.score / 1000)))
const offset = computed(() => perimetro.value * (1 - progresso.value))

/** Mesmo papel semântico do corRating em dominio.ts, mas como var CSS do Nuxt UI. */
const corPorRating: Record<Rating, string> = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'error',
  F: 'error',
}

const matiz = computed(() => `var(--ui-color-${corPorRating[props.rating]}-400)`)
</script>

<template>
  <div
    class="relative inline-grid place-items-center"
    :style="{ width: `${tamanho}px`, height: `${tamanho}px` }"
    role="img"
    :aria-label="`Score ${score} de 1000, rating ${rating}`"
  >
    <svg :viewBox="`0 0 ${tamanho} ${tamanho}`" class="-rotate-90">
      <circle
        :cx="tamanho / 2"
        :cy="tamanho / 2"
        :r="raio"
        fill="none"
        :stroke="matiz"
        stroke-opacity="0.16"
        stroke-width="10"
      />
      <circle
        :cx="tamanho / 2"
        :cy="tamanho / 2"
        :r="raio"
        fill="none"
        :stroke="matiz"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="perimetro"
        :stroke-dashoffset="offset"
        class="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>

    <div class="absolute flex flex-col items-center leading-none">
      <span class="font-mono text-3xl font-semibold text-highlighted">
        {{ score }}
      </span>
      <span class="mt-1 text-xs text-muted">
        /1000
      </span>
    </div>
  </div>
</template>
