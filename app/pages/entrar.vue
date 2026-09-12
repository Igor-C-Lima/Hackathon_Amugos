<script setup lang="ts">
// Login / Seleção de perfil do Portal Gestor. A raiz agora é a landing.
// Sem autenticação real: o MVP do hackathon simplifica auth de propósito (plano §7).
useHead({ title: 'Entrar — Portal Gestor' })

const perfil = usePerfil()
const email = ref('analista@krilltech.com.br')
const senha = ref('')

// O perfil escolhido decide qual seção abre primeiro (PAGES.md §1).
const perfis = [
  {
    label: rotuloPerfil.credito,
    value: 'credito',
    description: 'Decisão de entrada: consulta clientes, roda due diligence e registra o limite',
  },
  {
    label: rotuloPerfil.cobranca,
    value: 'cobranca',
    description: 'Esteira de recuperação: fila de cobrança por risco × valor em aberto',
  },
  {
    label: rotuloPerfil.diretoria,
    value: 'diretoria',
    description: 'Visão agregada de portfólio e simulador de cenário clima + preço',
  },
] as const

function entrar() {
  navigateTo(rotaInicial[perfil.value])
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
                Portal Gestor
              </h1>
              <p class="text-sm text-muted">
                SafraScore — prevenção à inadimplência
              </p>
            </div>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="entrar">
          <UFormField label="E-mail corporativo" name="email">
            <UInput v-model="email" type="email" icon="i-lucide-mail" class="w-full" />
          </UFormField>

          <UFormField label="Senha" name="senha">
            <UInput v-model="senha" type="password" icon="i-lucide-lock" class="w-full" />
          </UFormField>

          <UFormField label="Perfil de acesso" name="perfil">
            <URadioGroup v-model="perfil" :items="perfis" value-key="value" />
          </UFormField>

          <UButton type="submit" block size="lg" trailing-icon="i-lucide-arrow-right">
            Entrar
          </UButton>
        </form>

        <template #footer>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted">É cliente da Krill Tech?</span>
            <ULink to="/contratante" class="font-medium text-primary">
              Acessar Portal do Contratante
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
    background: center / cover no-repeat url('/images/entrar-lavoura.jpg');
    filter: saturate(0.82) brightness(0.95);
  }
}
</style>
