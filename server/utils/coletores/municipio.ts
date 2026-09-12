export interface DadosMunicipio {
  codigoIBGE: number
  latitude: number
  longitude: number
}

function normalizarNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export async function consultarMunicipio(params: { municipio: string, uf: string }): Promise<DadosMunicipio> {
  const token = await getAgroApiToken()

  const resposta = await $fetch<{ data: Array<{ nome: string, codigoIBGE: number, latitude: number, longitude: number }> }>(
    'https://api.cnptia.embrapa.br/agritec/v2/municipios',
    {
      query: { uf: params.uf },
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  const nomeBuscado = normalizarNome(params.municipio)
  const encontrado = resposta.data.find(m => normalizarNome(m.nome) === nomeBuscado)

  if (!encontrado) {
    throw createError({ statusCode: 404, statusMessage: `Município "${params.municipio}" não encontrado na base da Agritec (UF ${params.uf})` })
  }

  return {
    codigoIBGE: encontrado.codigoIBGE,
    latitude: encontrado.latitude,
    longitude: encontrado.longitude,
  }
}
