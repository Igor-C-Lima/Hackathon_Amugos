export default defineEventHandler(async (event) => {
  const { texto } = await readBody<{ texto?: string }>(event)

  // simula latência real da API
  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    relatorio: `Relatório de Análise de Risco (MOCK)

Com base nas informações fornecidas ("${(texto ?? '').slice(0, 50)}..."), o cliente apresenta:

- Score estimado: 620 (Risco Moderado - Faixa B)
- Situação cadastral: regular
- Red flags: nenhuma execução ou protesto identificado
- Situação da safra: risco climático moderado na região

Recomendação: manter limite de crédito atual, mas monitorar a próxima safra
de perto devido ao risco climático identificado.`,
    erro: null,
  }
})
