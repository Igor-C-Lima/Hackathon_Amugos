export default defineEventHandler(async (event) => {
  const { cnpj } = await readBody<{ cnpj?: string }>(event)

  const cnpjLimpo = validarCnpj(cnpj)

  const { texto: contextoEnviado, dados: dadosColetados } = await montarContexto(cnpjLimpo)

  return { dadosColetados, contextoEnviado }
})
