export interface DadosZarc {
  riscoPercentual: number
  mesInicio: string
  mesFim: string
}

const ID_CULTURA_SOJA = 60

const NOMES_MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function nomeDoMes(mes: number): string {
  return NOMES_MESES[mes - 1] ?? String(mes)
}

export async function consultarZarc(params: { codigoIBGE: number }): Promise<DadosZarc> {
  const token = await getAgroApiToken()

  const resposta = await $fetch<{ data: Array<{ risco: number, mesIni: number, mesFim: number }> }>(
    'https://api.cnptia.embrapa.br/agritec/v2/zoneamento',
    {
      query: { idCultura: ID_CULTURA_SOJA, codigoIBGE: params.codigoIBGE, risco: 20 },
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  const janela = resposta.data[0]

  if (!janela) {
    throw createError({ statusCode: 404, statusMessage: `Nenhuma janela de plantio encontrada para o código IBGE ${params.codigoIBGE}` })
  }

  return {
    riscoPercentual: janela.risco,
    mesInicio: nomeDoMes(janela.mesIni),
    mesFim: nomeDoMes(janela.mesFim),
  }
}
