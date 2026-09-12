let tokenCache: { token: string, expiresAt: number } | null = null

export async function getAgroApiToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    console.log('[agroapi-auth] reaproveitando token em cache')
    return tokenCache.token
  }

  const consumerKey = process.env.AGROAPI_CONSUMER_KEY
  const consumerSecret = process.env.AGROAPI_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw createError({ statusCode: 500, statusMessage: 'AGROAPI_CONSUMER_KEY ou AGROAPI_CONSUMER_SECRET não configurados' })
  }

  const credenciais = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  let resposta: { access_token?: string, expires_in?: number }

  try {
    resposta = await $fetch<{ access_token?: string, expires_in?: number }>('https://api.cnptia.embrapa.br/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credenciais}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    })
  }
  catch (error: any) {
    // O endpoint exato de token da AgroAPI ainda não foi confirmado numa
    // chamada real — loga a resposta completa do erro pra conferir.
    console.error('[agroapi-auth] Erro ao chamar https://api.cnptia.embrapa.br/token:', JSON.stringify(error?.data ?? error?.message ?? error))
    throw createError({ statusCode: 502, statusMessage: 'Falha ao gerar token da AgroAPI', data: error?.data })
  }

  if (!resposta.access_token) {
    console.error('[agroapi-auth] Resposta inesperada do endpoint de token da AgroAPI:', JSON.stringify(resposta))
    throw createError({ statusCode: 502, statusMessage: 'Resposta do endpoint de token da AgroAPI não contém access_token', data: resposta })
  }

  const expiresInMs = (resposta.expires_in ?? 3600) * 1000
  tokenCache = { token: resposta.access_token, expiresAt: Date.now() + expiresInMs - 60_000 }

  console.log('[agroapi-auth] token renovado, válido por', resposta.expires_in ?? 3600, 'segundos')

  return tokenCache.token
}
