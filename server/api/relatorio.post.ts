export default defineEventHandler(async (event) => {
  const { texto } = await readBody<{ texto?: string }>(event)

  try {
    const relatorio = await chamarAgenteWatsonx(texto ?? '')
    return { relatorio, erro: null }
  }
  catch (error: any) {
    return {
      relatorio: null,
      erro: error?.data?.message ?? error?.message ?? 'Erro ao chamar o agente watsonx Orchestrate',
    }
  }
})
