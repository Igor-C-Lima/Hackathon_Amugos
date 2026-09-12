<script setup lang="ts">
const texto = ref('')
const usarMock = ref(true)
const relatorio = ref('')
const erro = ref('')
const carregando = ref(false)

async function gerarRelatorio() {
  carregando.value = true
  erro.value = ''
  relatorio.value = ''

  const endpoint = usarMock.value ? '/api/relatorio-mock' : '/api/relatorio'

  try {
    const resposta = await $fetch<{ relatorio: string | null, erro: string | null }>(endpoint, {
      method: 'POST',
      body: { texto: texto.value },
    })

    if (resposta.erro) {
      erro.value = resposta.erro
    }
    else {
      relatorio.value = resposta.relatorio ?? ''
    }
  }
  catch (e: any) {
    erro.value = e?.message ?? 'Erro ao gerar relatório'
  }
  finally {
    carregando.value = false
  }
}
</script>

<template>
  <div style="max-width: 640px; margin: 2rem auto; padding: 0 1rem;">
    <h1>Teste de relatório</h1>

    <textarea
      v-model="texto"
      rows="6"
      placeholder="Digite aqui os dados do cliente..."
      style="width: 100%; margin-bottom: 1rem;"
    />

    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
      <input v-model="usarMock" type="checkbox">
      usar mock
    </label>

    <button :disabled="carregando" @click="gerarRelatorio">
      {{ carregando ? 'Gerando...' : 'Gerar relatório' }}
    </button>

    <p v-if="erro" style="color: red; margin-top: 1rem;">
      {{ erro }}
    </p>

    <pre v-if="relatorio" style="white-space: pre-wrap; margin-top: 1rem;">{{ relatorio }}</pre>
  </div>
</template>
