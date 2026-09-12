import type { Directive } from 'vue'

/**
 * v-fade-scroll: o elemento some gradualmente conforme rola para fora da tela por cima.
 * Um único listener de scroll (com throttle por requestAnimationFrame) é compartilhado por
 * todos os elementos marcados, em vez de um listener por elemento.
 */
const elementos = new Set<HTMLElement>()
let quadroPendente = 0

function atualizarOpacidades() {
  quadroPendente = 0
  for (const el of elementos) {
    const rect = el.getBoundingClientRect()
    const zonaFade = Math.max(rect.height, 150)
    el.style.opacity = String(Math.min(1, Math.max(0, (rect.top + zonaFade) / zonaFade)))
  }
}

function aoRolar() {
  if (quadroPendente) return
  quadroPendente = requestAnimationFrame(atualizarOpacidades)
}

const fadeScroll: Directive<HTMLElement> = {
  mounted(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    elementos.add(el)
    if (elementos.size === 1) {
      window.addEventListener('scroll', aoRolar, { passive: true })
      window.addEventListener('resize', aoRolar)
    }
    aoRolar()
  },
  unmounted(el) {
    elementos.delete(el)
    el.style.opacity = ''
    if (elementos.size === 0) {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('fade-scroll', fadeScroll)
})
