/**
 * Estado de acessibilidade do portal: alto contraste e escala de texto.
 * Persistido no navegador (localStorage) para valer em qualquer página, dos dois portais,
 * sem depender de login — é preferência de exibição, não dado de negócio.
 */
const ESCALA_PADRAO = 100
const ESCALA_MAX = 150
const ESCALA_PASSO = 10

export function useAcessibilidade() {
  const altoContraste = useLocalStorage('safrascore:alto-contraste', false)
  const escalaTexto = useLocalStorage('safrascore:escala-texto', ESCALA_PADRAO)

  const alternarContraste = () => {
    altoContraste.value = !altoContraste.value
  }

  const aumentarTexto = () => {
    escalaTexto.value = Math.min(ESCALA_MAX, escalaTexto.value + ESCALA_PASSO)
  }

  const diminuirTexto = () => {
    escalaTexto.value = Math.max(ESCALA_PADRAO, escalaTexto.value - ESCALA_PASSO)
  }

  const restaurarPadrao = () => {
    altoContraste.value = false
    escalaTexto.value = ESCALA_PADRAO
  }

  return {
    altoContraste,
    escalaTexto,
    alternarContraste,
    aumentarTexto,
    diminuirTexto,
    restaurarPadrao,
    ESCALA_PADRAO,
    ESCALA_MAX,
  }
}
