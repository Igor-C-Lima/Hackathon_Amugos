<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Cliente } from '~~/types/firestore'

// Página 2 — Painel de Clientes / Home (RF-01, RF-02, RF-03).
definePageMeta({ layout: 'gestor' })
useHead({ title: 'Clientes — Portal Gestor' })

const busca = ref('')
const todos = computed(listarClientes)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase().replace(/\D/g, '')
  const texto = busca.value.trim().toLowerCase()
  if (!texto) return todos.value
  return todos.value.filter(c =>
    c.razaoSocial.toLowerCase().includes(texto)
    || c.nomeFantasia?.toLowerCase().includes(texto)
    || (termo.length > 0 && c.cnpj.includes(termo)),
  )
})

const colunas: TableColumn<Cliente>[] = [
  { accessorKey: 'razaoSocial', header: 'Cliente' },
  { accessorKey: 'municipio', header: 'Praça' },
  { accessorKey: 'culturaPredominante', header: 'Cultura' },
  { accessorKey: 'scoreAtual', header: 'Score' },
  { accessorKey: 'ratingAtual', header: 'Rating' },
  { id: 'exposicao', header: 'Exposição de safra' },
  { accessorKey: 'redFlags', header: 'Red flags' },
  { accessorKey: 'limiteCreditoRecomendado', header: 'Limite sugerido' },
]

const dossiePor = (cnpj: string) => buscarDossie(cnpj)!
</script>

<template>
  <UDashboardPanel id="clientes">
    <template #header>
      <UDashboardNavbar title="Clientes" icon="i-lucide-users">
        <template #right>
          <UBadge variant="subtle" color="warning" icon="i-lucide-cloud-rain-wind">
            Fase ONI: {{ rotuloFaseONI[faseONIVigente] }}
          </UBadge>
          <UButton to="/clientes/novo" icon="i-lucide-user-plus" size="sm">
            Novo cliente
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <UInput
            v-model="busca"
            icon="i-lucide-search"
            placeholder="Buscar por CNPJ/CPF ou razão social"
            class="w-full max-w-sm"
          />
          <p class="text-sm text-muted">
            {{ filtrados.length }} de {{ todos.length }} clientes
          </p>
        </div>

        <UTable :data="filtrados" :columns="colunas" class="shrink-0">
          <template #razaoSocial-cell="{ row }">
            <ULink
              :to="`/clientes/${row.original.cnpj}`"
              class="font-medium text-highlighted hover:text-primary"
            >
              {{ row.original.nomeFantasia ?? row.original.razaoSocial }}
            </ULink>
            <p class="text-xs text-muted">
              {{ mascaraCnpj(row.original.cnpj) }}
            </p>
          </template>

          <template #municipio-cell="{ row }">
            {{ row.original.municipio }} / {{ row.original.uf }}
          </template>

          <template #culturaPredominante-cell="{ row }">
            <UBadge variant="subtle" color="neutral">
              {{ rotuloCultura[row.original.culturaPredominante] }}
            </UBadge>
          </template>

          <template #scoreAtual-cell="{ row }">
            <span class="font-mono tabular-nums">{{ row.original.scoreAtual }}</span>
          </template>

          <template #ratingAtual-cell="{ row }">
            <UBadge :color="corRating[row.original.ratingAtual]" variant="subtle">
              {{ row.original.ratingAtual }}
            </UBadge>
          </template>

          <template #exposicao-cell="{ row }">
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1" title="Índice de risco climático">
                <UIcon name="i-lucide-cloud-rain-wind" class="size-3.5 text-muted" />
                {{ dossiePor(row.original.cnpj).climatico.indiceRisco }}
              </span>
              <span class="flex items-center gap-1" title="Índice de exposição a preço de commodity">
                <UIcon name="i-lucide-trending-down" class="size-3.5 text-muted" />
                {{ dossiePor(row.original.cnpj).commodity.indiceExposicao }}
              </span>
            </div>
          </template>

          <template #redFlags-cell="{ row }">
            <div v-if="row.original.redFlags.length" class="flex gap-1">
              <UIcon
                v-for="(flag, i) in row.original.redFlags"
                :key="i"
                :name="iconeRedFlag[flag.tipo]"
                :class="[
                  'size-4',
                  flag.severidade === 'critica' ? 'text-error'
                  : flag.severidade === 'alta' ? 'text-warning' : 'text-muted',
                ]"
                :title="rotuloRedFlag[flag.tipo]"
              />
            </div>
            <span v-else class="text-xs text-muted">—</span>
          </template>

          <template #limiteCreditoRecomendado-cell="{ row }">
            <span class="font-mono text-sm tabular-nums">
              {{ brl(row.original.limiteCreditoRecomendado ?? 0) }}
            </span>
          </template>
        </UTable>
      </div>
    </template>
  </UDashboardPanel>
</template>
