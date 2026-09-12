<script setup lang="ts">
defineProps<{
  rotulo: string
  cenarioAtivo: boolean
  grupos: {
    nome: string
    clientes: number
    scoreMedio: number
    scoreMedioBase: number
    exposto: number
    climaMedio: number
    precoMedio: number
  }[]
}>()
</script>

<template>
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-default text-left text-xs text-muted">
        <th class="pb-2 font-medium">
          {{ rotulo }}
        </th>
        <th class="pb-2 text-right font-medium">
          Clientes
        </th>
        <th class="pb-2 text-right font-medium">
          Score médio
        </th>
        <th class="pb-2 text-right font-medium" title="Índice climático médio">
          Clima
        </th>
        <th class="pb-2 text-right font-medium" title="Índice de exposição a preço médio">
          Preço
        </th>
        <th class="pb-2 text-right font-medium">
          Exposto
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-default">
      <tr v-for="g in grupos" :key="g.nome">
        <td class="py-2.5">
          {{ g.nome }}
        </td>
        <td class="py-2.5 text-right font-mono tabular-nums">
          {{ g.clientes }}
        </td>
        <td class="py-2.5 text-right font-mono tabular-nums">
          <UBadge :color="corRating[ratingDoScore(g.scoreMedio)]" variant="subtle" size="sm">
            {{ g.scoreMedio }}
          </UBadge>
          <span v-if="cenarioAtivo && g.scoreMedio !== g.scoreMedioBase" class="ml-1 text-xs text-error">
            {{ g.scoreMedio - g.scoreMedioBase }}
          </span>
        </td>
        <td class="py-2.5 text-right font-mono tabular-nums text-muted">
          {{ g.climaMedio }}
        </td>
        <td class="py-2.5 text-right font-mono tabular-nums text-muted">
          {{ g.precoMedio }}
        </td>
        <td class="py-2.5 text-right font-mono tabular-nums">
          {{ brl(g.exposto) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
