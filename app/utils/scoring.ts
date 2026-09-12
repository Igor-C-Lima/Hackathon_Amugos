import type {
  Alerta,
  Cliente,
  ClienteDossie,
  IndiceExposicaoCommodity,
  IndiceRiscoClimatico,
  NovoClienteForm,
  RedFlag,
} from '~~/types/firestore'

/**
 * Lógica de negócio pura sobre o dossiê do cliente — não depende de mock nem de Firestore,
 * só de dados já carregados. `app/composables/useCarteira.ts` chama isto contra dados reais
 * do banco; `scripts/seed-firestore.mjs` poderia (mas hoje não precisa) chamar o mesmo contra
 * a semente.
 */

/** Fase ONI vigente publicada pelo NOAA CPC — a mesma para toda a carteira (RF-19). */
export const faseONIVigente = 'nino_forte' as const

/** Perde-se ao recarregar a página: pontos que um cliente novo não tem por não ter trilha de pagamento conosco. */
const PENALIDADE_SEM_HISTORICO = 120

/**
 * Monta o dossiê completo de um cliente recém-cadastrado, pronto pra ser escrito no Firestore.
 *
 * ponytail: o score sai de uma fórmula explícita aqui porque o motor real (RF-19 a RF-27)
 * ainda não existe — os índices climático e de commodity são herdados de `referencia`, um
 * cliente já existente da mesma cultura (proxy regional mais próximo que a carteira oferece).
 * Trocar pelo pipeline de verdade assim que ele responder.
 */
export function montarNovoDossie(form: NovoClienteForm, referencia: ClienteDossie | undefined): ClienteDossie {
  const hoje = new Date()

  const climatico: IndiceRiscoClimatico = referencia
    ? { ...referencia.climatico, clienteId: form.cnpj, calculadoEm: hoje }
    : {
        clienteId: form.cnpj,
        regiao: `${form.municipio} / ${form.uf}`,
        cultura: form.culturaPredominante,
        faseONI: faseONIVigente,
        quedaProdutividadeHistorica: 8,
        indiceRisco: 40,
        calculadoEm: hoje,
      }

  const commodity: IndiceExposicaoCommodity = referencia
    ? { ...referencia.commodity, clienteId: form.cnpj, calculadoEm: hoje }
    : {
        clienteId: form.cnpj,
        cultura: form.culturaPredominante,
        precoAtual: 0,
        variacao6Meses: 0,
        tendencia: 'estavel',
        indiceExposicao: 40,
        calculadoEm: hoje,
      }

  const pesoJuridicoFiscal = 45
  const pesoClimatico = 30
  const pesoCommodity = 25

  const score = Math.max(
    0,
    Math.round(
      1000
      - PENALIDADE_SEM_HISTORICO
      - climatico.indiceRisco * (pesoClimatico / 100) * 4
      - commodity.indiceExposicao * (pesoCommodity / 100) * 4
      - (form.situacaoCAR === 'ativo' ? 0 : 80),
    ),
  )
  const rating = ratingDoScore(score)

  const cliente: Cliente = {
    cnpj: form.cnpj,
    razaoSocial: form.razaoSocial,
    nomeFantasia: form.nomeFantasia,
    cnae: form.cnae,
    municipio: form.municipio,
    uf: form.uf,
    dataAbertura: form.dataAbertura,
    capitalSocial: form.capitalSocial,
    culturaPredominante: form.culturaPredominante,
    garantia: form.garantia,
    barterAtivo: form.barterAtivo,
    scoreAtual: score,
    ratingAtual: rating,
    limiteCreditoRecomendado: Math.round((score / 1000) * form.capitalSocial),
    condicoesPagamentoRecomendadas:
      rating === 'A' || rating === 'B'
        ? 'Pagamento em 120 dias, revisar após a primeira safra com histórico'
        : 'Pagamento em 60 dias até formar histórico de pagamento',
    valorEmAberto: form.valorEmAberto,
    redFlags:
      form.situacaoCAR === 'ativo'
        ? []
        : [{
            tipo: 'embargo_ambiental' as const,
            descricao: `CAR ${form.codigoCAR} com situação "${form.situacaoCAR}" no SICAR.`,
            severidade: 'alta' as const,
            detectadoEm: hoje,
          }],
    relatorioLLM:
      'Cliente recém-cadastrado, ainda sem histórico de pagamento com a Krill Tech. '
      + `O score parte da exposição de safra da cultura declarada (${form.culturaPredominante}) e será `
      + 'recalculado após a primeira safra. Gere o relatório completo pelo agente de LLM.',
    criadoEm: hoje,
    atualizadoEm: hoje,
  }

  return {
    cliente,
    climatico,
    commodity,
    breakdown: {
      clienteId: form.cnpj,
      pesoJuridicoFiscal,
      pesoClimatico,
      pesoCommodity,
      scoreFinal: score,
      ratingFinal: rating,
      calculadoEm: hoje,
    },
    historico: [{ score, rating, data: hoje }],
    janelaColheita: referencia?.janelaColheita ?? 'a definir',
    fimColheita: referencia?.fimColheita,
    proximoVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 4, hoje.getDate()),
    cobrancas: [],
    imovel: {
      clienteId: form.cnpj,
      codigoCAR: form.codigoCAR,
      areaTotalHa: form.areaTotalHa,
      areaPlantadaHa: form.areaPlantadaHa,
      reservaLegalHa: Math.round(form.areaTotalHa * 0.2),
      situacaoCAR: form.situacaoCAR,
      consultadoEm: hoje,
    },
  }
}

/**
 * RF-07: por que este cliente entrou no ranking de cobrança — o evento mais recente
 * do feed de alertas, caindo para a red flag mais nova quando não há alerta.
 */
export function motivoRanking(cnpj: string, alertas: Alerta[], redFlags: RedFlag[]): string {
  const alerta = alertas
    .filter(a => a.clienteId === cnpj)
    .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())[0]
  if (alerta) return alerta.descricao

  const flag = [...redFlags].sort((a, b) => b.detectadoEm.getTime() - a.detectadoEm.getTime())[0]
  return flag?.descricao ?? 'Sem evento novo — entra no ranking pelo tamanho da exposição em aberto.'
}
