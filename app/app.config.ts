// Wiring do DESIGN.md ("The Field Ledger") no tema do Nuxt UI.
// ponytail: nesta versão (@nuxt/ui 4.11.1) esse `colors.primary` não está sendo mesclado
// em runtime — --ui-color-primary-* segue caindo no verde padrão do módulo mesmo com este
// arquivo presente (testado com restart limpo e .nuxt apagado). A fonte de verdade real hoje
// é a sobrescrita direta das variáveis --ui-color-primary-*/--ui-text-*/--ui-bg-*/--ui-border-*
// em app/assets/css/main.css. Mantido aqui como intenção documentada; investigar em um upgrade
// do módulo antes de assumir que só isto basta.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'field-green',
      neutral: 'slate',
    },
  },
})
