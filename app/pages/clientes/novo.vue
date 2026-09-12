<script setup lang="ts">
import type { Cultura, SituacaoCAR, TipoGarantia } from '~~/types/firestore'

// Página 9 — Cadastro de novo cliente.
// O analista digita os dados; a consulta à Receita apenas preenche o que já é público.
// A due diligence completa (RF-19 a RF-27) roda depois, sobre a cultura e a praça declaradas.
definePageMeta({ layout: 'gestor' })
useHead({ title: 'Novo cliente — Portal Gestor' })

const toast = useToast()

const form = reactive({
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  cnae: '',
  municipio: '',
  uf: '',
  dataAbertura: '',
  capitalSocial: 0,
  culturaPredominante: 'soja' as Cultura,
  barterAtivo: false,
  tipoGarantia: 'nenhuma' as TipoGarantia | 'nenhuma',
  garantiaAtiva: true,
  valorEmAberto: 0,
  codigoCAR: '',
  areaTotalHa: 0,
  areaPlantadaHa: 0,
  situacaoCAR: 'ativo' as SituacaoCAR,
})

const culturas = (Object.keys(rotuloCultura) as Cultura[]).map(value => ({
  label: rotuloCultura[value],
  value,
}))

const garantias = [
  { label: 'Sem garantia registrada', value: 'nenhuma' as const },
  ...(Object.keys(rotuloGarantia) as TipoGarantia[]).map(value => ({
    label: rotuloGarantia[value],
    value,
  })),
]

const situacoes = (Object.keys(rotuloSituacaoCAR) as SituacaoCAR[]).map(value => ({
  label: rotuloSituacaoCAR[value],
  value,
}))

const consultando = ref(false)
const erroConsulta = ref('')
const enriquecido = ref(false)

const cnpjValido = computed(() => form.cnpj.replace(/\D/g, '').length === 14)

/** Enriquecimento pela Receita Federal via rota de servidor — assistente, não obrigatório. */
async function consultarReceita() {
  if (!cnpjValido.value) return

  consultando.value = true
  erroConsulta.value = ''

  const { dados, erro } = await $fetch(`/api/cnpj/${form.cnpj.replace(/\D/g, '')}`)

  consultando.value = false

  if (erro || !dados) {
    erroConsulta.value = erro ?? 'Falha na consulta.'
    return
  }

  // Só preenche o que veio; o que o analista já digitou não é sobrescrito por vazio.
  form.razaoSocial = dados.razaoSocial || form.razaoSocial
  form.nomeFantasia = dados.nomeFantasia || form.nomeFantasia
  form.cnae = dados.cnae || form.cnae
  form.municipio = dados.municipio || form.municipio
  form.uf = dados.uf || form.uf
  form.dataAbertura = dados.dataAbertura || form.dataAbertura
  form.capitalSocial = dados.capitalSocial || form.capitalSocial
  enriquecido.value = true
}

const podeSalvar = computed(() =>
  cnpjValido.value
  && form.razaoSocial.trim().length > 2
  && form.municipio.trim().length > 1
  && form.uf.trim().length === 2
  && form.areaTotalHa > 0
  && form.areaPlantadaHa > 0
  && form.areaPlantadaHa <= form.areaTotalHa,
)

const erroArea = computed(() =>
  form.areaPlantadaHa > 0 && form.areaTotalHa > 0 && form.areaPlantadaHa > form.areaTotalHa
    ? 'A área em produção não pode ser maior que a área total.'
    : undefined,
)

const salvando = ref(false)

