<script setup lang="ts">
import { pt_br } from '@nuxt/ui/locale'

/*
 * Tokens do DESIGN.md ("The Field Ledger") forçados via style inline no <html>.
 *
 * ponytail: o caminho "certo" seria só CSS em main.css (:root{--ui-bg:...}), e isso
 * está lá — mas nesta combinação Nuxt UI 4.11.1 + Tailwind v4, a declaração da lib
 * dentro de `@layer theme` vence a minha mesmo com !important e mesmo sem ela ser
 * important (investigado: a stylesheet relevante bloqueia introspecção via CSSOM
 * nesta sandbox, então não dá pra confirmar a causa exata sem mais tempo). Style
 * inline no elemento raiz tem prioridade sobre qualquer regra de stylesheet e foi
 * testado funcionando de fato. Upgrade futuro do @nuxt/ui: tentar remover isto e
 * voltar a depender só do main.css.
 */
const tokensFieldLedger = [
  ['--ui-radius', '3px'],
  ['--ui-color-primary-50', '#f4faf6'],
  ['--ui-color-primary-100', '#e6f4ea'],
  ['--ui-color-primary-200', '#c9e8d2'],
  ['--ui-color-primary-300', '#a2d7b2'],
  ['--ui-color-primary-400', '#5ebb79'],
  ['--ui-color-primary-500', '#2d6a3f'],
  ['--ui-color-primary-600', '#234f30'],
  ['--ui-color-primary-700', '#1d4128'],
  ['--ui-color-primary-800', '#17331f'],
  ['--ui-color-primary-900', '#102315'],
  ['--ui-color-primary-950', '#0a170e'],
  ['--ui-primary', '#2d6a3f'],
  /*
   * success/warning/error/info por padrão apontam pro tom -500 puro de cada escala Tailwind
   * (green/yellow/blue/red) — verde e amarelo nessa faixa são claros demais pro fundo creme
   * (--ui-bg), texto quase ilegível; azul e vermelho já ficam ok mas um tom mais escuro
   * melhora a leitura também. Mesma técnica de override do --ui-primary acima.
   */
  ['--ui-success', '#166534'],
  ['--ui-warning', '#92400e'],
  ['--ui-error', '#b91c1c'],
  ['--ui-info', '#2563eb'],
  ['--ui-text-dimmed', '#8ab587'],
  ['--ui-text-muted', '#3c4a39'],
  ['--ui-text-toned', '#395837'],
  ['--ui-text', '#1b2a1a'],
  ['--ui-text-highlighted', '#1b2a1a'],
  ['--ui-text-inverted', '#ffffff'],
  ['--ui-bg', '#f5f3ea'],
  ['--ui-bg-muted', '#efece1'],
  ['--ui-bg-elevated', '#efece1'],
  ['--ui-bg-accented', '#e6e1d0'],
  ['--ui-bg-inverted', '#1b2a1a'],
  ['--ui-border', 'rgba(27, 42, 26, 0.14)'],
  ['--ui-border-muted', 'rgba(27, 42, 26, 0.14)'],
  ['--ui-border-accented', 'rgba(27, 42, 26, 0.24)'],
  ['--ui-border-inverted', '#1b2a1a'],
] as const

/**
 * Paleta de alto contraste (preto/amarelo, o par clássico de acessibilidade): usada no lugar
 * dos tokens acima quando o widget de acessibilidade está ativo. Mesma técnica de style inline
 * — ver comentário acima sobre por que não dá pra fazer isso só em main.css.
 */
const tokensAltoContraste = [
  ['--ui-radius', '3px'],
  ['--ui-color-primary-50', '#3a3200'],
  ['--ui-color-primary-100', '#4d4200'],
  ['--ui-color-primary-200', '#665800'],
  ['--ui-color-primary-300', '#8a7700'],
  ['--ui-color-primary-400', '#b39900'],
  ['--ui-color-primary-500', '#ffd60a'],
  ['--ui-color-primary-600', '#ffd60a'],
  ['--ui-color-primary-700', '#ffe14d'],
  ['--ui-color-primary-800', '#fff0a3'],
  ['--ui-color-primary-900', '#fff8d6'],
  ['--ui-color-primary-950', '#fffbe8'],
  ['--ui-primary', '#ffd60a'],
  ['--ui-text-dimmed', '#d9d9d9'],
  ['--ui-text-muted', '#ffffff'],
  ['--ui-text-toned', '#ffffff'],
  ['--ui-text', '#ffffff'],
  ['--ui-text-highlighted', '#ffffff'],
  ['--ui-text-inverted', '#000000'],
  ['--ui-bg', '#000000'],
  ['--ui-bg-muted', '#0d0d0d'],
  ['--ui-bg-elevated', '#141414'],
  ['--ui-bg-accented', '#1f1f1f'],
  ['--ui-bg-inverted', '#ffffff'],
  ['--ui-border', '#ffd60a'],
  ['--ui-border-muted', '#8a7700'],
  ['--ui-border-accented', '#ffd60a'],
  ['--ui-border-inverted', '#ffffff'],
] as const

const { altoContraste, escalaTexto } = useAcessibilidade()

const estiloHtml = computed(() => {
  const tokens = altoContraste.value ? tokensAltoContraste : tokensFieldLedger
  const cores = tokens.map(([prop, val]) => `${prop}: ${val} !important`).join('; ')
  return `${cores}; font-size: ${escalaTexto.value}% !important`
})

useHead({
  htmlAttrs: {
    style: estiloHtml,
    class: computed(() => (altoContraste.value ? 'alto-contraste' : '')),
  },
})
</script>

<template>
  <UApp :locale="pt_br">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <PainelAcessibilidade />
  </UApp>
</template>
