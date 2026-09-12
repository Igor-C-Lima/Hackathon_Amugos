<script setup lang="ts">
// Página 7 — Login / Identificação do Contratante (RF-13).
useHead({ title: 'Entrar — Portal do Contratante' })

const contratante = useContratante()
const documento = ref('')
const erro = ref('')

function entrar() {
  const digitos = documento.value.replace(/\D/g, '')
  const encontrado = listarClientes().find(c => c.cnpj === digitos)

  if (!encontrado) {
    erro.value = 'Não encontramos esse CNPJ/CPF no cadastro da Krill Tech. Confira os números e tente de novo.'
    return
  }

  erro.value = ''
  contratante.value = encontrado.cnpj
  navigateTo('/contratante/situacao')
}
</script>

<template>
  <div class="campo-fundo flex min-h-screen items-center justify-center p-4">
    <GridTalhao />

    <div class="flex w-full max-w-3xl flex-col items-center gap-8 lg:flex-row lg:justify-center">
      <UCard class="w-full max-w-md shrink-0">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-sprout" class="size-8 text-primary" />
            <div>
              <h1 class="text-lg font-semibold">
                Minha situação
              </h1>
              <p class="text-sm text-muted">
                Portal do Contratante — Krill Tech
              </p>
            </div>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="entrar">
          <UFormField
            label="CNPJ ou CPF"
            name="documento"
            description="O mesmo documento usado na compra do insumo."
            :error="erro"
          >
            <UInput
              v-model="documento"
              icon="i-lucide-id-card"
              placeholder="00.000.000/0000-00"
              class="w-full"
            />
          </UFormField>

          <UButton type="submit" block size="lg" trailing-icon="i-lucide-arrow-right">
            Ver minha situação
          </UButton>
        </form>

        <template #footer>
          <div class="space-y-3">
            <p class="text-xs text-muted">
              Para testar: use o CNPJ de um cliente da carteira, por exemplo
              <button
                type="button"
                class="font-mono text-primary hover:underline"
                @click="documento = '12345678000190'"
              >
                12.345.678/0001-90
              </button>
            </p>
            <ULink to="/entrar" class="text-sm text-muted hover:text-primary">
              Sou do time da Krill Tech
            </ULink>
          </div>
        </template>
      </UCard>

      <!-- Decorativa, mesmo padrão da landing: só existe a partir do breakpoint em que
           a coluna aparece, então telas estreitas nunca baixam o arquivo. -->
      <div class="foto-painel" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.foto-painel {
  display: none;
}

@media (min-width: 64rem) {
  .foto-painel {
    display: block;
    width: 18rem;
    aspect-ratio: 3 / 4;
    flex-shrink: 0;
    border: 1px solid var(--ui-border);
    background: center / cover no-repeat url('/images/contratante-lavoura.jpg');
    filter: saturate(0.82) brightness(0.95);
  }
}
</style>
