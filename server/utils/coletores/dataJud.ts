export interface DadosDataJud {
  processos: Array<{ tipo: string, status: string }>
}

export async function consultarDataJud(_cnpj: string): Promise<DadosDataJud | null> {
  try {
    // TODO: integrar com a API real do DataJud (CNJ) assim que o endpoint
    // definitivo for definido pelo time. Por enquanto devolve um mock fixo
    // sem nenhum processo, pra não inventar red flags jurídicas falsas.
    return {
      processos: [],
    }
  }
  catch {
    return null
  }
}
