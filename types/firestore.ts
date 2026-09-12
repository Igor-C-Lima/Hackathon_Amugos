export type Rating = 'A' | 'B' | 'C' | 'D' | 'F'

export type Cultura = 'soja' | 'milho' | 'algodao' | 'boi' | 'cafe'

export type FaseONI =
  | 'nino_forte'
  | 'nino_moderado'
  | 'nino_fraco'
  | 'neutro'
  | 'nina_fraco'
  | 'nina_moderado'
  | 'nina_forte'

export type TipoGarantia = 'alienacao_fiduciaria' | 'penhor_safra' | 'cpr_fisica' | 'cpr_financeira'

export type TipoRedFlag =
  | 'rj'
  | 'protesto'
  | 'embargo_ambiental'
  | 'inadimplencia_tecnica'
  | 'climatico'
  | 'commodity'

export type Severidade = 'baixa' | 'media' | 'alta' | 'critica'

export interface Cliente {
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  cnae: string
  municipio: string
  uf: string
  dataAbertura: Date
  capitalSocial: number
  culturaPredominante: Cultura
  garantia?: {
    tipo: TipoGarantia
    ativo: boolean
  }
  barterAtivo: boolean
  scoreAtual: number
  ratingAtual: Rating
  limiteCreditoRecomendado?: number
  condicoesPagamentoRecomendadas?: string
  /** Saldo devedor de insumo já faturado, em BRL. Entra no ranking Risco × Valor em Aberto (RF-07). */
  valorEmAberto: number
  redFlags: RedFlag[]
  relatorioLLM?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface RedFlag {
  tipo: TipoRedFlag
  descricao: string
  severidade: Severidade
  detectadoEm: Date
}

export type CanalCobranca = 'telefone' | 'email' | 'whatsapp' | 'visita' | 'carta' | 'juridico'

export type ResultadoCobranca =
  | 'sem_contato'
  | 'promessa_pagamento'
  | 'renegociado'
  | 'pagamento_parcial'
  | 'quitado'
  | 'recusa'

/** Uma tentativa de cobrança registrada na esteira de recuperação. */
export interface InteracaoCobranca {
  clienteId: string
  data: Date
  canal: CanalCobranca
  responsavel: string
  resultado: ResultadoCobranca
  /** Valor prometido, renegociado ou efetivamente pago na interação, em BRL. */
  valor?: number
  observacao: string
}

export interface HistoricoScore {
  score: number
  rating: Rating
  data: Date
}

export interface Alerta {
  clienteId: string
  clienteNome: string
  tipo: TipoRedFlag
  descricao: string
  severidade: Severidade
  lido: boolean
  criadoEm: Date
}

/** RF-19 a RF-21: fase ONI cruzada com produtividade histórica (CONAB), por região/cultura. */
export interface IndiceRiscoClimatico {
  clienteId: string
  regiao: string
  cultura: Cultura
  faseONI: FaseONI
  quedaProdutividadeHistorica: number
  indiceRisco: number
  calculadoEm: Date
}

/** RF-24 a RF-27: tendência de preço (CEPEA/ESALQ) da cultura do cliente. */
export interface IndiceExposicaoCommodity {
  clienteId: string
  cultura: Cultura
  precoAtual: number
  variacao6Meses: number
  tendencia: 'alta' | 'estavel' | 'queda'
  indiceExposicao: number
  calculadoEm: Date
}

export type SituacaoCAR = 'ativo' | 'pendente' | 'suspenso' | 'cancelado'

/** RF-28: área plantada e regularidade da propriedade, via CAR/SICAR. */
export interface ImovelRural {
  clienteId: string
  codigoCAR: string
  areaTotalHa: number
  /** Área efetivamente em produção — é ela que gera a receita que paga o insumo. */
  areaPlantadaHa: number
  reservaLegalHa: number
  situacaoCAR: SituacaoCAR
  consultadoEm: Date
}

/** RF-08: explicabilidade — peso de cada fator na nota final. */
export interface ScoreBreakdown {
  clienteId: string
  pesoJuridicoFiscal: number
  pesoClimatico: number
  pesoCommodity: number
  scoreFinal: number
  ratingFinal: Rating
  calculadoEm: Date
}

/**
 * Visão consolidada de um cliente pra tela — Cliente + os quatro índices/registros
 * que hoje vivem embutidos no mesmo documento `clientes/{cnpj}` no Firestore
 * (climatico/commodity/breakdown/imovel), mais as duas subcoleções (historico/cobrancas).
 * `useDossie` (app/composables/useCarteira.ts) monta isso a partir do Firestore;
 * app/utils/mock.ts monta o mesmo formato a partir dos dados de semente.
 */
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
