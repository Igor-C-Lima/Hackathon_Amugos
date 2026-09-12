export function validarCnpj(cnpj: string | undefined): string {
  const cnpjLimpo = (cnpj ?? '').replace(/\D/g, '')

  if (cnpjLimpo.length !== 14) {
    throw createError({ statusCode: 400, statusMessage: 'CNPJ inválido — informe 14 dígitos' })
  }

  return cnpjLimpo
}
