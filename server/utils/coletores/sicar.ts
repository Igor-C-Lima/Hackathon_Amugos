export interface DadosSicar {
  areaHectares: number
  regular: boolean
  embargos: number
}

export async function consultarSicar(_cnpj: string): Promise<DadosSicar | null> {
  try {
    // TODO: integrar com a API real do SICAR assim que o endpoint
    // definitivo for definido pelo time. Por enquanto devolve um mock fixo
    // sem embargos, pra não inventar pendências ambientais falsas.
    return {
      areaHectares: 0,
      regular: true,
      embargos: 0,
    }
  }
  catch {
    return null
  }
}
