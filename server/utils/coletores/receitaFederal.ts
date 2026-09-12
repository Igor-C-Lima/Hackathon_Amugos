export interface DadosReceitaFederal {
  razaoSocial: string
  situacao: string
  cnaeDescricao: string
  dataAbertura: string
  socios: string[]
  municipio: string
  uf: string
}

export async function consultarReceitaFederal(cnpj: string): Promise<DadosReceitaFederal | null> {
  try {
    const cnpjLimpo = cnpj.replace(/\D/g, '')

    const dados = await $fetch<{
      razao_social: string
      descricao_situacao_cadastral: string
      cnae_fiscal_descricao: string
      data_inicio_atividade: string
      qsa?: Array<{ nome_socio: string }>
      municipio: string
      uf: string
    }>(`https://minhareceita.org/${cnpjLimpo}`)

    return {
      razaoSocial: dados.razao_social,
      situacao: dados.descricao_situacao_cadastral,
      cnaeDescricao: dados.cnae_fiscal_descricao,
      dataAbertura: dados.data_inicio_atividade,
      socios: (dados.qsa ?? []).map(socio => socio.nome_socio),
      municipio: dados.municipio,
      uf: dados.uf,
    }
  }
  catch {
    return null
  }
}
