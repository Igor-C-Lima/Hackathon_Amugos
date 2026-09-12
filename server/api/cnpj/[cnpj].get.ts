/**
 * Enriquecimento cadastral via BrasilAPI (Receita Federal).
 *
 * Passa por rota de servidor, não pelo client, por dois motivos do plano (§7 e §8):
 * toda consulta externa sai por proxy — evita CORS e mantém o padrão que valerá
 * quando as bases exigirem chave, que nunca pode ir no bundle.
 */

interface RespostaBrasilAPI {
  razao_social?: string
  nome_fantasia?: string
  cnae_fiscal?: number
  cnae_fiscal_descricao?: string
  municipio?: string
  uf?: string
  data_inicio_atividade?: string
  capital_social?: number
}

export default defineEventHandler(async (event) => {
  const cnpj = (getRouterParam(event, 'cnpj') ?? '').replace(/\D/g, '')

  if (cnpj.length !== 14) {
    throw createError({ statusCode: 400, statusMessage: 'CNPJ deve ter 14 dígitos' })
  }

  try {
    const dados = await $fetch<RespostaBrasilAPI>(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
      {
        timeout: 8000,
        // Sem User-Agent identificável a BrasilAPI responde 403 ao cliente HTTP padrão do Node.
        headers: { 'User-Agent': 'KrillTech-Score/0.1 (hackathon PMI-DF)' },
      },
    )

    return {
      erro: null,
      dados: {
        razaoSocial: dados.razao_social ?? '',
        nomeFantasia: dados.nome_fantasia || undefined,
        cnae: dados.cnae_fiscal && dados.cnae_fiscal_descricao
          ? `${dados.cnae_fiscal} — ${dados.cnae_fiscal_descricao}`
          : '',
        municipio: dados.municipio ?? '',
        uf: dados.uf ?? '',
        dataAbertura: dados.data_inicio_atividade ?? '',
        capitalSocial: dados.capital_social ?? 0,
      },
    }
  }
  catch (erro) {
    // A consulta é um assistente, não um bloqueio: o cadastro manual segue sem ela.
    const status = (erro as { statusCode?: number }).statusCode
    console.error('[cnpj] falha na consulta:', status, (erro as Error).message)
    const mensagens: Record<number, string> = {
      400: 'CNPJ inválido — confira os dígitos verificadores.',
      404: 'CNPJ não encontrado na Receita Federal.',
    }

    return {
      dados: null,
      erro: mensagens[status ?? 0]
        ?? 'Não foi possível consultar a Receita agora. Preencha os campos manualmente.',
    }
  }
})
