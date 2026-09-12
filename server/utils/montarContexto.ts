export interface DiagnosticoFonte {
  fonte: string
  sucesso: boolean
  erro?: string
  origem?: 'real' | 'sintetico'
}

export interface FallbackColetores {
  receitaFederal?: DadosReceitaFederal
  dataJud?: DadosDataJud
  sicar?: DadosSicar
}

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
  diagnostico: DiagnosticoFonte[]
}

function extrairMensagemErro(error: any): string {
  return error?.data?.statusMessage ?? error?.data?.message ?? error?.statusMessage ?? error?.message ?? 'Erro desconhecido'
}

async function coletar<T>(fonte: string, promessa: Promise<T>, fallback?: T): Promise<{ dados: T | null, diagnostico: DiagnosticoFonte }> {
  try {
    const dados = await promessa
    console.log(`[coleta] ${fonte}: sucesso —`, JSON.stringify(dados))
    return { dados, diagnostico: { fonte, sucesso: true, origem: 'real' } }
  }
  catch (error: any) {
    const mensagem = extrairMensagemErro(error)
    console.error(`[coleta] ${fonte}: falhou —`, mensagem)

    if (fallback) {
      console.log(`[coleta] ${fonte}: usando dado sintético de fallback —`, JSON.stringify(fallback))
      return { dados: fallback, diagnostico: { fonte, sucesso: true, origem: 'sintetico' } }
    }

    return { dados: null, diagnostico: { fonte, sucesso: false, erro: mensagem } }
  }
}

function diagnosticoPulado(fonte: string, motivo: string): { dados: null, diagnostico: DiagnosticoFonte } {
  console.log(`[coleta] ${fonte}: pulado —`, motivo)
  return { dados: null, diagnostico: { fonte, sucesso: false, erro: motivo } }
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

export async function montarContexto(cnpj: string, fallback?: FallbackColetores): Promise<ContextoMontado> {
  const [receitaFederalColetado, dataJudColetado, sicarColetado] = await Promise.all([
    coletar('Receita Federal', consultarReceitaFederal(cnpj), fallback?.receitaFederal),
    coletar('DataJud', consultarDataJud(cnpj), fallback?.dataJud),
    coletar('SICAR', consultarSicar(cnpj), fallback?.sicar),
  ])

  const dadosReceitaFederal = receitaFederalColetado.dados
  const dadosDataJud = dataJudColetado.dados
  const dadosSicar = sicarColetado.dados

  const municipioColetado = dadosReceitaFederal
    ? await coletar('Município (Agritec)', consultarMunicipio({ municipio: dadosReceitaFederal.municipio, uf: dadosReceitaFederal.uf }))
    : diagnosticoPulado('Município (Agritec)', 'Dados da Receita Federal indisponíveis — não foi possível determinar o município')

  const dadosMunicipio = municipioColetado.dados

  const zarcColetado = dadosMunicipio
    ? await coletar('ZARC (Agritec)', consultarZarc({ codigoIBGE: dadosMunicipio.codigoIBGE }))
    : diagnosticoPulado('ZARC (Agritec)', 'Município indisponível — zoneamento não pôde ser consultado')

  const dadosZarc = zarcColetado.dados

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
    diagnostico: [
      receitaFederalColetado.diagnostico,
      dataJudColetado.diagnostico,
      sicarColetado.diagnostico,
      municipioColetado.diagnostico,
      zarcColetado.diagnostico,
    ],
  }
}
