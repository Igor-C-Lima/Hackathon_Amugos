<script setup lang="ts">
// Página 4 — Portfólio por região/cultura + simulador de cenário combinado (RF-10).
// Acesso restrito ao perfil Diretoria (PAGES.md §4).
definePageMeta({ layout: 'gestor' })
useHead({ title: 'Portfólio — Portal Gestor' })

/** Sliders do stress test combinado: queda adicional de preço e agravamento do índice climático. */
const quedaPreco = ref(0)
const agravamentoClima = ref(0)

/**
 * Impacto no score ponderado pelos pesos reais de cada cliente (ScoreBreakdown).
 * ponytail: multiplicador 6 é calibração de demo — trocar pelo coeficiente do motor quando existir.
 */
function scoreSimulado(d: ClienteDossie) {
  const perda
    = quedaPreco.value * 6 * (d.breakdown.pesoCommodity / 100)
      + agravamentoClima.value * 6 * (d.breakdown.pesoClimatico / 100)
  return Math.max(0, Math.round(d.cliente.scoreAtual - perda))
}

const simulacao = computed(() =>
  carteira.map(d => ({
    dossie: d,
    score: scoreSimulado(d),
    rating: ratingDoScore(scoreSimulado(d)),
    rebaixado: ratingDoScore(scoreSimulado(d)) !== d.cliente.ratingAtual,
  })),
)

const cenarioAtivo = computed(() => quedaPreco.value > 0 || agravamentoClima.value > 0)

const media = (ns: number[]) => Math.round(ns.reduce((s, n) => s + n, 0) / ns.length)

const kpis = computed(() => {
  const scores = simulacao.value.map(s => s.score)
  const emRisco = simulacao.value.filter(s => s.rating === 'D' || s.rating === 'F').length
  return {
    clientes: carteira.length,
    exposto: carteira.reduce((s, d) => s + (d.cliente.limiteCreditoRecomendado ?? 0), 0),
    scoreMedio: media(scores),
    scoreMedioBase: media(carteira.map(d => d.cliente.scoreAtual)),
    emRisco,
    emRiscoBase: carteira.filter(d => d.cliente.ratingAtual === 'D' || d.cliente.ratingAtual === 'F').length,
  }
})

/** Agregação por chave arbitrária — serve tanto para cultura quanto para praça. */
function agrupar(chave: (d: ClienteDossie) => string) {
  const grupos = new Map<string, typeof simulacao.value>()
  for (const item of simulacao.value) {
    const k = chave(item.dossie)
    grupos.set(k, [...(grupos.get(k) ?? []), item])
  }
  return [...grupos.entries()]
    .map(([nome, itens]) => ({
      nome,
      clientes: itens.length,
      scoreMedio: media(itens.map(i => i.score)),
      scoreMedioBase: media(itens.map(i => i.dossie.cliente.scoreAtual)),
      exposto: itens.reduce((s, i) => s + (i.dossie.cliente.limiteCreditoRecomendado ?? 0), 0),
      climaMedio: media(itens.map(i => i.dossie.climatico.indiceRisco)),
      precoMedio: media(itens.map(i => i.dossie.commodity.indiceExposicao)),
    }))
    .sort((a, b) => b.exposto - a.exposto)
}

const porCultura = computed(() => agrupar(d => rotuloCultura[d.cliente.culturaPredominante]))
const porRegiao = computed(() => agrupar(d => `${d.cliente.municipio} / ${d.cliente.uf}`))

const rebaixados = computed(() => simulacao.value.filter(s => s.rebaixado))
</script>

