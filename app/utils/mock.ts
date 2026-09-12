import type {
  Alerta,
  Cliente,
  Cultura,
  HistoricoScore,
  IndiceExposicaoCommodity,
  IndiceRiscoClimatico,
  ImovelRural,
  InteracaoCobranca,
  ScoreBreakdown,
} from '~~/types/firestore'

/**
 * Dados sintéticos do MVP (DEVELOPMENT_PLAN.md §8: SICAR, ZARC, PGFN e TST são
 * representados com dados plausíveis no hackathon). Substituir por Firestore/Cloud Functions.
 * Datas são literais fixos de propósito — `new Date()` aqui quebraria a hidratação SSR.
 */

/** Fase ONI vigente publicada pelo NOAA CPC — a mesma para toda a carteira (RF-19). */
export const faseONIVigente = 'nino_forte' as const

export interface ClienteDossie {
  cliente: Cliente
  climatico: IndiceRiscoClimatico
  commodity: IndiceExposicaoCommodity
  breakdown: ScoreBreakdown
  historico: HistoricoScore[]
  /** Janela de colheita da cultura no município, via ZARC (RF-29). */
  janelaColheita: string
  /** Fim da janela de colheita. Ausente quando a produção é contínua (pecuária). */
  fimColheita?: Date
  /** Vencimento da fatura de insumo mais próxima (RF-29). */
  proximoVencimento: Date
  /** Tentativas de cobrança já registradas. Vazio = cliente nunca entrou em recuperação. */
  cobrancas: InteracaoCobranca[]
  /** Imóvel rural declarado no CAR/SICAR (RF-28). */
  imovel: ImovelRural
}

const historico = (scores: number[]): HistoricoScore[] =>
  scores.map((score, i) => ({
    score,
    rating: ratingDoScore(score),
    data: new Date(2025, 3 + i * 2, 1),
  }))

