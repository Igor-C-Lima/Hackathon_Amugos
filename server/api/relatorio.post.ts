export default defineEventHandler(async (event) => {
  const { cnpj, fallback, contextoAdicional } = await readBody<{
    cnpj?: string
    fallback?: FallbackColetores
    contextoAdicional?: string
  }>(event)

  const cnpjLimpo = validarCnpj(cnpj)

  try {
    const { texto: textoColetado, dados: dadosColetados } = await montarContexto(cnpjLimpo, fallback)
    const contextoEnviado = contextoAdicional ? `${textoColetado}\n\n${contextoAdicional}` : textoColetado
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
