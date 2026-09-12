interface Cliente {
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  cnae: string
  municipio: string
  uf: string
  dataAbertura: Date
  capitalSocial: number
  scoreAtual: number
  ratingAtual: 'A' | 'B' | 'C' | 'D'
  redFlags: RedFlag[]
  relatorioLLM?: string
  criadoEm: Date
  atualizadoEm: Date
}

interface RedFlag {
  tipo: 'rj' | 'protesto' | 'embargo_ambiental' | 'inadimplencia_tecnica'
  descricao: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  detectadoEm: Date
}

interface HistoricoScore {
  score: number
  rating: 'A' | 'B' | 'C' | 'D'
  data: Date
}

interface Alerta {
  clienteId: string
  clienteNome: string
  tipo: RedFlag['tipo']
  descricao: string
  severidade: RedFlag['severidade']
  lido: boolean
  criadoEm: Date
}