export const carteira: ClienteDossie[] = [
  {
    cliente: {
      cnpj: '12345678000190',
      razaoSocial: 'Fazenda Santa Helena Agropecuária Ltda',
      nomeFantasia: 'Santa Helena',
      cnae: '0115-6/00 — Cultivo de soja',
      municipio: 'Sorriso',
      uf: 'MT',
      dataAbertura: new Date(2009, 2, 14),
      capitalSocial: 4_500_000,
      culturaPredominante: 'soja',
      garantia: { tipo: 'alienacao_fiduciaria', ativo: true },
      barterAtivo: false,
      scoreAtual: 842,
      ratingAtual: 'A',
      limiteCreditoRecomendado: 3_200_000,
      condicoesPagamentoRecomendadas: 'Pagamento em 180 dias, liberação integral do limite',
      valorEmAberto: 2_850_000,
      redFlags: [
        {
          tipo: 'climatico',
          descricao: 'Região produtora de soja no MT sob El Niño forte: queda média histórica de 11% na produtividade.',
          severidade: 'media',
          detectadoEm: new Date(2026, 0, 18),
        },
      ],
      relatorioLLM:
        'Cliente de baixo risco. Operação consolidada há 17 anos em Sorriso (MT), com alienação fiduciária ativa que mitiga o impacto de uma eventual recuperação judicial. A única exposição relevante é climática: a fase El Niño forte reduz historicamente em ~11% a produtividade da soja na região. Sem barter, o pagamento não depende do valor da saca entregue. Recomendação: manter limite integral com prazo casado à colheita.',
      criadoEm: new Date(2025, 5, 2),
      atualizadoEm: new Date(2026, 0, 18),
    },
    climatico: {
      clienteId: '12345678000190',
      regiao: 'Centro-Oeste / MT',
      cultura: 'soja',
      faseONI: faseONIVigente,
      quedaProdutividadeHistorica: 11.2,
      indiceRisco: 42,
      calculadoEm: new Date(2026, 0, 18),
    },
    commodity: {
      clienteId: '12345678000190',
      cultura: 'soja',
      precoAtual: 128.4,
      variacao6Meses: -8.3,
      tendencia: 'queda',
      indiceExposicao: 38,
      calculadoEm: new Date(2026, 0, 18),
    },
    breakdown: {
      clienteId: '12345678000190',
      pesoJuridicoFiscal: 50,
      pesoClimatico: 30,
      pesoCommodity: 20,
      scoreFinal: 842,
      ratingFinal: 'A',
      calculadoEm: new Date(2026, 0, 18),
    },
    historico: historico([861, 858, 849, 842]),
    janelaColheita: 'fev–mar/2026',
    fimColheita: new Date(2026, 2, 31),
    proximoVencimento: new Date(2026, 3, 15),
    cobrancas: [],
    imovel: {
      clienteId: '12345678000190',
      codigoCAR: 'MT-5107925-A1F3',
      areaTotalHa: 4_820,
      areaPlantadaHa: 4_150,
      reservaLegalHa: 1_446,
      situacaoCAR: 'ativo',
      consultadoEm: new Date(2026, 0, 18),
    },
  },
  {
    cliente: {
      cnpj: '98765432000155',
      razaoSocial: 'Agroindústria Vale do Paranaíba S.A.',
      nomeFantasia: 'Vale do Paranaíba',
      cnae: '1041-4/00 — Fabricação de óleos vegetais',
      municipio: 'Rio Verde',
      uf: 'GO',
      dataAbertura: new Date(2014, 7, 3),
      capitalSocial: 12_000_000,
      culturaPredominante: 'milho',
      garantia: { tipo: 'cpr_financeira', ativo: true },
      barterAtivo: false,
      scoreAtual: 701,
      ratingAtual: 'B',
      limiteCreditoRecomendado: 1_800_000,
      condicoesPagamentoRecomendadas: 'Pagamento em 120 dias, 80% do limite solicitado',
      valorEmAberto: 1_640_000,
      redFlags: [
        {
          tipo: 'inadimplencia_tecnica',
          descricao: 'Renegociação de prazo na safra 2024/25: atraso de 34 dias sem protesto registrado.',
          severidade: 'media',
          detectadoEm: new Date(2025, 9, 7),
        },
        {
          tipo: 'commodity',
          descricao: 'Preço do milho em queda de 12,4% nos últimos 6 meses, com colheita prevista para jul/2026.',
          severidade: 'alta',
          detectadoEm: new Date(2026, 0, 12),
        },
      ],
      relatorioLLM:
        'Risco moderado. A agroindústria tem porte e CPR financeira ativa, mas acumula dois sinais: renegociação de prazo na safra anterior (inadimplência técnica, sem protesto) e queda de 12,4% no preço do milho. A janela de colheita (jul/2026) coincide com o momento de preço desfavorável projetado. Recomendação: liberar 80% do limite e encurtar o prazo para 120 dias, antecipando o vencimento para antes da pressão de safra.',
      criadoEm: new Date(2025, 5, 2),
      atualizadoEm: new Date(2026, 0, 12),
    },
    climatico: {
      clienteId: '98765432000155',
      regiao: 'Centro-Oeste / GO',
      cultura: 'milho',
      faseONI: faseONIVigente,
      quedaProdutividadeHistorica: 7.8,
      indiceRisco: 34,
      calculadoEm: new Date(2026, 0, 12),
    },
    commodity: {
      clienteId: '98765432000155',
      cultura: 'milho',
      precoAtual: 61.9,
      variacao6Meses: -12.4,
      tendencia: 'queda',
      indiceExposicao: 61,
      calculadoEm: new Date(2026, 0, 12),
    },
    breakdown: {
      clienteId: '98765432000155',
      pesoJuridicoFiscal: 45,
      pesoClimatico: 22,
      pesoCommodity: 33,
      scoreFinal: 701,
      ratingFinal: 'B',
      calculadoEm: new Date(2026, 0, 12),
    },
    historico: historico([766, 742, 719, 701]),
    janelaColheita: 'jun–jul/2026',
    fimColheita: new Date(2026, 6, 31),
    proximoVencimento: new Date(2026, 5, 30),
    cobrancas: [
      {
        clienteId: '98765432000155',
        data: new Date(2025, 9, 14),
        canal: 'telefone',
        responsavel: 'Marina Alves',
        resultado: 'promessa_pagamento',
        valor: 340_000,
        observacao: 'Cliente alegou atraso no recebimento da cooperativa. Prometeu quitar em 30 dias.',
      },
      {
        clienteId: '98765432000155',
        data: new Date(2025, 10, 18),
        canal: 'email',
        responsavel: 'Marina Alves',
        resultado: 'renegociado',
        valor: 340_000,
        observacao: 'Promessa não cumprida. Parcelado em 3x com vencimento casado à colheita do milho.',
      },
      {
        clienteId: '98765432000155',
        data: new Date(2026, 0, 9),
        canal: 'whatsapp',
        responsavel: 'Marina Alves',
        resultado: 'pagamento_parcial',
        valor: 113_000,
        observacao: 'Primeira parcela paga no prazo. Duas parcelas em aberto.',
      },
    ],
    imovel: {
      clienteId: '98765432000155',
      codigoCAR: 'GO-5218805-C7B2',
      areaTotalHa: 2_310,
      areaPlantadaHa: 1_980,
      reservaLegalHa: 462,
      situacaoCAR: 'ativo',
      consultadoEm: new Date(2026, 0, 12),
    },
  },
  {
    cliente: {
      cnpj: '45678901000122',
      razaoSocial: 'Cerrado Grãos Comércio de Insumos Ltda',
      cnae: '0116-4/01 — Cultivo de algodão herbáceo',
      municipio: 'Luís Eduardo Magalhães',
      uf: 'BA',
      dataAbertura: new Date(2018, 10, 22),
      capitalSocial: 2_100_000,
      culturaPredominante: 'algodao',
      garantia: { tipo: 'penhor_safra', ativo: true },
      barterAtivo: true,
      scoreAtual: 612,
      ratingAtual: 'C',
      limiteCreditoRecomendado: 640_000,
      condicoesPagamentoRecomendadas: 'Pagamento em 90 dias, exigir garantia adicional ao penhor de safra',
      valorEmAberto: 590_000,
      redFlags: [
        {
          tipo: 'climatico',
          descricao: 'Oeste da Bahia sob El Niño forte: queda média histórica de 18,6% na produtividade do algodão.',
          severidade: 'alta',
          detectadoEm: new Date(2026, 0, 20),
        },
        {
          tipo: 'embargo_ambiental',
          descricao: 'Embargo do IBAMA sobre 120 ha da propriedade, registrado em nov/2025.',
          severidade: 'alta',
          detectadoEm: new Date(2025, 10, 28),
        },
      ],
      relatorioLLM:
        'Risco elevado por exposição dupla. O cliente opera com barter: precisa que a safra exista (clima) e que o algodão entregue valha o suficiente (preço). A fase El Niño forte reduz historicamente em 18,6% a produtividade no Oeste da Bahia, e o penhor de safra como garantia herda exatamente esse risco. Há ainda embargo ambiental ativo sobre 120 ha. Recomendação: reduzir limite, encurtar prazo para 90 dias e exigir garantia que não dependa da própria safra.',
      criadoEm: new Date(2025, 5, 2),
      atualizadoEm: new Date(2026, 0, 20),
    },
    climatico: {
      clienteId: '45678901000122',
      regiao: 'Nordeste / Oeste da BA',
      cultura: 'algodao',
      faseONI: faseONIVigente,
      quedaProdutividadeHistorica: 18.6,
      indiceRisco: 74,
      calculadoEm: new Date(2026, 0, 20),
    },
    commodity: {
      clienteId: '45678901000122',
      cultura: 'algodao',
      precoAtual: 372.5,
      variacao6Meses: -4.1,
      tendencia: 'estavel',
      indiceExposicao: 47,
      calculadoEm: new Date(2026, 0, 20),
    },
    breakdown: {
      clienteId: '45678901000122',
      pesoJuridicoFiscal: 38,
      pesoClimatico: 40,
      pesoCommodity: 22,
      scoreFinal: 612,
      ratingFinal: 'C',
      calculadoEm: new Date(2026, 0, 20),
    },
    historico: historico([688, 671, 634, 612]),
    janelaColheita: 'jul–ago/2026',
    fimColheita: new Date(2026, 7, 31),
    proximoVencimento: new Date(2026, 4, 20),
    cobrancas: [
      {
        clienteId: '45678901000122',
        data: new Date(2025, 11, 5),
        canal: 'visita',
        responsavel: 'Rogério Tanaka',
        resultado: 'sem_contato',
        observacao: 'Visita à sede em Luís Eduardo Magalhães. Responsável financeiro ausente.',
      },
      {
        clienteId: '45678901000122',
        data: new Date(2026, 0, 22),
        canal: 'telefone',
        responsavel: 'Rogério Tanaka',
        resultado: 'promessa_pagamento',
        valor: 180_000,
        observacao: 'Aguarda liberação de crédito bancário. Pediu prazo até o fim da colheita do algodão.',
      },
    ],
    imovel: {
      clienteId: '45678901000122',
      codigoCAR: 'BA-2919553-D4E8',
      areaTotalHa: 6_540,
      areaPlantadaHa: 5_120,
      reservaLegalHa: 1_308,
      situacaoCAR: 'suspenso',
      consultadoEm: new Date(2026, 0, 20),
    },
  },
  {
    cliente: {
      cnpj: '23456789000177',
      razaoSocial: 'Sítio Boa Esperança Produção Agrícola Ltda',
      nomeFantasia: 'Boa Esperança',
      cnae: '0134-2/00 — Cultivo de café',
      municipio: 'Patrocínio',
      uf: 'MG',
      dataAbertura: new Date(2021, 1, 9),
      capitalSocial: 380_000,
      culturaPredominante: 'cafe',
      barterAtivo: true,
      scoreAtual: 488,
      ratingAtual: 'D',
      limiteCreditoRecomendado: 120_000,
      condicoesPagamentoRecomendadas: 'Venda à vista ou 30 dias com garantia real',
      valorEmAberto: 112_000,
      redFlags: [
        {
          tipo: 'protesto',
          descricao: 'Dois protestos ativos em cartório de Patrocínio (MG), total de R$ 94 mil.',
          severidade: 'alta',
          detectadoEm: new Date(2025, 11, 3),
        },
        {
          tipo: 'inadimplencia_tecnica',
          descricao: 'Endividamento crescente: três renegociações em 12 meses.',
          severidade: 'critica',
          detectadoEm: new Date(2026, 0, 8),
        },
      ],
      relatorioLLM:
        'Risco crítico. Operação jovem (2021), capital social baixo e sem garantia registrada, com dois protestos ativos e três renegociações em 12 meses — padrão clássico de inadimplência técnica evoluindo para financeira. Opera em barter, o que amplia a exposição ao preço do café. Recomendação: suspender venda a prazo; operar à vista ou exigir garantia real antes de qualquer liberação.',
      criadoEm: new Date(2025, 5, 2),
      atualizadoEm: new Date(2026, 0, 8),
    },
    climatico: {
      clienteId: '23456789000177',
      regiao: 'Sudeste / Cerrado Mineiro',
      cultura: 'cafe',
      faseONI: faseONIVigente,
      quedaProdutividadeHistorica: 9.4,
      indiceRisco: 51,
      calculadoEm: new Date(2026, 0, 8),
    },
    commodity: {
      clienteId: '23456789000177',
      cultura: 'cafe',
      precoAtual: 2148,
      variacao6Meses: 14.7,
      tendencia: 'alta',
      indiceExposicao: 22,
      calculadoEm: new Date(2026, 0, 8),
    },
    breakdown: {
      clienteId: '23456789000177',
      pesoJuridicoFiscal: 62,
      pesoClimatico: 24,
      pesoCommodity: 14,
      scoreFinal: 488,
      ratingFinal: 'D',
      calculadoEm: new Date(2026, 0, 8),
    },
    historico: historico([592, 556, 511, 488]),
    janelaColheita: 'mai–jul/2026',
    fimColheita: new Date(2026, 6, 31),
    proximoVencimento: new Date(2026, 2, 10),
    cobrancas: [
      {
        clienteId: '23456789000177',
        data: new Date(2025, 8, 30),
        canal: 'telefone',
        responsavel: 'Camila Prado',
        resultado: 'renegociado',
        valor: 112_000,
        observacao: 'Primeira renegociação: parcelado em 4x.',
      },
      {
        clienteId: '23456789000177',
        data: new Date(2025, 10, 12),
        canal: 'telefone',
        responsavel: 'Camila Prado',
        resultado: 'renegociado',
        valor: 96_000,
        observacao: 'Segunda renegociação após duas parcelas em atraso.',
      },
      {
        clienteId: '23456789000177',
        data: new Date(2026, 0, 8),
        canal: 'carta',
        responsavel: 'Camila Prado',
        resultado: 'renegociado',
        valor: 84_000,
        observacao: 'Terceira renegociação em 12 meses. Padrão de inadimplência técnica confirmado.',
      },
      {
        clienteId: '23456789000177',
        data: new Date(2026, 0, 27),
        canal: 'whatsapp',
        responsavel: 'Camila Prado',
        resultado: 'sem_contato',
        observacao: 'Mensagens entregues, sem resposta há 9 dias.',
      },
    ],
    imovel: {
      clienteId: '23456789000177',
      codigoCAR: 'MG-3148103-B9C1',
      areaTotalHa: 380,
      areaPlantadaHa: 295,
      reservaLegalHa: 76,
      situacaoCAR: 'pendente',
      consultadoEm: new Date(2026, 0, 8),
    },
  },
  {
    cliente: {
      cnpj: '34567890000133',
      razaoSocial: 'Companhia Pecuária Rio Negro S.A.',
      nomeFantasia: 'Pecuária Rio Negro',
      cnae: '0151-2/01 — Criação de bovinos para corte',
      municipio: 'Campo Grande',
      uf: 'MS',
      dataAbertura: new Date(2006, 4, 30),
      capitalSocial: 8_700_000,
      culturaPredominante: 'boi',
      garantia: { tipo: 'alienacao_fiduciaria', ativo: true },
      barterAtivo: false,
      scoreAtual: 733,
      ratingAtual: 'B',
      limiteCreditoRecomendado: 2_400_000,
      condicoesPagamentoRecomendadas: 'Pagamento em 150 dias, liberação integral do limite',
      valorEmAberto: 2_180_000,
      redFlags: [],
      relatorioLLM:
        'Risco baixo a moderado. Pecuária consolidada (2006), alienação fiduciária ativa e nenhuma red flag jurídica, fiscal ou ambiental. A arroba do boi está em alta (+6,2% em 6 meses), o que reduz a exposição de receita. Exposição climática indireta via custo de pastagem e suplementação, não via safra própria. Recomendação: manter limite integral em 150 dias.',
      criadoEm: new Date(2025, 5, 2),
      atualizadoEm: new Date(2026, 0, 15),
    },
    climatico: {
      clienteId: '34567890000133',
      regiao: 'Centro-Oeste / MS',
      cultura: 'boi',
      faseONI: faseONIVigente,
      quedaProdutividadeHistorica: 3.1,
      indiceRisco: 19,
      calculadoEm: new Date(2026, 0, 15),
    },
    commodity: {
      clienteId: '34567890000133',
      cultura: 'boi',
      precoAtual: 324.8,
      variacao6Meses: 6.2,
      tendencia: 'alta',
      indiceExposicao: 17,
      calculadoEm: new Date(2026, 0, 15),
    },
    breakdown: {
      clienteId: '34567890000133',
      pesoJuridicoFiscal: 58,
      pesoClimatico: 18,
      pesoCommodity: 24,
      scoreFinal: 733,
      ratingFinal: 'B',
      calculadoEm: new Date(2026, 0, 15),
    },
    historico: historico([708, 715, 726, 733]),
    janelaColheita: 'abate contínuo',
    proximoVencimento: new Date(2026, 6, 5),
    cobrancas: [],
    imovel: {
      clienteId: '34567890000133',
      codigoCAR: 'MS-5002704-F2A6',
      areaTotalHa: 9_170,
      areaPlantadaHa: 8_400,
      reservaLegalHa: 1_834,
      situacaoCAR: 'ativo',
      consultadoEm: new Date(2026, 0, 15),
    },
  },
  {
    cliente: {
      cnpj: '56789012000144',
      razaoSocial: 'Agro Oeste Sementes e Cereais Ltda',
      cnae: '0115-6/00 — Cultivo de soja',
      municipio: 'Cascavel',
      uf: 'PR',
      dataAbertura: new Date(2016, 8, 12),
      capitalSocial: 1_250_000,
      culturaPredominante: 'soja',
      garantia: { tipo: 'penhor_safra', ativo: false },
      barterAtivo: true,
      scoreAtual: 318,
      ratingAtual: 'F',
      limiteCreditoRecomendado: 0,
      condicoesPagamentoRecomendadas: 'Venda a prazo bloqueada — crédito sujeito ao plano de recuperação',
      valorEmAberto: 1_290_000,
      redFlags: [
        {
          tipo: 'rj',
          descricao: 'Pedido de recuperação judicial deferido em 08/01/2026 (DataJud). Stay Period até 07/07/2026.',
          severidade: 'critica',
          detectadoEm: new Date(2026, 0, 8),
        },
        {
          tipo: 'protesto',
          descricao: 'Cinco protestos ativos, total de R$ 1,4 milhão.',
          severidade: 'critica',
          detectadoEm: new Date(2025, 11, 19),
        },
        {
          tipo: 'commodity',
          descricao: 'Preço da soja em queda de 8,3% com barter ativo: produto entregue não cobre o valor devido.',
          severidade: 'alta',
          detectadoEm: new Date(2026, 0, 6),
        },
      ],
      relatorioLLM:
        'Risco crítico — rating rebaixado automaticamente por recuperação judicial deferida em 08/01/2026. Execução e protesto estão suspensos pelo Stay Period até 07/07/2026: nenhuma medida de cobrança é juridicamente possível nesse período. O penhor de safra registrado está inativo, e o crédito da Krill Tech tende a entrar no plano com deságio. Recomendação: bloquear venda a prazo, habilitar o crédito no processo e acompanhar o plano de recuperação.',
      criadoEm: new Date(2025, 5, 2),
      atualizadoEm: new Date(2026, 0, 8),
    },
    climatico: {
      clienteId: '56789012000144',
      regiao: 'Sul / Oeste do PR',
      cultura: 'soja',
      faseONI: faseONIVigente,
      quedaProdutividadeHistorica: 5.6,
      indiceRisco: 28,
      calculadoEm: new Date(2026, 0, 8),
    },
    commodity: {
      clienteId: '56789012000144',
      cultura: 'soja',
      precoAtual: 128.4,
      variacao6Meses: -8.3,
      tendencia: 'queda',
      indiceExposicao: 58,
      calculadoEm: new Date(2026, 0, 8),
    },
    breakdown: {
      clienteId: '56789012000144',
      pesoJuridicoFiscal: 78,
      pesoClimatico: 8,
      pesoCommodity: 14,
      scoreFinal: 318,
      ratingFinal: 'F',
      calculadoEm: new Date(2026, 0, 8),
    },
    historico: historico([604, 571, 442, 318]),
    janelaColheita: 'fev–mar/2026',
    fimColheita: new Date(2026, 2, 31),
    proximoVencimento: new Date(2026, 1, 28),
    cobrancas: [
      {
        clienteId: '56789012000144',
        data: new Date(2025, 11, 22),
        canal: 'carta',
        responsavel: 'Rogério Tanaka',
        resultado: 'recusa',
        observacao: 'Notificação extrajudicial recebida. Cliente contestou o valor e não apresentou proposta.',
      },
      {
        clienteId: '56789012000144',
        data: new Date(2026, 0, 8),
        canal: 'juridico',
        responsavel: 'Jurídico / Dra. Helena Fontes',
        resultado: 'sem_contato',
        observacao: 'RJ deferida no mesmo dia. Cobrança suspensa pelo Stay Period até 07/07/2026.',
      },
      {
        clienteId: '56789012000144',
        data: new Date(2026, 0, 15),
        canal: 'juridico',
        responsavel: 'Jurídico / Dra. Helena Fontes',
        resultado: 'sem_contato',
        observacao: 'Crédito habilitado no processo. Aguardando publicação do plano de recuperação.',
      },
    ],
    imovel: {
      clienteId: '56789012000144',
      codigoCAR: 'PR-4104808-E5D9',
      areaTotalHa: 1_640,
      areaPlantadaHa: 1_390,
      reservaLegalHa: 328,
      situacaoCAR: 'cancelado',
      consultadoEm: new Date(2026, 0, 8),
    },
  },
]

