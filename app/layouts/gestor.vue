<script setup lang="ts">
const perfil = usePerfil()
const alertasFeed = useAlertasFeed()
const naoLidos = computed(() => (alertasFeed.value ?? []).filter(a => !a.lido).length)

// Duas seções distintas: "Crédito" decide a entrada, "Recuperação" atua sobre o que já está em aberto.
// Alertas alimenta as duas, por isso fica no grupo compartilhado (PAGES.md §Portal Gestor).
const links = computed(() => [
  [
    { label: 'Crédito', type: 'label' as const },
    { label: 'Clientes', icon: 'i-lucide-users', to: '/clientes' },
    // RF-10: portfólio e simulador são acesso restrito à Diretoria.
    ...(perfil.value === 'diretoria'
      ? [{ label: 'Portfólio', icon: 'i-lucide-chart-pie', to: '/portfolio' }]
      : []),
  ],
  // RF-07: a esteira é a tela de trabalho da Cobrança; a Diretoria acompanha. Crédito não atua aqui.
  ...(perfil.value === 'credito'
    ? []
    : [[
        { label: 'Recuperação', type: 'label' as const },
        { label: 'Esteira de cobrança', icon: 'i-lucide-list-ordered', to: '/cobranca' },
      ]]),
  [
    {
      label: 'Alertas',
      icon: 'i-lucide-bell-ring',
      to: '/alertas',
      badge: naoLidos.value || undefined,
    },
  ],
])
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable class="print:hidden">
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sprout" class="size-6 shrink-0 text-primary" />
          <div v-if="!collapsed" class="min-w-0">
            <p class="truncate text-sm font-semibold">
              SafraScore
            </p>
            <p class="truncate text-xs text-muted">
              Portal Gestor
            </p>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          orientation="vertical"
          :collapsed="collapsed"
          :items="links"
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex w-full items-center gap-2">
          <UUser
            :name="rotuloPerfil[perfil]"
            :description="collapsed ? undefined : 'Krill Tech'"
            :avatar="{ icon: 'i-lucide-user-round' }"
            size="sm"
            class="min-w-0 flex-1"
          />
          <UButton
            to="/"
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="'Sair'"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