<template>
  <UDashboardPanel id="portfolio">
    <template #header>
      <UDashboardNavbar title="Portfólio" icon="i-lucide-chart-pie">
        <template #right>
          <UBadge variant="subtle" color="warning" icon="i-lucide-cloud-rain-wind">
            Fase ONI: {{ rotuloFaseONI[faseONIVigente] }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UPageCard icon="i-lucide-users" title="Clientes monitorados">
            <p class="font-mono text-3xl font-semibold tabular-nums">
              {{ kpis.clientes }}
            </p>
          </UPageCard>

          <UPageCard icon="i-lucide-banknote" title="Limite total exposto">
            <p class="font-mono text-2xl font-semibold tabular-nums">
              {{ brl(kpis.exposto) }}
            </p>
          </UPageCard>

          <UPageCard icon="i-lucide-gauge" title="Score médio da carteira">
            <p class="font-mono text-3xl font-semibold tabular-nums">
              {{ kpis.scoreMedio }}
              <span v-if="cenarioAtivo" class="text-sm text-error">
                ({{ kpis.scoreMedio - kpis.scoreMedioBase }})
              </span>
            </p>
          </UPageCard>

          <UPageCard icon="i-lucide-triangle-alert" title="Clientes em rating D/F">
            <p class="font-mono text-3xl font-semibold tabular-nums">
              {{ kpis.emRisco }}
              <span v-if="cenarioAtivo && kpis.emRisco > kpis.emRiscoBase" class="text-sm text-error">
                (+{{ kpis.emRisco - kpis.emRiscoBase }})
              </span>
            </p>
          </UPageCard>
        </div>

        <!-- Simulador de cenário combinado clima + preço (RF-10) -->
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="font-semibold">
                  Simulador de cenário
                </h2>
                <p class="text-sm text-muted">
                  "Se o preço cair X% e a região agravar a fase ONI, o que acontece com a carteira?"
                </p>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-rotate-ccw"
                :disabled="!cenarioAtivo"
                @click="quedaPreco = 0; agravamentoClima = 0"
              >
                Voltar ao cenário atual
              </UButton>
            </div>
          </template>

          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-6">
              <div>
                <div class="mb-2 flex items-baseline justify-between text-sm">
                  <span>Queda adicional no preço da commodity</span>
                  <span class="font-mono tabular-nums">−{{ quedaPreco }}%</span>
                </div>
                <USlider v-model="quedaPreco" :min="0" :max="40" :step="5" color="info" />
              </div>

              <div>
                <div class="mb-2 flex items-baseline justify-between text-sm">
                  <span>Agravamento do índice climático</span>
                  <span class="font-mono tabular-nums">+{{ agravamentoClima }} pts</span>
                </div>
                <USlider v-model="agravamentoClima" :min="0" :max="40" :step="5" color="warning" />
              </div>

              <p class="text-xs text-dimmed">
                O impacto é ponderado pelo peso real de cada fator no score de cada cliente, não aplicado
                uniformemente — por isso clientes com barter e penhor de safra caem mais.
              </p>
            </div>

            <div>
              <p class="mb-2 text-sm font-medium">
                Migração de rating no cenário
              </p>
              <ul v-if="rebaixados.length" class="space-y-2">
                <li
                  v-for="item in rebaixados"
                  :key="item.dossie.cliente.cnpj"
                  class="flex items-center justify-between gap-3 text-sm"
                >
                  <ULink
                    :to="`/clientes/${item.dossie.cliente.cnpj}`"
                    class="min-w-0 truncate hover:text-primary"
                  >
                    {{ item.dossie.cliente.nomeFantasia ?? item.dossie.cliente.razaoSocial }}
                  </ULink>
                  <span class="flex shrink-0 items-center gap-2">
                    <UBadge :color="corRating[item.dossie.cliente.ratingAtual]" variant="subtle" size="sm">
                      {{ item.dossie.cliente.ratingAtual }} · {{ item.dossie.cliente.scoreAtual }}
                    </UBadge>
                    <UIcon name="i-lucide-arrow-right" class="size-3.5 text-muted" />
                    <UBadge :color="corRating[item.rating]" variant="subtle" size="sm">
                      {{ item.rating }} · {{ item.score }}
                    </UBadge>
                  </span>
                </li>
              </ul>
              <UEmpty
                v-else
                variant="naked"
                icon="i-lucide-equal"
                title="Nenhum rebaixamento neste cenário"
                description="Mova os controles para estressar a carteira."
              />
            </div>
          </div>
        </UCard>

        <div class="grid gap-6 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div>
                <h2 class="font-semibold">
                  Por cultura
                </h2>
                <p class="text-sm text-muted">
                  Benchmark de peers da mesma cultura
                </p>
              </div>
            </template>
            <PortfolioGrupo :grupos="porCultura" :cenario-ativo="cenarioAtivo" rotulo="Cultura" />
          </UCard>

          <UCard>
            <template #header>
              <div>
                <h2 class="font-semibold">
                  Por região
                </h2>
                <p class="text-sm text-muted">
                  Concentração de limite por praça
                </p>
              </div>
            </template>
            <PortfolioGrupo :grupos="porRegiao" :cenario-ativo="cenarioAtivo" rotulo="Praça" />
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
