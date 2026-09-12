export default defineEventHandler(async (event) => {
  const { cnpj } = await readBody<{ cnpj?: string }>(event)

  if (!cnpj) {
    throw createError({ statusCode: 400, statusMessage: 'cnpj é obrigatório' })
  }

  const texto = await chamarAgenteWatsonx(`Faça uma análise da empresa com CNPJ ${cnpj}.`)

  return { texto }
})
