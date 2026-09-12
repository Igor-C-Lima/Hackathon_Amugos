let tokenCache: { jwt: string, expiresAt: number } | null = null

async function obterTokenWatsonx(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.jwt
  }

  const apiKey = process.env.WATSONX_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'WATSONX_API_KEY não configurada' })
  }

  const tokenResponse = await $fetch<{ token?: string, access_token?: string, id_token?: string, expires_in?: number }>(
    'https://account-iam.platform.saas.ibm.com/api/2.0/apikeys/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: { apikey: apiKey },
    },
  )

  const jwt = tokenResponse.token ?? tokenResponse.access_token ?? tokenResponse.id_token

  if (!jwt) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Resposta do endpoint de autenticação do watsonx Orchestrate não contém um token reconhecido',
      data: tokenResponse,
    })
  }

  const expiresInMs = (tokenResponse.expires_in ?? 3600) * 1000
  tokenCache = { jwt, expiresAt: Date.now() + expiresInMs - 60_000 }

  return jwt
}

export async function chamarAgenteWatsonx(mensagem: string): Promise<string> {
  const serviceUrl = process.env.WATSONX_SERVICE_URL
  const agentId = process.env.WATSONX_AGENT_ID

  if (!serviceUrl || !agentId) {
    throw createError({ statusCode: 500, statusMessage: 'WATSONX_SERVICE_URL ou WATSONX_AGENT_ID não configurados' })
  }

  const jwt = await obterTokenWatsonx()

  const resposta = await $fetch<{ content?: string, choices?: Array<{ message?: { content?: string } }> }>(
    `${serviceUrl}/v1/orchestrate/${agentId}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: {
        messages: [{ role: 'user', content: mensagem }],
        stream: false,
      },
    },
  )

  return resposta.content ?? resposta.choices?.[0]?.message?.content ?? ''
}
