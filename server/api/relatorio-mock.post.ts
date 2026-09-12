export default defineEventHandler(async (event) => {
  const { cnpj } = await readBody<{ cnpj?: string }>(event)

  // simula latência real da API
  await new Promise(resolve => setTimeout(resolve, 800))

  const dadosColetados = {
    receitaFederal: {
      razaoSocial: 'EMPRESA EXEMPLO LTDA',
      situacao: 'ATIVA',
      cnaeDescricao: 'Cultivo de soja',
      dataAbertura: '2010-05-12',
      socios: ['JOÃO DA SILVA', 'MARIA OLIVEIRA'],
    },
    dataJud: {
      processos: [],
    },
    sicar: {
      areaHectares: 1250,
      regular: true,
      embargos: 0,
    },
  }

  const contextoEnviado = `Dados cadastrais: empresa "${dadosColetados.receitaFederal.razaoSocial}", situação cadastral "${dadosColetados.receitaFederal.situacao}", atividade principal "${dadosColetados.receitaFederal.cnaeDescricao}", em atividade desde ${dadosColetados.receitaFederal.dataAbertura}.

Situação jurídica: nenhum processo de execução, protesto ou Recuperação Judicial identificado.

Situação da propriedade rural: área de ${dadosColetados.sicar.areaHectares}ha, regular no CAR, sem embargos ambientais.`

  return {
    relatorio: `Relatório de Análise de Risco (MOCK)

Com base no CNPJ informado (${cnpj}), o cliente apresenta:

- Score estimado: 620 (Risco Moderado - Faixa B)
- Situação cadastral: regular
- Red flags: nenhuma execução ou protesto identificado
- Situação da safra: risco climático moderado na região

Recomendação: manter limite de crédito atual, mas monitorar a próxima safra
de perto devido ao risco climático identificado.`,
    dadosColetados,
    contextoEnviado,
    erro: null,
  }
})
