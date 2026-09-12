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

const estiloFieldLedger = tokensFieldLedger.map(([prop, val]) => `${prop}: ${val} !important`).join('; ')

useHead({
  htmlAttrs: { style: estiloFieldLedger },
})
</script>

<template>
  <UApp :locale="pt_br">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
