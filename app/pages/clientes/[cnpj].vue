<script setup lang="ts">
import { marked } from 'marked'

// Página 3 — Ficha do Cliente. A mais pesada do MVP:
// RF-01 a RF-05, RF-08, RF-09, RF-11, RF-12, RF-22, RF-29, RF-30 + regras do glossário (plano §4).
definePageMeta({ layout: 'gestor' })

const route = useRoute()
const cnpj = route.params.cnpj as string
const { dossie, pending } = useDossie(cnpj)

// A busca é assíncrona agora (Firestore) — só dá pra saber que não existe depois que
// a consulta termina e ainda assim não veio nada. `showError`, não `createError` direto:
// isso roda depois da renderização inicial, não durante ela.
watch([pending, dossie], ([carregando, d]) => {
  if (!carregando && !d) {
    showError(createError({ statusCode: 404, statusMessage: 'Cliente não encontrado', fatal: true }))
  }
})

// Os campos abaixo só existem quando dossie carrega — o template inteiro fica atrás de
// um `v-if="dossie"`, então o `!` é seguro: se `cliente` está sendo lido, `dossie` já existe.
const cliente = computed(() => dossie.value!.cliente)
const climatico = computed(() => dossie.value!.climatico)
const commodity = computed(() => dossie.value!.commodity)
const breakdown = computed(() => dossie.value!.breakdown)
const historico = computed(() => dossie.value!.historico)
const janelaColheita = computed(() => dossie.value!.janelaColheita)
const fimColheita = computed(() => dossie.value!.fimColheita)
const proximoVencimento = computed(() => dossie.value!.proximoVencimento)
const cobrancas = computed(() => dossie.value!.cobrancas)
const imovel = computed(() => dossie.value!.imovel)

useHead({
  title: computed(() => dossie.value ? `${dossie.value.cliente.razaoSocial} — Portal Gestor` : 'Ficha do cliente'),
})

const toast = useToast()
const perfil = usePerfil()

const {
  relatorio,
  erroRelatorio,
  carregandoRelatorio,
  gerarRelatorio,
} = useAnaliseCliente()

const usarRelatorioMock = ref(true)

const resumoExecutivo = computed(() => relatorio.value || cliente.value.relatorioLLM)
const resumoExecutivoHtml = computed(() => marked.parse(resumoExecutivo.value ?? '', { async: false }))

/**
 * Dados já conhecidos do dossiê sintético, usados como fallback quando o
 * CNPJ é fictício (carteira mock) e a Receita Federal/DataJud/SICAR reais
 * não encontram nada. Se o CNPJ for real, o fallback simplesmente não é
 * usado — os coletores reais têm prioridade.
 */
const fallbackSintetico = computed(() => ({
  receitaFederal: {
    razaoSocial: cliente.value.razaoSocial,
    situacao: 'ATIVA',
    cnaeDescricao: cliente.value.cnae,
    dataAbertura: cliente.value.dataAbertura.toISOString().slice(0, 10),
    socios: [] as string[],
    municipio: cliente.value.municipio,
    uf: cliente.value.uf,
  },
  dataJud: {
    processos: cliente.value.redFlags
      .filter(f => f.tipo === 'rj' || f.tipo === 'protesto')
      .map(f => ({ tipo: rotuloRedFlag[f.tipo], status: f.severidade })),
  },
  sicar: {
    areaHectares: imovel.value.areaTotalHa,
    regular: imovel.value.situacaoCAR === 'ativo',
    embargos: cliente.value.redFlags.filter(f => f.tipo === 'embargo_ambiental').length,
  },
}))

/**
 * Score, rating, red flags, risco climático e exposição a commodity já
 * existem no dossiê sintético (carteira mock), mas não fazem parte do que
 * os coletores reais (Receita Federal/Agritec) sabem buscar — isso é
 * trabalho do motor de score (RF-19 a RF-27), que ainda não existe.
 * Manda esses dados como contexto adicional pro agente, pra o relatório
 * sair completo em vez de dizer "não informado" pra cliente mockado.
 */
