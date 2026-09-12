export default defineEventHandler(async (event) => {
  const { cnpj, fallback } = await readBody<{ cnpj?: string, fallback?: FallbackColetores }>(event)

  const cnpjLimpo = validarCnpj(cnpj)

  try {
    const { texto: contextoEnviado, dados: dadosColetados } = await montarContexto(cnpjLimpo, fallback)
    const relatorio = await chamarAgenteWatsonx(contextoEnviado)

    return { relatorio, dadosColetados, contextoEnviado, erro: null }
  }
  catch (error: any) {
    return {
      relatorio: null,
      dadosColetados: null,
      contextoEnviado: null,
      erro: error?.data?.message ?? error?.message ?? 'Erro ao gerar relatório',
    }
  }
})
