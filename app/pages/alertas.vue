<script setup lang="ts">
import type { Severidade } from '~~/types/firestore'

// Página 6 — Feed de Alertas (RF-06, RF-23). Alimenta Crédito e Recuperação.
// No MVP final isto vira listener do Firestore (< 2s, plano §7); aqui a lista é local.
definePageMeta({ layout: 'gestor' })
useHead({ title: 'Alertas — Portal Gestor' })

const lista = ref(alertas.map(a => ({ ...a })))

const filtro = ref<Severidade | 'todas'>('todas')
const severidades = ['todas', 'critica', 'alta', 'media', 'baixa'] as const

const visiveis = computed(() =>
  [...lista.value]
    .filter(a => filtro.value === 'todas' || a.severidade === filtro.value)
    .sort((a, b) => Number(a.lido) - Number(b.lido) || b.criadoEm.getTime() - a.criadoEm.getTime()),
)

const naoLidos = computed(() => lista.value.filter(a => !a.lido).length)

const quando = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
</script>

<template>
  <UDashboardPanel id="alertas">
    <template #header>
      <UDashboardNavbar title="Alertas" icon="i-lucide-bell-ring">
        <template #right>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-check-check"
            :disabled="!naoLidos"
            @click="lista.forEach(a => a.lido = true)"
          >
            Marcar todos como lidos
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <UFieldGroup>
            <UButton
              v-for="s in severidades"
              :key="s"
              :color="filtro === s ? 'primary' : 'neutral'"
              :variant="filtro === s ? 'solid' : 'outline'"
              size="sm"
              @click="filtro = s"
            >
              {{ s }}
            </UButton>
          </UFieldGroup>
          <p class="text-sm text-muted">
            {{ naoLidos }} não lido(s) de {{ lista.length }}
          </p>
        </div>

        <div v-if="visiveis.length" class="space-y-3">
          <UCard
            v-for="alerta in visiveis"
            :key="`${alerta.clienteId}-${alerta.criadoEm.getTime()}`"
            :class="alerta.lido ? 'opacity-60' : ''"
          >
            <div class="flex items-start gap-4">
              <UIcon
                :name="iconeRedFlag[alerta.tipo]"
                :class="[
                  'mt-0.5 size-5 shrink-0',
                  alerta.severidade === 'critica' ? 'text-error'
                  : alerta.severidade === 'alta' ? 'text-warning' : 'text-muted',
                ]"
              />

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <ULink
                    :to="`/clientes/${alerta.clienteId}`"
                    class="font-medium text-highlighted hover:text-primary"
                  >
                    {{ alerta.clienteNome }}
                  </ULink>
                  <UBadge :color="corSeveridade[alerta.severidade]" variant="subtle" size="sm">
                    {{ alerta.severidade }}
                  </UBadge>
                  <UBadge color="neutral" variant="outline" size="sm">
                    {{ categoriaRedFlag[alerta.tipo] }}
                  </UBadge>
                  <span v-if="!alerta.lido" class="size-2 rounded-full bg-primary" aria-label="Não lido" />
                </div>
                <p class="mt-1 text-sm text-muted">
                  {{ alerta.descricao }}
                </p>
                <p class="mt-1 text-xs text-dimmed">
                  {{ quando(alerta.criadoEm) }}
                </p>
              </div>

              <UButton
                :icon="alerta.lido ? 'i-lucide-mail' : 'i-lucide-mail-open'"
                color="neutral"
                variant="ghost"
                size="sm"
                :aria-label="alerta.lido ? 'Marcar como não lido' : 'Marcar como lido'"
                @click="alerta.lido = !alerta.lido"
              />
            </div>
          </UCard>
        </div>

        <UEmpty
          v-else
          icon="i-lucide-bell-off"
          title="Nenhum alerta nesta severidade"
          description="Ajuste o filtro para ver os demais alertas da carteira."
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
