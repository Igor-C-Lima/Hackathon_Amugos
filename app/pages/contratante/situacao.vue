<script setup lang="ts">
import type { Rating, TipoRedFlag } from '~~/types/firestore'

// Página 8 — Minha Situação (RF-14 a RF-17).
// Linguagem simples: o leitor é o produtor rural, não um analista de crédito (PRODUCT.md).
// Sem canal de contestação, por decisão de produto (plano §2.2).
useHead({ title: 'Minha situação — Portal do Contratante' })

const contratante = useContratante()
const { dossie, pending } = useDossie(contratante)
const listaClientes = useListaClientes()

const alvoRating = computed(() =>
  dossie.value ? proximaFaixaRating(dossie.value.cliente.scoreAtual) : null,
)

/**
 * RF-12 (roadmap, DEVELOPMENT_PLAN.md) trazido pro MVP como leitura de progresso, não
 * ranking: média anônima de score entre pares da mesma cultura, nunca lista de concorrente
 * identificado (GAMIFICACAO.md). Cohort prioriza mesma UF; cai pra Brasil todo se a UF tiver
 * poucos pares — datasets pequenos (hackathon) raramente têm 2+ pares no mesmo estado.
 */
const benchmark = computed(() => {
  if (!dossie.value) return null
  const { cnpj, culturaPredominante, uf } = dossie.value.cliente
  const mesmaCultura = listaClientes.data.value?.filter(
    c => c.cnpj !== cnpj && c.culturaPredominante === culturaPredominante,
  ) ?? []
  const mesmaRegiao = mesmaCultura.filter(c => c.uf === uf)
  const pares = mesmaRegiao.length >= 2 ? mesmaRegiao : mesmaCultura
  if (pares.length < 1) return null

  const media = pares.reduce((soma, c) => soma + c.scoreAtual, 0) / pares.length
  return {
    regional: pares === mesmaRegiao,
    diferenca: Math.round(dossie.value.cliente.scoreAtual - media),
  }
})

watch([pending, dossie], ([carregando, d]) => {
  if (!carregando && !d) navigateTo('/contratante')
})

const explicacaoRating: Record<Rating, string> = {
  A: 'Sua situação está ótima. Você tem acesso ao limite completo e ao prazo mais longo que oferecemos.',
  B: 'Sua situação está boa. Há pontos de atenção, mas eles ainda não limitam sua compra a prazo.',
  C: 'Sua situação pede atenção. Hoje aprovamos um limite reduzido, e resolver as pendências abaixo tende a melhorar isso.',
  D: 'Sua situação está restrita. Para voltar a comprar a prazo, é preciso resolver as pendências abaixo.',
  F: 'Sua situação está bloqueada para compra a prazo. Fale com seu contato comercial na Krill Tech para entender os próximos passos.',
}

const orientacao: Record<TipoRedFlag, string> = {
  rj: 'Seu processo de recuperação judicial está em andamento. A negociação passa a seguir o plano aprovado — procure seu contato comercial.',
  protesto: 'Procure o cartório que registrou o protesto, quite ou negocie o valor e peça a carta de anuência. A baixa aparece aqui em até 5 dias.',
  embargo_ambiental: 'Verifique o embargo no portal do IBAMA e regularize a área junto ao órgão ambiental. Envie a comprovação ao seu contato comercial.',
  inadimplencia_tecnica: 'Você renegociou prazos mais de uma vez nos últimos meses. Cumprir o próximo vencimento sem renegociar já melhora sua situação.',
  climatico: 'Não é uma pendência sua: é o clima previsto para sua região e cultura. Você pode se antecipar conversando sobre prazo antes da colheita.',
  commodity: 'Não é uma pendência sua: é o preço da sua cultura no mercado. Vale avaliar travar preço ou ajustar o prazo de pagamento.',
}

/** RF-15: só o que o produtor pode resolver entra como pendência. */
const pendencias = computed(() =>
  dossie.value?.cliente.redFlags.filter(f => f.tipo !== 'climatico' && f.tipo !== 'commodity') ?? [],
)

/** RF-17: alerta preventivo de clima e preço na própria região/cultura. */
const preventivos = computed(() =>
  dossie.value?.cliente.redFlags.filter(f => f.tipo === 'climatico' || f.tipo === 'commodity') ?? [],
)

function sair() {
  contratante.value = ''
  navigateTo('/contratante')
}
</script>

