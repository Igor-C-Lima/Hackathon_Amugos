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
