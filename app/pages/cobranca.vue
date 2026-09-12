<script setup lang="ts">
// Página 5 — Esteira de Priorização de Cobrança (RF-07).
// Tela de trabalho do Analista de Cobrança: atuação em lote, ordenada por Risco × Valor em Aberto —
// nem por rating isolado, nem por dívida isolada.
definePageMeta({ layout: 'gestor' })
useHead({ title: 'Esteira de cobrança — Portal Gestor' })

// Sem historico/cobrancas aqui — a fila só precisa do cadastro + red flags de cada
// cliente e do feed de alertas, então `useListaClientes` (sem subcoleções) já basta.
const listaClientes = useListaClientes()
const alertasFeed = useAlertasFeed()

/**
 * Proxy de perda esperada: probabilidade de não pagar × exposição.
 * ponytail: risco derivado do score (1 − score/1000); trocar pela PD real do motor quando existir.
 */
const perdaEsperada = (score: number, valor: number) => Math.round((1 - score / 1000) * valor)

const ranking = computed(() =>
  (listaClientes.value ?? [])
    .map(c => ({
      dossie: { cliente: c },
      risco: 1 - c.scoreAtual / 1000,
      perda: perdaEsperada(c.scoreAtual, c.valorEmAberto),
      motivo: motivoRanking(c.cnpj, alertasFeed.value ?? [], c.redFlags),
    }))
    .sort((a, b) => b.perda - a.perda),
)

const totalAberto = computed(() => (listaClientes.value ?? []).reduce((s, c) => s + c.valorEmAberto, 0))
const totalPerda = computed(() => ranking.value.reduce((s, r) => s + r.perda, 0))

/** Concentração: quanto da perda esperada está nos três primeiros da fila. */
const concentracao = computed(() =>
  Math.round((ranking.value.slice(0, 3).reduce((s, r) => s + r.perda, 0) / totalPerda.value) * 100),
)

const maiorPerda = computed(() => ranking.value[0]?.perda ?? 1)
</script>

<template>
  <UDashboardPanel id="cobranca">
    <template #header>
      <UDashboardNavbar title="Esteira de cobrança" icon="i-lucide-list-ordered">
        <template #right>
          <UBadge variant="subtle" color="neutral">
            {{ ranking.length }} clientes com saldo em aberto
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-3">
          <UPageCard icon="i-lucide-receipt" title="Total em aberto">
            <p class="font-mono text-2xl font-semibold tabular-nums">
              {{ brl(totalAberto) }}
            </p>
          </UPageCard>

          <UPageCard
            icon="i-lucide-trending-down"
            title="Perda esperada"
            description="Soma de risco × valor em aberto da carteira"
          >
            <p class="font-mono text-2xl font-semibold tabular-nums text-warning">
              {{ brl(totalPerda) }}
            </p>
          </UPageCard>

          <UPageCard
            icon="i-lucide-target"
            title="Concentração no topo"
            description="Fatia da perda esperada nos 3 primeiros da fila"
          >
            <p class="font-mono text-2xl font-semibold tabular-nums">
              {{ concentracao }}%
            </p>
          </UPageCard>
        </div>

        <UAlert
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          title="Como a fila é ordenada"
          description="Por risco × valor em aberto, não por rating. Um cliente rating B com exposição alta sobe na fila; um rating D que deve pouco desce. A ordem é onde a cobrança rende mais, não onde o cliente é pior."
        />

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <div class="overflow-x-auto">
            <table class="w-full min-w-3xl text-sm">
              <thead>
                <tr class="border-b border-default text-left text-xs text-muted">
                  <th class="py-3 pl-4 pr-2 font-medium">
                    #
                  </th>
                  <th class="px-2 py-3 font-medium">
                    Cliente
                  </th>
                  <th class="px-2 py-3 font-medium">
                    Rating
                  </th>
                  <th class="px-2 py-3 text-right font-medium">
                    Valor em aberto
                  </th>
                  <th class="px-2 py-3 text-right font-medium">
                    Perda esperada
                  </th>
                  <th class="py-3 pl-2 pr-4 font-medium">
                    Motivo da entrada
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-default">
                <tr
                  v-for="(item, i) in ranking"
                  :key="item.dossie.cliente.cnpj"
                  class="cursor-pointer transition-colors hover:bg-elevated/50"
                  @click="navigateTo(`/clientes/${item.dossie.cliente.cnpj}`)"
                >
                  <td class="py-3 pl-4 pr-2 font-mono tabular-nums text-muted">
                    {{ i + 1 }}
                  </td>

                  <td class="px-2 py-3">
                    <p class="font-medium text-highlighted">
                      {{ item.dossie.cliente.nomeFantasia ?? item.dossie.cliente.razaoSocial }}
                    </p>
                    <p class="text-xs text-muted">
                      {{ item.dossie.cliente.municipio }} / {{ item.dossie.cliente.uf }} ·
                      {{ rotuloCultura[item.dossie.cliente.culturaPredominante] }}
                    </p>
                  </td>

                  <td class="px-2 py-3">
                    <UBadge :color="corRating[item.dossie.cliente.ratingAtual]" variant="subtle" size="sm">
                      {{ item.dossie.cliente.ratingAtual }}
                    </UBadge>
                  </td>

                  <td class="px-2 py-3 text-right font-mono tabular-nums">
                    {{ brl(item.dossie.cliente.valorEmAberto) }}
                  </td>

                  <td class="px-2 py-3 text-right">
                    <p class="font-mono font-medium tabular-nums text-warning">
                      {{ brl(item.perda) }}
                    </p>
                    <UProgress
                      :model-value="(item.perda / maiorPerda) * 100"
                      color="warning"
                      size="xs"
                      class="mt-1"
                    />
                  </td>

                  <td class="max-w-md py-3 pl-2 pr-4 text-xs text-muted">
                    {{ item.motivo }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