export interface NovoClienteForm {
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  cnae: string
  municipio: string
  uf: string
  dataAbertura: Date
  capitalSocial: number
  culturaPredominante: Cultura
  barterAtivo: boolean
  garantia?: Cliente['garantia']
  valorEmAberto: number
  codigoCAR: string
  areaTotalHa: number
  areaPlantadaHa: number
  situacaoCAR: SituacaoCAR
}

/** Perde-se ao recarregar a página: pontos que um cliente novo não tem por não ter trilha de pagamento conosco. */
const PENALIDADE_SEM_HISTORICO = 120

/**
 * Monta o dossiê completo de um cliente recém-cadastrado e o coloca na carteira.
 *
 * ponytail: o score sai de uma fórmula explícita aqui porque o motor real (RF-19 a RF-27)
 * ainda não existe — os índices climático e de commodity são herdados de um cliente da mesma
 * cultura, que é o proxy regional mais próximo que a carteira sintética oferece. Trocar pelo
 * pipeline de verdade assim que ele responder. O cadastro também só vive em memória: sem
 * Firestore, um reload perde o cliente.
 */
export function cadastrarCliente(form: NovoClienteForm): ClienteDossie {
  const hoje = new Date()
  const referencia = carteira.find(d => d.cliente.culturaPredominante === form.culturaPredominante)

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

  const dossie: ClienteDossie = {
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

  carteira.push(dossie)
  return dossie
}

/** Recalcula a cada chamada: a carteira cresce quando um cliente é cadastrado em memória. */
export const listarClientes = () => carteira.map(d => d.cliente)

export const buscarDossie = (cnpj: string) => carteira.find(d => d.cliente.cnpj === cnpj)

/**
 * RF-07: por que este cliente entrou no ranking de cobrança — o evento mais recente
 * do feed de alertas, caindo para a red flag mais nova quando não há alerta.
 */
export function motivoRanking(cnpj: string): string {
  const alerta = alertas
    .filter(a => a.clienteId === cnpj)
    .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())[0]
  if (alerta) return alerta.descricao

  const flag = [...(buscarDossie(cnpj)?.cliente.redFlags ?? [])]
    .sort((a, b) => b.detectadoEm.getTime() - a.detectadoEm.getTime())[0]
  return flag?.descricao ?? 'Sem evento novo — entra no ranking pelo tamanho da exposição em aberto.'
}