async function salvar() {
  if (!podeSalvar.value) return

  const cnpj = form.cnpj.replace(/\D/g, '')
  salvando.value = true

  try {
    if (await existeCliente(cnpj)) {
      toast.add({
        title: 'Cliente já cadastrado',
        description: 'Esse CNPJ já está na carteira.',
        color: 'warning',
        icon: 'i-lucide-triangle-alert',
      })
      return
    }

    const dossie = await cadastrarClienteNoBanco({
      cnpj,
      razaoSocial: form.razaoSocial.trim(),
      nomeFantasia: form.nomeFantasia.trim() || undefined,
      cnae: form.cnae.trim(),
      municipio: form.municipio.trim(),
      uf: form.uf.trim().toUpperCase(),
      dataAbertura: form.dataAbertura ? new Date(form.dataAbertura) : new Date(),
      capitalSocial: form.capitalSocial,
      culturaPredominante: form.culturaPredominante,
      barterAtivo: form.barterAtivo,
      garantia: form.tipoGarantia !== 'nenhuma'
        ? { tipo: form.tipoGarantia, ativo: form.garantiaAtiva }
        : undefined,
      valorEmAberto: form.valorEmAberto,
      codigoCAR: form.codigoCAR.trim() || 'não informado',
      areaTotalHa: form.areaTotalHa,
      areaPlantadaHa: form.areaPlantadaHa,
      situacaoCAR: form.situacaoCAR,
    })

    toast.add({
      title: 'Cliente cadastrado',
      description: `Score inicial ${dossie.cliente.scoreAtual} (rating ${dossie.cliente.ratingAtual}).`,
      color: 'success',
      icon: 'i-lucide-check',
    })

    navigateTo(`/clientes/${cnpj}`)
  }
  catch {
    toast.add({
      title: 'Falha ao cadastrar',
      description: 'Não foi possível gravar o cliente no banco. Tente de novo.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  }
  finally {
    salvando.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="novo-cliente">
    <template #header>
      <UDashboardNavbar title="Novo cliente" icon="i-lucide-user-plus">
        <template #leading>
          <UButton
            to="/clientes"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Voltar para clientes"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <form class="mx-auto w-full max-w-3xl space-y-6" @submit.prevent="salvar">
        <!-- Identificação + enriquecimento -->
        <UCard>
          <template #header>
            <div>
              <h2 class="font-semibold">
                Identificação
              </h2>
              <p class="text-sm text-muted">
                Preencha o CNPJ e busque na Receita para trazer razão social, CNAE, praça e capital.
              </p>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex flex-wrap items-end gap-3">
              <UFormField label="CNPJ" name="cnpj" class="flex-1" :error="erroConsulta">
                <UInput
                  v-model="form.cnpj"
                  icon="i-lucide-id-card"
                  placeholder="00.000.000/0000-00"
                  class="w-full"
                />
              </UFormField>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-download"
                :loading="consultando"
                :disabled="!cnpjValido"
                @click="consultarReceita"
              >
                Buscar na Receita
              </UButton>
            </div>

            <UAlert
              v-if="enriquecido"
              color="success"
              variant="subtle"
              icon="i-lucide-check"
              title="Dados públicos preenchidos"
              description="Confira e ajuste o que for necessário antes de salvar."
            />

            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Razão social" name="razaoSocial" required>
                <UInput v-model="form.razaoSocial" class="w-full" />
              </UFormField>
              <UFormField label="Nome fantasia" name="nomeFantasia">
                <UInput v-model="form.nomeFantasia" class="w-full" />
              </UFormField>
              <UFormField label="CNAE" name="cnae" class="sm:col-span-2">
                <UInput v-model="form.cnae" placeholder="0115-6/00 — Cultivo de soja" class="w-full" />
              </UFormField>
              <UFormField label="Município" name="municipio" required>
                <UInput v-model="form.municipio" class="w-full" />
              </UFormField>
              <UFormField label="UF" name="uf" required>
                <UInput v-model="form.uf" maxlength="2" placeholder="MT" class="w-full" />
              </UFormField>
              <UFormField label="Data de abertura" name="dataAbertura">
                <UInput v-model="form.dataAbertura" type="date" class="w-full" />
              </UFormField>
              <UFormField label="Capital social" name="capitalSocial">
                <UInputNumber
                  v-model="form.capitalSocial"
                  :min="0"
                  :step="50000"
                  :format-options="{ style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>
        </UCard>

        <!-- Operação: o que a Receita não sabe e o analista precisa declarar -->
        <UCard>
          <template #header>
            <div>
              <h2 class="font-semibold">
                Operação
              </h2>
              <p class="text-sm text-muted">
                A cultura declarada define quais índices de clima e preço entram no score.
              </p>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Cultura predominante" name="cultura" required>
              <USelect v-model="form.culturaPredominante" :items="culturas" value-key="value" class="w-full" />
            </UFormField>

            <UFormField label="Garantia" name="garantia">
              <USelect v-model="form.tipoGarantia" :items="garantias" value-key="value" class="w-full" />
            </UFormField>

            <UFormField label="Saldo já em aberto" name="valorEmAberto" description="Zero para cliente novo sem faturamento.">
              <UInputNumber
                v-model="form.valorEmAberto"
                :min="0"
                :step="10000"
                :format-options="{ style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }"
                class="w-full"
              />
            </UFormField>

            <div class="flex flex-col justify-end gap-3 pb-1">
              <UCheckbox
                v-if="form.tipoGarantia !== 'nenhuma'"
                v-model="form.garantiaAtiva"
                label="Garantia ativa"
              />
              <UCheckbox
                v-model="form.barterAtivo"
                label="Opera em barter / troca"
                description="Exposição dupla: depende da safra existir e valer o suficiente."
              />
            </div>
          </div>
        </UCard>

        <!-- Imóvel rural (RF-28) -->
        <UCard>
          <template #header>
            <div>
              <h2 class="font-semibold">
                Imóvel rural (CAR/SICAR)
              </h2>
              <p class="text-sm text-muted">
                Área em produção e regularidade do cadastro ambiental (RF-28).
              </p>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Código do CAR" name="codigoCAR">
              <UInput v-model="form.codigoCAR" placeholder="MT-5107925-A1F3" class="w-full" />
            </UFormField>

            <UFormField label="Situação no SICAR" name="situacaoCAR">
              <USelect v-model="form.situacaoCAR" :items="situacoes" value-key="value" class="w-full" />
            </UFormField>

            <UFormField label="Área total (ha)" name="areaTotalHa" required>
              <UInputNumber v-model="form.areaTotalHa" :min="0" :step="10" class="w-full" />
            </UFormField>

            <UFormField label="Área em produção (ha)" name="areaPlantadaHa" required :error="erroArea">
              <UInputNumber v-model="form.areaPlantadaHa" :min="0" :step="10" class="w-full" />
            </UFormField>
          </div>
        </UCard>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">
            Ao salvar, o sistema calcula um score inicial a partir da exposição de safra da cultura
            declarada. Ele será recalculado quando houver histórico de pagamento.
          </p>
          <UButton type="submit" size="lg" :disabled="!podeSalvar" :loading="salvando" icon="i-lucide-check">
            Cadastrar e avaliar
          </UButton>
        </div>
      </form>
    </template>
  </UDashboardPanel>
</template>
