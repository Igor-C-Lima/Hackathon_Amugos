export interface DadosDataJud {
  processos: Array<{ tipo: string, status: string }>
}

export async function consultarDataJud(_cnpj: string): Promise<DadosDataJud> {
  // A API pública do DataJud (CNJ) existe e é gratuita (api-publica.datajud.cnj.jus.br),
  // mas o schema de dados dela não indexa partes do processo (nome/CPF/CNPJ) — só
  // permite buscar por número de processo já conhecido, classe ou órgão julgador.
  // Verificado numa chamada real: não tem como perguntar "esse CNPJ tem processo?".
  // Serviços de terceiro que fazem esse cruzamento (Judit.io, Escavador, Jusbrasil
  // Soluções) existem, mas são pagos/sales-gated — decisão de negócio, não técnica.
  // Mock fixo sem nenhum processo, pra não inventar red flags jurídicas falsas.
  return {
    processos: [],
  }
}
