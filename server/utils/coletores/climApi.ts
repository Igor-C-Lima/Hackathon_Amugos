export interface DadosClimaticos {
  temperaturaMaxima: number
  precipitacao: number
}

function extrairValor(resposta: unknown): number | null {
  // Formato exato da resposta do ClimAPI ainda não confirmado — assumindo
  // um array de pontos com campo "valor" (ex: [{ data, valor }]).
  // Ajustar aqui quando confirmarmos com uma chamada real.
  if (Array.isArray(resposta) && typeof resposta[0]?.valor === 'number') {
    return resposta[0].valor
  }

  return null
}

export async function consultarClimApi(params: { latitude: number, longitude: number }): Promise<DadosClimaticos | null> {
  try {
    const token = await getAgroApiToken()
    const dataHoje = new Date().toISOString().slice(0, 10)
    const headers = { Authorization: `Bearer ${token}` }
    const base = 'https://api.cnptia.embrapa.br/climapi/v1/ncep-gfs'

    const [tmaxResposta, precipResposta] = await Promise.all([
      $fetch(`${base}/tmax2m/${dataHoje}/${params.longitude}/${params.latitude}`, { headers }),
      $fetch(`${base}/apcpsfc/${dataHoje}/${params.longitude}/${params.latitude}`, { headers }),
    ])

    const temperaturaMaxima = extrairValor(tmaxResposta)
    const precipitacao = extrairValor(precipResposta)

    if (temperaturaMaxima === null || precipitacao === null) {
      return null
    }

    return { temperaturaMaxima, precipitacao }
  }
  catch {
    return null
  }
}
