<script setup lang="ts">
/**
 * Widget flutuante de acessibilidade: alto contraste + escala de texto, arrastável pela tela
 * e com dica "Acessibilidade" ao passar o mouse. Global (montado em app.vue) para valer nos
 * dois portais e na landing.
 *
 * .client.vue: a posição inicial depende do tamanho da janela, que só existe no navegador —
 * mesma razão do LineChart.client.vue já existente no projeto.
 */
const {
  altoContraste,
  escalaTexto,
  alternarContraste,
  aumentarTexto,
  diminuirTexto,
  restaurarPadrao,
  ESCALA_PADRAO,
  ESCALA_MAX,
} = useAcessibilidade()

const aberto = ref(false)
const raiz = ref<HTMLElement | null>(null)
const alca = ref<HTMLElement | null>(null)

const TAMANHO_BOTAO = 56
const MARGEM = 24

const posicao = useLocalStorage('safrascore:posicao-widget', {
  x: MARGEM,
  y: window.innerHeight - TAMANHO_BOTAO - MARGEM,
})

// A posição salva pode vir de uma janela maior (outro monitor, outra resolução) — reencaixa.
posicao.value = {
  x: Math.min(Math.max(posicao.value.x, 0), window.innerWidth - TAMANHO_BOTAO),
  y: Math.min(Math.max(posicao.value.y, 0), window.innerHeight - TAMANHO_BOTAO),
}

// Diferencia clique (abre/fecha o painel) de arraste (só reposiciona) pela distância percorrida.
let inicio = { x: 0, y: 0 }
let arrastou = false

const { x, y, style, isDragging } = useDraggable(raiz, {
  handle: alca,
  initialValue: posicao.value,
  preventDefault: true,
  onStart: (pos) => {
    inicio = { ...pos }
    arrastou = false
  },
  // `pos` é a própria posição reativa (não uma cópia) — mutar aqui já contém o arraste
  // dentro da janela, sem precisar de containerElement (feito pra scroll, não pra viewport).
  onMove: (pos) => {
    if (Math.abs(pos.x - inicio.x) > 4 || Math.abs(pos.y - inicio.y) > 4)
      arrastou = true
    pos.x = Math.min(Math.max(pos.x, 0), window.innerWidth - TAMANHO_BOTAO)
    pos.y = Math.min(Math.max(pos.y, 0), window.innerHeight - TAMANHO_BOTAO)
  },
})

watch([x, y], ([nx, ny]) => {
  posicao.value = { x: nx, y: ny }
})

function aoClicarBotao() {
  if (arrastou) return
  aberto.value = !aberto.value
}

const { width: larguraJanela, height: alturaJanela } = useWindowSize()

// O painel abre para o lado com mais espaço, já que o botão pode estar em qualquer canto.
const abrirParaCima = computed(() => y.value + TAMANHO_BOTAO / 2 > alturaJanela.value / 2)
const abrirParaEsquerda = computed(() => x.value + TAMANHO_BOTAO / 2 > larguraJanela.value / 2)

onClickOutside(raiz, () => { aberto.value = false })
</script>

<template>
  <div ref="raiz" class="fixed z-50 print:hidden" :style="style">
    <UTooltip text="Acessibilidade" :disabled="aberto || isDragging">
      <button
        ref="alca"
        type="button"
        class="flex size-14 cursor-grab items-center justify-center rounded-full border-2 border-primary bg-default text-primary shadow-lg transition hover:scale-105 active:cursor-grabbing"
        aria-haspopup="dialog"
        :aria-expanded="aberto"
        aria-controls="painel-acessibilidade"
        aria-label="Abrir opções de acessibilidade (arrastável)"
        @click="aoClicarBotao"
      >
        <UIcon name="i-lucide-contrast" class="size-6" />
      </button>
    </UTooltip>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="aberto"
        id="painel-acessibilidade"
        role="dialog"
        aria-label="Opções de acessibilidade"
        class="absolute w-80 rounded-lg border border-default bg-default p-5 shadow-xl"
        :class="[
          abrirParaCima ? 'bottom-[calc(100%+0.75rem)]' : 'top-[calc(100%+0.75rem)]',
          abrirParaEsquerda ? 'right-0' : 'left-0',
        ]"
      >
        <div class="flex items-center justify-between border-b border-default pb-3">
          <p class="font-semibold text-highlighted">
            Acessibilidade
          </p>
          <button
            type="button"
            class="text-muted transition hover:text-highlighted"
            aria-label="Fechar painel de acessibilidade"
            @click="aberto = false"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <button
          type="button"
          class="mt-4 flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left font-medium transition"
          :class="altoContraste
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-default text-highlighted hover:border-accented'"
          :aria-pressed="altoContraste"
          @click="alternarContraste"
        >
          <UIcon name="i-lucide-contrast" class="size-5 shrink-0" />
          Alto contraste
        </button>

        <p class="mt-5 flex items-center gap-2 text-sm font-medium text-highlighted">
          <UIcon name="i-lucide-type" class="size-5" />
          Tamanho do texto
        </p>

        <div class="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-lg border border-default py-3 text-lg font-bold text-highlighted transition hover:border-accented disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="escalaTexto <= ESCALA_PADRAO"
            aria-label="Diminuir tamanho do texto"
            @click="diminuirTexto"
          >
            A-
          </button>
          <button
            type="button"
            class="rounded-lg border border-default py-3 text-lg font-bold text-highlighted transition hover:border-accented disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="escalaTexto >= ESCALA_MAX"
            aria-label="Aumentar tamanho do texto"
            @click="aumentarTexto"
          >
            A+
          </button>
        </div>

        <button
          type="button"
          class="mt-3 text-sm text-muted transition hover:text-highlighted hover:underline"
          @click="restaurarPadrao"
        >
          Padrão
        </button>
      </div>
    </Transition>
  </div>
</template>