/** Série de preço CEPEA/ESALQ sintética, para o gráfico com a janela de safra destacada (RF-30). */
export const mesesPreco = ['ago/25', 'set/25', 'out/25', 'nov/25', 'dez/25', 'jan/26']

export const precosCommodity: Record<Cultura, number[]> = {
  soja: [140.0, 137.2, 134.8, 131.5, 129.9, 128.4],
  milho: [70.7, 68.9, 66.4, 64.1, 62.8, 61.9],
  algodao: [388.4, 385.0, 379.2, 376.8, 374.1, 372.5],
  cafe: [1872, 1934, 1998, 2061, 2110, 2148],
  boi: [305.8, 309.4, 313.1, 317.9, 321.2, 324.8],
}

export const alertas: Alerta[] = [
  {
    clienteId: '56789012000144',
    clienteNome: 'Agro Oeste Sementes e Cereais Ltda',
    tipo: 'rj',
    descricao: 'Recuperação judicial deferida (DataJud). Rating rebaixado para F e Stay Period iniciado.',
    severidade: 'critica',
    lido: false,
    criadoEm: new Date(2026, 0, 8, 9, 12),
  },
  {
    clienteId: '45678901000122',
    clienteNome: 'Cerrado Grãos Comércio de Insumos Ltda',
    tipo: 'climatico',
    descricao: 'Fase ONI mudou de El Niño moderado para forte: índice climático do Oeste da BA subiu de 58 para 74.',
    severidade: 'alta',
    lido: false,
    criadoEm: new Date(2026, 0, 20, 7, 45),
  },
  {
    clienteId: '98765432000155',
    clienteNome: 'Agroindústria Vale do Paranaíba S.A.',
    tipo: 'commodity',
    descricao: 'Milho acumula queda de 12,4% em 6 meses, com colheita em jul/2026 e fatura vencendo em jun/2026.',
    severidade: 'alta',
    lido: false,
    criadoEm: new Date(2026, 0, 12, 14, 30),
  },
  {
    clienteId: '23456789000177',
    clienteNome: 'Sítio Boa Esperança Produção Agrícola Ltda',
    tipo: 'inadimplencia_tecnica',
    descricao: 'Terceira renegociação de prazo em 12 meses detectada.',
    severidade: 'critica',
    lido: false,
    criadoEm: new Date(2026, 0, 8, 11, 3),
  },
  {
    clienteId: '12345678000190',
    clienteNome: 'Fazenda Santa Helena Agropecuária Ltda',
    tipo: 'climatico',
    descricao: 'El Niño forte confirmado para o trimestre: queda histórica de 11,2% na soja do MT.',
    severidade: 'media',
    lido: true,
    criadoEm: new Date(2026, 0, 18, 8, 20),
  },
  {
    clienteId: '45678901000122',
    clienteNome: 'Cerrado Grãos Comércio de Insumos Ltda',
    tipo: 'embargo_ambiental',
    descricao: 'Embargo do IBAMA sobre 120 ha registrado na propriedade.',
    severidade: 'alta',
    lido: true,
    criadoEm: new Date(2025, 10, 28, 16, 55),
  },
]
