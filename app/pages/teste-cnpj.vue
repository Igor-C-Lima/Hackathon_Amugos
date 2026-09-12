<script setup lang="ts">
interface DadosColetados {
  receitaFederal: { razaoSocial: string, situacao: string, cnaeDescricao: string, dataAbertura: string, socios: string[] } | null
  dataJud: { processos: Array<{ tipo: string, status: string }> } | null
  sicar: { areaHectares: number, regular: boolean, embargos: number } | null
}

const cnpj = ref('')
const dadosColetados = ref<DadosColetados | null>(null)
const contextoEnviado = ref('')
const erro = ref('')
const carregando = ref(false)

async function buscarDados() {
  carregando.value = true
  erro.value = ''
  dadosColetados.value = null
  contextoEnviado.value = ''

  try {
    const resposta = await $fetch<{ dadosColetados: DadosColetados, contextoEnviado: string }>('/api/dados-cliente', {
      method: 'POST',
      body: { cnpj: cnpj.value },
    })

    dadosColetados.value = resposta.dadosColetados
    contextoEnviado.value = resposta.contextoEnviado
  }
  catch (e: any) {
    erro.value = e?.data?.statusMessage ?? e?.message ?? 'Erro ao buscar dados'
  }
  finally {
    carregando.value = false
  }
}

function irParaRelatorio() {
  navigateTo(`/teste-relatorio?cnpj=${encodeURIComponent(cnpj.value)}`)
}
</script>

<template>
  <div style="max-width: 640px; margin: 2rem auto; padding: 0 1rem;">
    <h1>Teste de coleta de dados (CNPJ)</h1>

    <input
      v-model="cnpj"
      type="text"
      placeholder="CNPJ (ex: 00.000.000/0001-91)"
      style="width: 100%; margin-bottom: 1rem;"
    >

    <button :disabled="carregando" @click="buscarDados">
      {{ carregando ? 'Buscando...' : 'Buscar dados' }}
    </button>

    <p v-if="erro" style="color: red; margin-top: 1rem;">
      {{ erro }}
    </p>

    <template v-if="dadosColetados">
      <h2 style="margin-top: 1.5rem;">
        Dados cadastrais
      </h2>
      <template v-if="dadosColetados.receitaFederal">
        <p><strong>Razão social:</strong> {{ dadosColetados.receitaFederal.razaoSocial }}</p>
        <p><strong>Situação:</strong> {{ dadosColetados.receitaFederal.situacao }}</p>
        <p><strong>Atividade principal:</strong> {{ dadosColetados.receitaFederal.cnaeDescricao }}</p>
        <p><strong>Em atividade desde:</strong> {{ dadosColetados.receitaFederal.dataAbertura }}</p>
        <p><strong>Sócios:</strong> {{ dadosColetados.receitaFederal.socios.join(', ') || '—' }}</p>
      </template>
      <p v-else>
        Não foi possível consultar a Receita Federal.
      </p>

      <h2 style="margin-top: 1.5rem;">
        Situação jurídica
      </h2>
      <template v-if="dadosColetados.dataJud">
        <p v-if="dadosColetados.dataJud.processos.length === 0">
          Nenhum processo encontrado.
        </p>
        <ul v-else>
          <li v-for="(processo, i) in dadosColetados.dataJud.processos" :key="i">
            {{ processo.tipo }} ({{ processo.status }})
          </li>
        </ul>
      </template>
      <p v-else>
        Não disponível.
      </p>

      <h2 style="margin-top: 1.5rem;">
        Situação ambiental / rural
      </h2>
      <template v-if="dadosColetados.sicar">
        <p><strong>Área:</strong> {{ dadosColetados.sicar.areaHectares }}ha</p>
        <p><strong>Regularidade no CAR:</strong> {{ dadosColetados.sicar.regular ? 'Regular' : 'Com pendências' }}</p>
        <p><strong>Embargos ambientais:</strong> {{ dadosColetados.sicar.embargos }}</p>
      </template>
      <p v-else>
        Não disponível.
      </p>

      <h2 style="margin-top: 1.5rem;">
        Contexto enviado (preview)
      </h2>
      <pre style="white-space: pre-wrap; background: rgba(128,128,128,0.1); padding: 0.75rem;">{{ contextoEnviado }}</pre>

      <button style="margin-top: 1.5rem;" @click="irParaRelatorio">
        Gerar relatório
      </button>
    </template>
  </div>
</template>
