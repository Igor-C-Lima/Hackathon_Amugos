export interface DadosColetados {
  receitaFederal: DadosReceitaFederal | null
  dataJud: DadosDataJud | null
  sicar: DadosSicar | null
  municipio: DadosMunicipio | null
  zarc: DadosZarc | null
}

export interface ContextoMontado {
  texto: string
  dados: DadosColetados
}

function montarBlocoCadastral(dados: DadosReceitaFederal | null): string {
  if (!dados) {
    return 'Dados cadastrais: não foi possível consultar a Receita Federal no momento.'
  }

  return `Dados cadastrais: empresa "${dados.razaoSocial}", situação cadastral "${dados.situacao}", atividade principal "${dados.cnaeDescricao}", em atividade desde ${dados.dataAbertura}.`
}

function montarBlocoJuridico(dados: DadosDataJud | null): string {
  if (!dados) {
    return 'Situação jurídica: não disponível no momento.'
  }

  if (dados.processos.length === 0) {
    return 'Situação jurídica: nenhum processo de execução, protesto ou Recuperação Judicial identificado.'
  }

  const listaProcessos = dados.processos.map(processo => `${processo.tipo} (${processo.status})`).join(', ')

  return `Situação jurídica: ${dados.processos.length} processo(s) encontrado(s), incluindo: ${listaProcessos}.`
}

function montarBlocoRural(dados: DadosSicar | null): string {
  if (!dados) {
    return 'Situação da propriedade rural: não disponível no momento.'
  }

  const situacaoCar = dados.regular ? 'regular' : 'com pendências'
  const situacaoEmbargos = dados.embargos > 0 ? `com ${dados.embargos} embargo(s) ambiental(is)` : 'sem embargos ambientais'

  return `Situação da propriedade rural: área de ${dados.areaHectares}ha, ${situacaoCar} no CAR, ${situacaoEmbargos}.`
}

function montarBlocoZoneamento(zarc: DadosZarc | null): string {
  if (!zarc) {
    return 'Zoneamento agrícola: não disponível.'
  }

  return `Zoneamento agrícola indica risco de ${zarc.riscoPercentual}% para o plantio de soja na região, com janela recomendada entre ${zarc.mesInicio} e ${zarc.mesFim}.`
}

export async function montarContexto(cnpj: string): Promise<ContextoMontado> {
  const [receitaFederalResult, dataJudResult, sicarResult] = await Promise.allSettled([
    consultarReceitaFederal(cnpj),
    consultarDataJud(cnpj),
    consultarSicar(cnpj),
  ])

  const dadosReceitaFederal = receitaFederalResult.status === 'fulfilled' ? receitaFederalResult.value : null
  const dadosDataJud = dataJudResult.status === 'fulfilled' ? dataJudResult.value : null
  const dadosSicar = sicarResult.status === 'fulfilled' ? sicarResult.value : null

  const dadosMunicipio = dadosReceitaFederal
    ? await consultarMunicipio({ municipio: dadosReceitaFederal.municipio, uf: dadosReceitaFederal.uf })
    : null

  const dadosZarc = dadosMunicipio
    ? await consultarZarc({ codigoIBGE: dadosMunicipio.codigoIBGE })
    : null

  const texto = [
    montarBlocoCadastral(dadosReceitaFederal),
    montarBlocoJuridico(dadosDataJud),
    montarBlocoRural(dadosSicar),
    montarBlocoZoneamento(dadosZarc),
  ].join('\n\n')

  return {
    texto,
    dados: {
      receitaFederal: dadosReceitaFederal,
      dataJud: dadosDataJud,
      sicar: dadosSicar,
      municipio: dadosMunicipio,
      zarc: dadosZarc,
    },
  }
}