const contextoAdicionalSintetico = computed(() => {
  const listaRedFlags = cliente.value.redFlags.length
    ? cliente.value.redFlags.map(f => `${rotuloRedFlag[f.tipo]} (severidade ${f.severidade}): ${f.descricao}`).join('; ')
    : 'nenhuma red flag identificada'

  return [
    `Score de crédito: ${cliente.value.scoreAtual}/1000, rating ${cliente.value.ratingAtual}.`,
    `Red flags identificadas: ${listaRedFlags}.`,
    `Risco climático: fase ONI ${rotuloFaseONI[climatico.value.faseONI]}, índice de risco ${climatico.value.indiceRisco}/100, queda histórica de produtividade de ${climatico.value.quedaProdutividadeHistorica}% na região (${climatico.value.regiao}).`,
    `Exposição a preço de commodity: ${rotuloCultura[commodity.value.cultura]} a ${brl(commodity.value.precoAtual)}, variação de ${pct(commodity.value.variacao6Meses)} em 6 meses, tendência de ${commodity.value.tendencia}, índice de exposição ${commodity.value.indiceExposicao}/100.`,
    `Situação da safra: janela de colheita em ${janelaColheita.value}, próximo vencimento de fatura em ${dataBR(proximoVencimento.value)}.`,
    `Limite de crédito recomendado pelo motor interno: ${brl(cliente.value.limiteCreditoRecomendado ?? 0)}, condições sugeridas: ${cliente.value.condicoesPagamentoRecomendadas ?? 'não definidas'}. Valor em aberto atual: ${brl(cliente.value.valorEmAberto)}.`,
  ].join('\n\n')
})

const emRJ = computed(() => cliente.value.redFlags.some(f => f.tipo === 'rj'))

const fatores = computed(() => [
  { rotulo: 'Jurídico / fiscal / cadastral', peso: breakdown.value.pesoJuridicoFiscal, cor: 'neutral' as const },
  { rotulo: 'Risco climático (ONI × CONAB)', peso: breakdown.value.pesoClimatico, cor: 'warning' as const },
  { rotulo: 'Exposição a preço de commodity', peso: breakdown.value.pesoCommodity, cor: 'info' as const },
])

/** RF-29: a fatura vence antes de o cliente terminar de colher e comercializar? */
const vencimentoAntesDaColheita = computed(() => !!fimColheita.value && proximoVencimento.value < fimColheita.value)

// O limite parte da recomendação do motor assim que o cliente carrega, mas não deve
// voltar a pular se o Firestore reemitir o mesmo doc por um motivo qualquer — só
// preenche na primeira vez que os dados chegam (`once`, Vue 3.4+). Também semeia
// direto do valor já resolvido: numa navegação SSR (URL direta/reload) `dossie` já
// chega pronto na montagem, e um `watch` sem `immediate` nunca dispara nesse caso —
// só reage a mudanças depois do setup.
const limite = ref(dossie.value?.cliente.limiteCreditoRecomendado ?? 0)
watch(dossie, (d) => {
  if (d) limite.value = d.cliente.limiteCreditoRecomendado ?? 0
}, { once: true })

/**
 * Exportação em PDF pelo diálogo de impressão do navegador — sem dependência extra.
 * Dois documentos saem da mesma página: a ficha inteira (RF-12) e só o histórico de cobrança.
 * A classe no <body> diz ao CSS de impressão qual dos dois recortar.
 */
const soCobranca = ref(false)
const emitidoEm = ref('')

useHead({
  bodyAttrs: { class: computed(() => (soCobranca.value ? 'imprimir-so-cobranca' : '')) },
})

async function imprimir(recorte: 'ficha' | 'cobranca') {
  emitidoEm.value = new Date().toLocaleString('pt-BR')
  soCobranca.value = recorte === 'cobranca'
  await nextTick()
  window.print()
  soCobranca.value = false
}

const totalNegociado = computed(() =>
  cobrancas.value.reduce((s, c) => s + (c.valor ?? 0), 0),
)

/** RF-28: CAR fora de "ativo" compromete a garantia sobre a área e pode travar crédito rural. */
const carIrregular = computed(() => imovel.value.situacaoCAR !== 'ativo')

const proporcaoPlantada = computed(() =>
  Math.round((imovel.value.areaPlantadaHa / imovel.value.areaTotalHa) * 100),
)

const salvando = ref(false)

