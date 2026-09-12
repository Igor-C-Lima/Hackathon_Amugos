import type {
  CanalCobranca,
  Cultura,
  FaseONI,
  Rating,
  ResultadoCobranca,
  Severidade,
  SituacaoCAR,
  TipoGarantia,
  TipoRedFlag,
} from '~~/types/firestore'

/** Faixas de score (0–1000) para rating A–F. Usado também pelo simulador de cenário (RF-09/RF-31). */
export function ratingDoScore(score: number): Rating {
  if (score >= 800) return 'A'
  if (score >= 650) return 'B'
  if (score >= 500) return 'C'
  if (score >= 350) return 'D'
  return 'F'
}

export const corRating: Record<Rating, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'error',
  F: 'error',
}

export const corSeveridade: Record<Severidade, 'neutral' | 'info' | 'warning' | 'error'> = {
  baixa: 'neutral',
  media: 'info',
  alta: 'warning',
  critica: 'error',
}

export const rotuloCultura: Record<Cultura, string> = {
  soja: 'Soja',
  milho: 'Milho',
  algodao: 'Algodão',
  cafe: 'Café',
  boi: 'Boi gordo',
}

/** Unidade de referência CEPEA/ESALQ por cultura. */
export const unidadeCultura: Record<Cultura, string> = {
  soja: 'saca 60kg',
  milho: 'saca 60kg',
  algodao: 'arroba',
  cafe: 'saca 60kg',
  boi: 'arroba',
}

export const rotuloFaseONI: Record<FaseONI, string> = {
  nino_forte: 'El Niño forte',
  nino_moderado: 'El Niño moderado',
  nino_fraco: 'El Niño fraco',
  neutro: 'Neutro',
  nina_fraco: 'La Niña fraca',
  nina_moderado: 'La Niña moderada',
  nina_forte: 'La Niña forte',
}

export const rotuloGarantia: Record<TipoGarantia, string> = {
  alienacao_fiduciaria: 'Alienação fiduciária',
  penhor_safra: 'Penhor de safra',
  cpr_fisica: 'CPR física',
  cpr_financeira: 'CPR financeira',
}

export const rotuloRedFlag: Record<TipoRedFlag, string> = {
  rj: 'Recuperação judicial',
  protesto: 'Protesto',
  embargo_ambiental: 'Embargo ambiental',
  inadimplencia_tecnica: 'Inadimplência técnica',
  climatico: 'Risco climático',
  commodity: 'Preço de commodity',
}

export const categoriaRedFlag: Record<TipoRedFlag, string> = {
  rj: 'Jurídico',
  protesto: 'Fiscal',
  embargo_ambiental: 'Ambiental',
  inadimplencia_tecnica: 'Técnico',
  climatico: 'Climático',
  commodity: 'Commodity',
}

export const iconeRedFlag: Record<TipoRedFlag, string> = {
  rj: 'i-lucide-gavel',
  protesto: 'i-lucide-file-warning',
  embargo_ambiental: 'i-lucide-tree-pine',
  inadimplencia_tecnica: 'i-lucide-clock-alert',
  climatico: 'i-lucide-cloud-rain-wind',
  commodity: 'i-lucide-trending-down',
}

export const rotuloCanal: Record<CanalCobranca, string> = {
  telefone: 'Telefone',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  visita: 'Visita técnica',
  carta: 'Carta / notificação',
  juridico: 'Jurídico',
}

export const iconeCanal: Record<CanalCobranca, string> = {
  telefone: 'i-lucide-phone',
  email: 'i-lucide-mail',
  whatsapp: 'i-lucide-message-circle',
  visita: 'i-lucide-map-pin',
  carta: 'i-lucide-mail-warning',
  juridico: 'i-lucide-gavel',
}

export const rotuloResultado: Record<ResultadoCobranca, string> = {
  sem_contato: 'Sem contato',
  promessa_pagamento: 'Promessa de pagamento',
  renegociado: 'Renegociado',
  pagamento_parcial: 'Pagamento parcial',
  quitado: 'Quitado',
  recusa: 'Recusa',
}

export const corResultado: Record<ResultadoCobranca, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = {
  sem_contato: 'neutral',
  promessa_pagamento: 'info',
  renegociado: 'warning',
  pagamento_parcial: 'info',
  quitado: 'success',
  recusa: 'error',
}

export const rotuloSituacaoCAR: Record<SituacaoCAR, string> = {
  ativo: 'Ativo',
  pendente: 'Pendente de análise',
  suspenso: 'Suspenso',
  cancelado: 'Cancelado',
}

export const corSituacaoCAR: Record<SituacaoCAR, 'success' | 'warning' | 'error'> = {
  ativo: 'success',
  pendente: 'warning',
  suspenso: 'error',
  cancelado: 'error',
}

export const ha = (v: number) => `${v.toLocaleString('pt-BR')} ha`

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const dataBR = (d: Date) => d.toLocaleDateString('pt-BR')

export const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')}%`

export const mascaraCnpj = (cnpj: string) =>
  cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

/** Os três papéis do Portal Gestor (PAGES.md §1). O perfil decide qual seção abre primeiro. */
export type Perfil = 'credito' | 'cobranca' | 'diretoria'

export const rotuloPerfil: Record<Perfil, string> = {
  credito: 'Analista de Crédito',
  cobranca: 'Analista de Cobrança',
  diretoria: 'Diretoria',
}

/** Página inicial de cada perfil: crédito entra pela decisão, cobrança pela esteira. */
export const rotaInicial: Record<Perfil, string> = {
  credito: '/clientes',
  cobranca: '/cobranca',
  diretoria: '/portfolio',
}

export const usePerfil = () => useState<Perfil>('perfil', () => 'credito')

/** CNPJ/CPF identificado no Portal Contratante (RF-13). */
export const useContratante = () => useState<string>('contratante', () => '')
