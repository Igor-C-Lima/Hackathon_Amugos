export default defineEventHandler(async (event) => {
  const { cnpj } = await readBody<{ cnpj?: string }>(event)

  const cnpjLimpo = validarCnpj(cnpj)

  try {
    const { texto: contextoEnviado, dados: dadosColetados } = await montarContexto(cnpjLimpo)
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
