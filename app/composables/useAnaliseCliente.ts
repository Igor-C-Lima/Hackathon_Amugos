interface DadosReceitaFederal {
  razaoSocial: string
  situacao: string
  cnaeDescricao: string
  dataAbertura: string
  socios: string[]
}

interface DadosDataJud {
  processos: Array<{ tipo: string, status: string }>
}

interface DadosSicar {
  areaHectares: number
  regular: boolean
  embargos: number
}

interface DadosMunicipio {
  codigoIBGE: number
  latitude: number
  longitude: number
}

interface DadosZarc {
  riscoPercentual: number
  mesInicio: string
  mesFim: string
}

export interface DadosColetados {
  receitaFederal: DadosReceitaFederal | null
  dataJud: DadosDataJud | null
  sicar: DadosSicar | null
  municipio: DadosMunicipio | null
  zarc: DadosZarc | null
}

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

/**
 * Encapsula as chamadas a /api/dados-cliente e /api/relatorio (ou
 * /api/relatorio-mock) com estados de loading/erro/data — mesma lógica já
 * validada em teste-cnpj.vue e teste-relatorio.vue, reaproveitável em
 * qualquer tela real do site.
 */
export function useAnaliseCliente() {
  const dadosColetados = ref<DadosColetados | null>(null)
  const contextoEnviado = ref('')
  const diagnostico = ref<DiagnosticoFonte[]>([])
  const erroDados = ref('')
  const carregandoDados = ref(false)

  const relatorio = ref('')
  const erroRelatorio = ref('')
  const carregandoRelatorio = ref(false)

  async function buscarDados(cnpj: string) {
    carregandoDados.value = true
    erroDados.value = ''
    dadosColetados.value = null
    contextoEnviado.value = ''
    diagnostico.value = []

    try {
      const resposta = await $fetch<{ dadosColetados: DadosColetados, contextoEnviado: string, diagnostico: DiagnosticoFonte[] }>(
        '/api/dados-cliente',
        { method: 'POST', body: { cnpj } },
      )

      dadosColetados.value = resposta.dadosColetados
      contextoEnviado.value = resposta.contextoEnviado
      diagnostico.value = resposta.diagnostico
    }
    catch (e: any) {
      erroDados.value = e?.data?.statusMessage ?? e?.message ?? 'Erro ao buscar dados'
    }
    finally {
      carregandoDados.value = false
    }
  }

  async function gerarRelatorio(cnpj: string, usarMock = true, fallback?: FallbackColetores, contextoAdicional?: string) {
    carregandoRelatorio.value = true
    erroRelatorio.value = ''
    relatorio.value = ''

    const endpoint = usarMock ? '/api/relatorio-mock' : '/api/relatorio'

    try {
      const resposta = await $fetch<{ relatorio: string | null, erro: string | null }>(
        endpoint,
        { method: 'POST', body: usarMock ? { cnpj } : { cnpj, fallback, contextoAdicional } },
      )

      if (resposta.erro) {
        erroRelatorio.value = resposta.erro
      }
      else {
        relatorio.value = resposta.relatorio ?? ''
      }
    }
    catch (e: any) {
      erroRelatorio.value = e?.data?.statusMessage ?? e?.message ?? 'Erro ao gerar relatório'
    }
    finally {
      carregandoRelatorio.value = false
    }
  }

  return {
    dadosColetados,
    contextoEnviado,
    diagnostico,
    erroDados,
    carregandoDados,
    buscarDados,
    relatorio,
    erroRelatorio,
    carregandoRelatorio,
    gerarRelatorio,
  }
}