async function registrarDecisao() {
  // RF-11: decisão manual — grava direto no doc do cliente (sem trilha de auditoria
  // separada, fora do MVP por decisão de escopo já registrada em PRODUCT.md).
  salvando.value = true
  try {
    await registrarDecisaoCredito(cnpj, limite.value, cliente.value.condicoesPagamentoRecomendadas)
    toast.add({
      title: 'Decisão registrada',
      description: `Limite de ${brl(limite.value)} aprovado para ${cliente.value.razaoSocial}.`,
      color: 'success',
      icon: 'i-lucide-check',
    })
  }
  catch {
    toast.add({
      title: 'Falha ao registrar',
      description: 'Não foi possível salvar a decisão no banco. Tente de novo.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  }
  finally {
    salvando.value = false
  }
}
</script>

<template>
  <UDashboardPanel v-if="dossie" id="ficha">
    <template #header>
      <UDashboardNavbar :title="cliente.nomeFantasia ?? cliente.razaoSocial">
        <template #leading>
          <UButton
            to="/clientes"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Voltar para clientes"
          />
        </template>
        <template #right>
          <UBadge :color="corRating[cliente.ratingAtual]" variant="subtle" size="lg">
            Rating {{ cliente.ratingAtual }}
          </UBadge>
          <span class="font-mono text-xl font-semibold tabular-nums">
            {{ cliente.scoreAtual }}<span class="text-sm text-muted">/1000</span>
          </span>
          <!-- RF-12: exportar em PDF via diálogo de impressão do navegador — sem dependência extra. -->
          <UButton
            icon="i-lucide-file-down"
            color="neutral"
            variant="ghost"
            aria-label="Exportar relatório em PDF"
            class="print:hidden"
            @click="imprimir('ficha')"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Stay Period: regra do glossário (plano §4) -->
        <UAlert
          v-if="emRJ"
          color="error"
          variant="subtle"
          icon="i-lucide-gavel"
          title="Recuperação judicial deferida — Stay Period ativo"
          description="Execução e protesto estão suspensos por 180 dias (até 07/07/2026). Nenhuma medida de cobrança é juridicamente possível nesse período: habilite o crédito no processo e acompanhe o plano."
        />

        <!-- Os quatro números que decidem o crédito -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UPageCard
            title="Score consolidado"
            :description="`Rating ${cliente.ratingAtual} · atualizado em ${dataBR(cliente.atualizadoEm)}`"
          >
            <MedidorScore :score="cliente.scoreAtual" :rating="cliente.ratingAtual" :tamanho="104" />
          </UPageCard>

          <UPageCard
            icon="i-lucide-cloud-rain-wind"
            title="Índice de risco climático"
            :description="`${rotuloFaseONI[climatico.faseONI]} · queda histórica de ${climatico.quedaProdutividadeHistorica}%`"
          >
            <p class="font-mono text-3xl font-semibold tabular-nums">
              {{ climatico.indiceRisco }}<span class="text-sm text-muted">/100</span>
            </p>
          </UPageCard>

          <UPageCard
            icon="i-lucide-trending-down"
            title="Exposição a preço"
            :description="`${rotuloCultura[commodity.cultura]} ${pct(commodity.variacao6Meses)} em 6 meses · tendência de ${commodity.tendencia}`"
          >
            <p class="font-mono text-3xl font-semibold tabular-nums">
              {{ commodity.indiceExposicao }}<span class="text-sm text-muted">/100</span>
            </p>
          </UPageCard>

          <UPageCard
            icon="i-lucide-banknote"
            title="Limite recomendado"
            :description="cliente.condicoesPagamentoRecomendadas"
          >
            <p class="font-mono text-2xl font-semibold tabular-nums">
              {{ brl(cliente.limiteCreditoRecomendado ?? 0) }}
            </p>
          </UPageCard>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Dados cadastrais (RF-01) -->
          <UCard>
            <template #header>
              <h2 class="font-semibold">
                Dados cadastrais
              </h2>
            </template>
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-muted">
                  Razão social
                </dt>
                <dd>{{ cliente.razaoSocial }}</dd>
              </div>
              <div>
                <dt class="text-muted">
                  CNPJ
                </dt>
                <dd class="font-mono">
                  {{ mascaraCnpj(cliente.cnpj) }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">
                  CNAE
                </dt>
                <dd>{{ cliente.cnae }}</dd>
              </div>
              <div>
                <dt class="text-muted">
                  Praça
                </dt>
                <dd>{{ cliente.municipio }} / {{ cliente.uf }}</dd>
              </div>
              <div>
                <dt class="text-muted">
                  Abertura
                </dt>
                <dd>
                  {{ dataBR(cliente.dataAbertura) }}
                  <span class="text-muted">
                    ({{ 2026 - cliente.dataAbertura.getFullYear() }} anos de atividade)
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-muted">
                  Capital social
                </dt>
                <dd class="font-mono">
                  {{ brl(cliente.capitalSocial) }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">
                  Garantia
                </dt>
                <dd>
                  <template v-if="cliente.garantia">
                    {{ rotuloGarantia[cliente.garantia.tipo] }}
                    <UBadge
                      :color="cliente.garantia.ativo ? 'success' : 'error'"
                      variant="subtle"
                      size="sm"
                    >
                      {{ cliente.garantia.ativo ? 'ativa' : 'inativa' }}
                    </UBadge>
                  </template>
                  <span v-else class="text-muted">sem garantia registrada</span>
                </dd>
              </div>
              <div>
                <dt class="text-muted">
                  Barter / troca
                </dt>
                <dd>
                  <UBadge
                    :color="cliente.barterAtivo ? 'warning' : 'neutral'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ cliente.barterAtivo ? 'ativo — exposição dupla' : 'não opera em barter' }}
                  </UBadge>
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Explicabilidade (RF-09, RF-22) -->
          <UCard class="lg:col-span-2">
            <template #header>
              <div>
                <h2 class="font-semibold">
                  Como o score foi formado
                </h2>
                <p class="text-sm text-muted">
                  Peso de cada fator na nota final — o score não é caixa-preta.
                </p>
              </div>
            </template>

            <div class="space-y-4">
              <div v-for="fator in fatores" :key="fator.rotulo" class="space-y-1.5">
                <div class="flex items-baseline justify-between text-sm">
                  <span>{{ fator.rotulo }}</span>
                  <span class="font-mono tabular-nums text-muted">{{ fator.peso }}%</span>
                </div>
                <UProgress :model-value="fator.peso" :color="fator.cor" size="md" />
              </div>

              <USeparator />

              <div class="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p class="mb-1 font-medium">
                    Por que este cliente está exposto ao clima
                  </p>
                  <p class="text-muted">
                    {{ climatico.regiao }}, cultura de {{ rotuloCultura[climatico.cultura].toLowerCase() }}:
                    sob {{ rotuloFaseONI[climatico.faseONI].toLowerCase() }}, a produtividade histórica cai
                    {{ climatico.quedaProdutividadeHistorica }}% (CONAB/INMET). Proxy histórico-estatístico,
                    não previsão meteorológica.
                  </p>
                </div>
                <div>
                  <p class="mb-1 font-medium">
                    Por que está exposto ao preço
                  </p>
                  <p class="text-muted">
                    {{ rotuloCultura[commodity.cultura] }} a
                    {{ brl(commodity.precoAtual) }}/{{ unidadeCultura[commodity.cultura] }}
                    (CEPEA/ESALQ), {{ pct(commodity.variacao6Meses) }} em 6 meses. Colheita em
                    {{ janelaColheita }}; fatura vence em {{ dataBR(proximoVencimento) }}.
                  </p>
                </div>
              </div>

              <UAlert
                v-if="vencimentoAntesDaColheita"
                color="warning"
                variant="subtle"
                icon="i-lucide-calendar-clock"
                title="Janela de iliquidez"
                :description="`A fatura vence em ${dataBR(proximoVencimento)}, antes de o cliente fechar a comercialização da safra de ${janelaColheita}.`"
              />
            </div>
          </UCard>
        </div>

        <!-- Imóvel rural: área plantada e regularidade via CAR/SICAR (RF-28).
             É a área declarada aqui que sustenta a identificação da cultura (RF-24). -->
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="font-semibold">
                  Imóvel rural (CAR/SICAR)
                </h2>
                <p class="text-sm text-muted">
                  CAR {{ imovel.codigoCAR }} · consultado em {{ dataBR(imovel.consultadoEm) }}
                </p>
              </div>
              <UBadge :color="corSituacaoCAR[imovel.situacaoCAR]" variant="subtle">
                {{ rotuloSituacaoCAR[imovel.situacaoCAR] }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <p class="text-sm text-muted">
                  Área total
                </p>
                <p class="font-mono text-xl font-semibold tabular-nums">
                  {{ ha(imovel.areaTotalHa) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted">
                  Área em produção
                </p>
                <p class="font-mono text-xl font-semibold tabular-nums">
                  {{ ha(imovel.areaPlantadaHa) }}
                  <span class="text-sm font-normal text-muted">({{ proporcaoPlantada }}%)</span>
                </p>
              </div>
              <div>
                <p class="text-sm text-muted">
                  Reserva legal
                </p>
                <p class="font-mono text-xl font-semibold tabular-nums">
                  {{ ha(imovel.reservaLegalHa) }}
                </p>
              </div>
            </div>

            <UProgress
              :model-value="proporcaoPlantada"
              color="primary"
              size="md"
              :ui="{ base: 'w-full' }"
            />

            <p class="text-sm text-muted">
              {{ ha(imovel.areaPlantadaHa) }} de
              {{ rotuloCultura[cliente.culturaPredominante].toLowerCase() }} é a base de receita que
              paga o insumo — os índices climático e de preço acima incidem sobre essa área.
            </p>

            <UAlert
              v-if="carIrregular"
              color="warning"
              variant="subtle"
              icon="i-lucide-land-plot"
              title="Cadastro Ambiental Rural irregular"
              :description="`CAR ${rotuloSituacaoCAR[imovel.situacaoCAR].toLowerCase()}: a área não serve como garantia confiável e o cliente pode ficar impedido de acessar crédito rural até regularizar.`"
            />
          </div>
        </UCard>

        <!-- Matriz de red flags (RF-03) -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Matriz de red flags
            </h2>
          </template>

          <ul v-if="cliente.redFlags.length" class="divide-y divide-default">
            <li
              v-for="(flag, i) in cliente.redFlags"
              :key="i"
              class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <UIcon :name="iconeRedFlag[flag.tipo]" class="mt-0.5 size-5 shrink-0 text-muted" />
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-medium">{{ rotuloRedFlag[flag.tipo] }}</span>
                  <UBadge :color="corSeveridade[flag.severidade]" variant="subtle" size="sm">
                    {{ flag.severidade }}
                  </UBadge>
                  <UBadge color="neutral" variant="outline" size="sm">
                    {{ categoriaRedFlag[flag.tipo] }}
                  </UBadge>
                </div>
                <p class="mt-1 text-sm text-muted">
                  {{ flag.descricao }}
                </p>
              </div>
              <span class="shrink-0 text-xs text-muted">{{ dataBR(flag.detectadoEm) }}</span>
            </li>
          </ul>

          <UEmpty
            v-else
            icon="i-lucide-shield-check"
            title="Nenhuma red flag ativa"
            description="Nenhum sinal jurídico, fiscal, ambiental, técnico, climático ou de commodity detectado."
          />
        </UCard>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Evolução do score (RF-08) -->
          <UCard>
            <template #header>
              <div>
                <h2 class="font-semibold">
                  Evolução do score
                </h2>
                <p class="text-sm text-muted">
                  Últimos 12 meses
                </p>
              </div>
            </template>
            <LineChart
              label="Score"
              :labels="historico.map(h => dataBR(h.data))"
              :values="historico.map(h => h.score)"
            />
          </UCard>

          <!-- Preço da commodity com janela de safra (RF-30) -->
          <UCard>
            <template #header>
              <div>
                <h2 class="font-semibold">
                  Preço do {{ rotuloCultura[commodity.cultura].toLowerCase() }}
                </h2>
                <p class="text-sm text-muted">
                  CEPEA/ESALQ, R$ por {{ unidadeCultura[commodity.cultura] }} · pontos em destaque =
                  janela de comercialização de {{ janelaColheita }}
                </p>
              </div>
            </template>
            <LineChart
              :label="`Preço (${unidadeCultura[commodity.cultura]})`"
              :labels="mesesPreco"
              :values="precosCommodity[commodity.cultura]"
              :destaque-de="4"
            />
          </UCard>
        </div>

        <!-- Relatório LLM (RF-04) -->
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="size-4 text-primary" />
                <h2 class="font-semibold">
                  Resumo executivo
                </h2>
                <UBadge color="neutral" variant="subtle" size="sm">
                  {{ relatorio ? 'gerado agora' : 'exemplo' }}
                </UBadge>
              </div>
              <div class="flex items-center gap-3 print:hidden">
                <USwitch v-model="usarRelatorioMock" label="usar mock" />
                <UButton
                  icon="i-lucide-refresh-cw"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  :loading="carregandoRelatorio"
                  @click="gerarRelatorio(cliente.cnpj, usarRelatorioMock, fallbackSintetico, contextoAdicionalSintetico)"
                >
                  Gerar relatório
                </UButton>
              </div>
            </div>
          </template>

          <UAlert
            v-if="erroRelatorio"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :title="erroRelatorio"
            class="mb-4"
          />

          <div class="relatorio-md text-sm text-toned" v-html="resumoExecutivoHtml" />
        </UCard>

        <!-- Histórico de cobrança — seção da Recuperação, exportável em PDF por si só.
             Crédito não atua na esteira, então não vê este bloco. -->
        <UCard v-if="perfil !== 'credito'" class="secao-cobranca">
          <template #header>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="font-semibold">
                  Histórico de cobrança
                </h2>
                <p class="text-sm text-muted">
                  {{ cobrancas.length }} interação(ões) registrada(s) ·
                  {{ brl(cliente.valorEmAberto) }} em aberto
                </p>
              </div>
              <UButton
                icon="i-lucide-file-down"
                color="neutral"
                variant="subtle"
                size="sm"
                class="print:hidden"
                @click="imprimir('cobranca')"
              >
                Exportar em PDF
              </UButton>
            </div>
          </template>

          <!-- Cabeçalho que só existe no PDF, para o documento se sustentar sozinho. -->
          <div class="mb-6 hidden border-b border-default pb-4 print:block">
            <h1 class="text-lg font-semibold">
              Histórico de cobrança — {{ cliente.razaoSocial }}
            </h1>
            <p class="text-sm">
              CNPJ {{ mascaraCnpj(cliente.cnpj) }} · {{ cliente.municipio }} / {{ cliente.uf }}
            </p>
            <p class="text-sm">
              Saldo em aberto: {{ brl(cliente.valorEmAberto) }} ·
              Rating atual: {{ cliente.ratingAtual }} ({{ cliente.scoreAtual }}/1000)
            </p>
            <p class="mt-1 text-xs text-muted">
              Emitido em {{ emitidoEm }} · Krill Tech — Esteira de Recuperação
            </p>
          </div>

          <div v-if="cobrancas.length" class="overflow-x-auto">
            <table class="w-full min-w-2xl text-sm">
              <thead>
                <tr class="border-b border-default text-left text-xs text-muted">
                  <th class="py-2 pr-3 font-medium">
                    Data
                  </th>
                  <th class="px-3 py-2 font-medium">
                    Canal
                  </th>
                  <th class="px-3 py-2 font-medium">
                    Responsável
                  </th>
                  <th class="px-3 py-2 font-medium">
                    Resultado
                  </th>
                  <th class="px-3 py-2 text-right font-medium">
                    Valor
                  </th>
                  <th class="py-2 pl-3 font-medium">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr v-for="(c, i) in cobrancas" :key="i">
                  <td class="whitespace-nowrap py-2.5 pr-3 font-mono tabular-nums">
                    {{ dataBR(c.data) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-2.5">
                    <span class="flex items-center gap-1.5">
                      <UIcon :name="iconeCanal[c.canal]" class="size-3.5 text-muted" />
                      {{ rotuloCanal[c.canal] }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5">
                    {{ c.responsavel }}
                  </td>
                  <td class="px-3 py-2.5">
                    <UBadge :color="corResultado[c.resultado]" variant="subtle" size="sm">
                      {{ rotuloResultado[c.resultado] }}
                    </UBadge>
                  </td>
                  <td class="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums">
                    {{ c.valor ? brl(c.valor) : '—' }}
                  </td>
                  <td class="py-2.5 pl-3 text-muted">
                    {{ c.observacao }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="totalNegociado">
                <tr class="border-t border-default">
                  <td colspan="4" class="py-2.5 pr-3 text-xs text-muted">
                    Total movimentado nas interações
                  </td>
                  <td class="whitespace-nowrap px-3 py-2.5 text-right font-mono font-medium tabular-nums">
                    {{ brl(totalNegociado) }}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <UEmpty
            v-else
            variant="naked"
            icon="i-lucide-handshake"
            title="Nenhuma cobrança registrada"
            description="O cliente nunca entrou na esteira de recuperação."
          />
        </UCard>

        <!-- Decisão operacional (RF-05, RF-11) — só o Analista de Crédito decide limite.
             Cobrança chega aqui pela esteira e lê a ficha, mas não aprova. -->
        <UCard v-if="perfil === 'credito'" class="print:hidden">
          <template #header>
            <div>
              <h2 class="font-semibold">
                Decisão de crédito de insumo
              </h2>
              <p class="text-sm text-muted">
                Ajuste manual sobre a recomendação do motor — a decisão fica registrada.
              </p>
            </div>
          </template>

          <div class="flex flex-wrap items-end gap-4">
            <UFormField label="Limite aprovado" class="w-56">
              <UInputNumber
                v-model="limite"
                :step="50000"
                :min="0"
                :format-options="{ style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }"
                class="w-full"
              />
            </UFormField>

            <div class="flex-1 text-sm">
              <p class="text-muted">
                Condições sugeridas
              </p>
              <p>{{ cliente.condicoesPagamentoRecomendadas }}</p>
            </div>

            <UButton icon="i-lucide-check" :loading="salvando" @click="registrarDecisao">
              Registrar decisão
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <UDashboardPanel v-else id="ficha-carregando">
    <template #header>
      <UDashboardNavbar title="Carregando...">
        <template #leading>
          <UButton
            to="/clientes"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Voltar para clientes"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex items-center justify-center py-24 text-muted">
        <UIcon v-if="pending" name="i-lucide-loader-circle" class="size-6 animate-spin" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
/*
 * v-html injeta HTML fora do compilador do Vue, então o CSS "scoped" normal
 * não alcança esses elementos — por isso :deep() em cada seletor. Cores e
 * espaçamento seguem os tokens do Field Ledger (app.vue/main.css), não
 * valores soltos, pra o relatório do LLM combinar com o resto da ficha.
 */
.relatorio-md :deep(h1),
.relatorio-md :deep(h2),
.relatorio-md :deep(h3) {
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.relatorio-md :deep(h1:first-child),
.relatorio-md :deep(h2:first-child),
.relatorio-md :deep(h3:first-child) {
  margin-top: 0;
}

.relatorio-md :deep(h1) {
  font-size: 1.125rem;
}

.relatorio-md :deep(h2) {
  font-size: 1.0625rem;
}

.relatorio-md :deep(h3) {
  font-size: 1rem;
}

.relatorio-md :deep(p) {
  margin-bottom: 0.85em;
  line-height: 1.6;
}

.relatorio-md :deep(strong) {
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.relatorio-md :deep(ul),
.relatorio-md :deep(ol) {
  margin-bottom: 0.85em;
  padding-left: 1.25rem;
}

.relatorio-md :deep(li) {
  margin-bottom: 0.3em;
  line-height: 1.5;
}

.relatorio-md :deep(li > ul),
.relatorio-md :deep(li > ol) {
  margin-top: 0.3em;
  margin-bottom: 0;
}

.relatorio-md :deep(blockquote) {
  margin: 0.85em 0;
  border-left: 3px solid var(--ui-primary);
  padding-left: 0.85rem;
  color: var(--ui-text-muted);
}

.relatorio-md :deep(hr) {
  margin: 1.25em 0;
  border: none;
  border-top: 1px solid var(--ui-border);
}

.relatorio-md :deep(code) {
  border-radius: var(--ui-radius);
  background: var(--ui-bg-muted);
  padding: 0.1em 0.35em;
  font-size: 0.85em;
}

.relatorio-md :deep(table) {
  width: 100%;
  margin-bottom: 0.85em;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.relatorio-md :deep(th),
.relatorio-md :deep(td) {
  border: 1px solid var(--ui-border);
  padding: 0.5rem 0.65rem;
  text-align: left;
  vertical-align: top;
}

.relatorio-md :deep(th) {
  background: var(--ui-bg-muted);
  font-weight: 600;
  color: var(--ui-text-highlighted);
}
</style>
