<script setup lang="ts">
const route = useRoute()
const cnpj = computed(() => String(route.query.cnpj ?? ''))

const relatorio = ref('')
const erro = ref('')
const carregando = ref(true)

async function gerarRelatorio() {
  carregando.value = true
  erro.value = ''
  relatorio.value = ''

  if (!cnpj.value) {
    erro.value = 'Nenhum CNPJ informado na URL (?cnpj=...)'
    carregando.value = false
    return
  }

  try {
    const resposta = await $fetch<{ relatorio: string | null, erro: string | null }>('/api/relatorio', {
      method: 'POST',
      body: { cnpj: cnpj.value },
    })

    if (resposta.erro) {
      erro.value = resposta.erro
    }
    else {
      relatorio.value = resposta.relatorio ?? ''
    }
  }
  catch (e: any) {
    erro.value = e?.data?.statusMessage ?? e?.message ?? 'Erro ao gerar relatório'
  }
  finally {
    carregando.value = false
  }
}

onMounted(gerarRelatorio)
</script>

<template>
  <div style="max-width: 640px; margin: 2rem auto; padding: 0 1rem;">
    <h1>Relatório — CNPJ {{ cnpj }}</h1>

    <p v-if="carregando">
      Gerando relatório...
    </p>

    <p v-if="erro" style="color: red;">
      {{ erro }}
    </p>

    <pre v-if="relatorio" style="white-space: pre-wrap;">{{ relatorio }}</pre>
  </div>
</template>