<template>
  <div v-if="dossie" class="min-h-screen bg-elevated/30">
    <header class="border-b border-default bg-default">
      <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-sprout" class="size-6 text-primary" />
          <div>
            <p class="font-semibold">
              {{ dossie.cliente.nomeFantasia ?? dossie.cliente.razaoSocial }}
            </p>
            <p class="text-xs text-muted">
              {{ mascaraCnpj(dossie.cliente.cnpj) }}
            </p>
          </div>
        </div>
        <UButton color="neutral" variant="ghost" icon="i-lucide-log-out" size="sm" @click="sair">
          Sair
        </UButton>
      </div>
    </header>

    <main class="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <!-- RF-14: score e rating em linguagem simples -->
      <UCard>
        <div class="flex flex-wrap items-center gap-6">
          <MedidorScore :score="dossie.cliente.scoreAtual" :rating="dossie.cliente.ratingAtual" :tamanho="140" />
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge :color="corRating[dossie.cliente.ratingAtual]" variant="subtle" size="lg">
                Classificação {{ dossie.cliente.ratingAtual }}
              </UBadge>
              <!-- Selo de reforço: só nas faixas altas, nunca recompensa vazia (GAMIFICACAO.md) -->
              <UBadge v-if="dossie.cliente.ratingAtual === 'A'" color="success" variant="soft" icon="i-lucide-award">
                Nota máxima
              </UBadge>
            </div>
            <p class="text-sm text-toned">
              {{ explicacaoRating[dossie.cliente.ratingAtual] }}
            </p>

            <!-- RF-14: alvo de progresso em vez de só o número -->
            <div v-if="alvoRating" class="space-y-1 pt-1">
              <p class="text-xs text-muted">
                Faltam <span class="font-mono font-semibold text-highlighted">{{ alvoRating.faltam }} pontos</span>
                para o rating {{ alvoRating.rating }}
              </p>
              <UProgress :model-value="dossie.cliente.scoreAtual" :max="1000" :color="corRating[dossie.cliente.ratingAtual]" size="sm" />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span class="text-muted">
              Limite aprovado hoje
            </span>
            <span class="font-mono font-semibold">
              {{ brl(dossie.cliente.limiteCreditoRecomendado ?? 0) }}
            </span>
          </div>
        </template>
      </UCard>

      <!-- RF-14: o que pesa na nota, sem jargão -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            O que pesa na sua nota
          </h2>
        </template>

        <div class="space-y-4 text-sm">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-file-check" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <p class="font-medium">
                Seu histórico e documentação — {{ dossie.breakdown.pesoJuridicoFiscal }}% da nota
              </p>
              <p class="text-muted">
                Tempo de atividade, certidões, protestos e histórico de pagamento com a Krill Tech.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-cloud-rain-wind" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <p class="font-medium">
                Clima previsto para sua região — {{ dossie.breakdown.pesoClimatico }}% da nota
              </p>
              <p class="text-muted">
                {{ dossie.climatico.regiao }} está em fase de
                {{ rotuloFaseONI[dossie.climatico.faseONI].toLowerCase() }}. Em anos assim, a colheita de
                {{ rotuloCultura[dossie.climatico.cultura].toLowerCase() }} na sua região rendeu, em média,
                {{ dossie.climatico.quedaProdutividadeHistorica }}% menos.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-trending-down" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <p class="font-medium">
                Preço da sua cultura — {{ dossie.breakdown.pesoCommodity }}% da nota
              </p>
              <p class="text-muted">
                {{ rotuloCultura[dossie.commodity.cultura] }} está a
                {{ brl(dossie.commodity.precoAtual) }} por
                {{ unidadeCultura[dossie.commodity.cultura] }}, {{ pct(dossie.commodity.variacao6Meses) }}
                nos últimos 6 meses. Sua colheita é em {{ dossie.janelaColheita }}.
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- RF-12 (roadmap): benchmark anônimo de pares, sem expor concorrente identificado -->
      <UAlert
        v-if="benchmark && benchmark.diferenca !== 0"
        :icon="benchmark.diferenca > 0 ? 'i-lucide-trending-up' : 'i-lucide-users'"
        :color="benchmark.diferenca > 0 ? 'success' : 'neutral'"
        variant="subtle"
        :title="benchmark.diferenca > 0 ? 'Acima da média' : 'Abaixo da média'"
        :description="`Seu score está ${Math.abs(benchmark.diferenca)} pontos ${benchmark.diferenca > 0 ? 'acima' : 'abaixo'} da média de produtores de ${rotuloCultura[dossie.cliente.culturaPredominante].toLowerCase()} ${benchmark.regional ? 'na sua região' : 'na carteira'}.`"
      />

      <!-- RF-17: alerta preventivo de clima e preço -->
      <UAlert
        v-for="(flag, i) in preventivos"
        :key="i"
        :icon="iconeRedFlag[flag.tipo]"
        color="warning"
        variant="subtle"
        :title="flag.tipo === 'climatico' ? 'Aviso de clima para sua região' : 'Aviso de preço para sua cultura'"
        :description="`${flag.descricao} ${orientacao[flag.tipo]}`"
      />

      <!-- RF-15: pendências e como resolver -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Pendências para resolver
          </h2>
        </template>

        <ul v-if="pendencias.length" class="divide-y divide-default">
          <li v-for="(flag, i) in pendencias" :key="i" class="space-y-1 py-4 first:pt-0 last:pb-0">
            <div class="flex flex-wrap items-center gap-2">
              <UIcon :name="iconeRedFlag[flag.tipo]" class="size-4 text-muted" />
              <span class="font-medium">{{ rotuloRedFlag[flag.tipo] }}</span>
              <UBadge :color="corSeveridade[flag.severidade]" variant="subtle" size="sm">
                {{ flag.severidade }}
              </UBadge>
            </div>
            <p class="text-sm text-toned">
              {{ flag.descricao }}
            </p>
            <p class="flex items-start gap-1.5 text-sm text-muted">
              <UIcon name="i-lucide-lightbulb" class="mt-0.5 size-4 shrink-0" />
              {{ orientacao[flag.tipo] }}
            </p>
          </li>
        </ul>

        <UEmpty
          v-else
          variant="naked"
          icon="i-lucide-circle-check"
          title="Nenhuma pendência sua"
          description="Sua documentação está em ordem com a Krill Tech."
        />
      </UCard>

      <!-- RF-16: status de solicitação de aumento de limite -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Aumento de limite
          </h2>
        </template>

        <UStepper
          disabled
          :default-value="1"
          :items="[
            { title: 'Solicitado', description: dataBR(dossie.cliente.atualizadoEm), icon: 'i-lucide-send' },
            { title: 'Em análise', description: 'Time de crédito avaliando', icon: 'i-lucide-search' },
            { title: 'Resposta', description: 'Você recebe o retorno por aqui', icon: 'i-lucide-check' },
          ]"
        />
      </UCard>

      <p class="text-center text-xs text-dimmed">
        As informações desta página são a leitura de risco da Krill Tech. Dúvidas sobre algum item?
        Fale com seu contato comercial.
      </p>
    </main>
  </div>
</template>
