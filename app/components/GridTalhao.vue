<script setup lang="ts">
/**
 * Grid de plantação: duas famílias de linhas de plantio cruzadas, cada uma correndo para
 * o seu lado do horizonte. Os dois pontos de fuga ficam fora da tela de propósito — dentro
 * dela a malha se lê como talhão, não como leque saindo de um ponto.
 *
 * Extraído da landing (era inline em app/pages/index.vue) para reuso nas telas de chegada
 * do portal (login) — um wrapper com a classe global `.campo-fundo` (main.css) fornece a
 * trama de pontos e o `overflow: hidden`; este componente só desenha as linhas por cima.
 */
const horizonte = 262
const fugaDireita = 2120
const fugaEsquerda = -680

const colunas = Array.from({ length: 13 }, (_, i) => -1300 + i * 330)

const grade = [
  ...colunas.map(x => ({ vp: fugaDireita, x })),
  ...colunas.map(x => ({ vp: fugaEsquerda, x: x + 1000 })),
].map(({ vp, x }) => ({ x1: vp, y1: horizonte, x2: x, y2: 880 }))
</script>

<template>
  <svg
    class="talhao"
    viewBox="0 0 1440 820"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <!-- Junto ao horizonte as linhas se acumulam; o degradê dissolve essa faixa. -->
      <linearGradient id="brumaHorizonte" gradientUnits="userSpaceOnUse" x1="0" :y1="horizonte" x2="0" y2="620">
        <stop offset="0" stop-color="#000" />
        <stop offset="0.35" stop-color="#666" />
        <stop offset="1" stop-color="#fff" />
      </linearGradient>
      <mask id="mascaraTalhao">
        <rect x="0" y="0" width="1440" height="820" fill="url(#brumaHorizonte)" />
      </mask>
    </defs>

    <g mask="url(#mascaraTalhao)">
      <line
        v-for="(linha, i) in grade"
        :key="i"
        :x1="linha.x1"
        :y1="linha.y1"
        :x2="linha.x2"
        :y2="linha.y2"
      />
    </g>
  </svg>
</template>

<style scoped>
.talhao {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.talhao line {
  stroke: #7ba277;
  stroke-width: 1.3;
  opacity: 0.32;
}
</style>
