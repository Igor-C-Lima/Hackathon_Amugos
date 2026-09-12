<script setup lang="ts">
// Landing pública. Fora do design system do portal de propósito: paleta fixa, clara,
// independente do color-mode, para o fundo não mudar conforme a preferência do visitante.
useHead({
  title: 'SafraScore — o risco da safra, lido antes da colheita',
  meta: [{
    name: 'description',
    content: 'Prevenção à inadimplência no crédito de insumo agrícola. O SafraScore monitora clima e '
      + 'preço de commodity para antecipar se a safra do cliente vai pagar a fatura.',
  }],
})

/**
 * Grid de plantação: duas famílias de linhas de plantio cruzadas, cada uma correndo para
 * o seu lado do horizonte. Os dois pontos de fuga ficam fora da tela de propósito — dentro
 * dela a malha se lê como talhão, não como leque saindo de um ponto.
 */
const horizonte = 262
const fugaDireita = 2120
const fugaEsquerda = -680

const colunas = Array.from({ length: 13 }, (_, i) => -1300 + i * 330)

const grade = [
  ...colunas.map(x => ({ vp: fugaDireita, x })),
  ...colunas.map(x => ({ vp: fugaEsquerda, x: x + 1000 })),
].map(({ vp, x }) => ({ x1: vp, y1: horizonte, x2: x, y2: 880 }))

const sinais = [
  {
    titulo: 'A safra vai existir?',
    fonte: 'Índice ONI (NOAA) × produtividade histórica (CONAB) × clima observado (INMET)',
    texto: 'Sob El Niño forte, a soja no Mato Grosso rende historicamente 11% menos. Não é previsão '
      + 'meteorológica: é o que aconteceu nas safras anteriores sob a mesma fase oceânica.',
  },
  {
    titulo: 'Vai valer o suficiente?',
    fonte: 'Série de preços CEPEA/ESALQ × calendário de colheita (ZARC)',
    texto: 'Safra normal com preço em queda também quebra o pagamento. Cruzamos a tendência de preço '
      + 'da cultura do cliente com a janela em que ele vende — e com a data em que a fatura vence.',
  },
]

const etapas = [
  { n: '01', titulo: 'Coleta', texto: 'Dados cadastrais, jurídicos e fiscais das bases públicas.' },
  { n: '02', titulo: 'Índices', texto: 'Exposição climática e de preço da cultura e da praça do cliente.' },
  { n: '03', titulo: 'Score', texto: 'Nota de 0 a 1000 e rating, com o peso de cada fator explicitado.' },
  { n: '04', titulo: 'Alerta', texto: 'Aviso quando o risco piora — antes do vencimento, não depois.' },
]
</script>

<template>
  <div class="safrascore">
    <div class="trama">
      <svg
        class="talhao"
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <!-- Junto ao horizonte as linhas se acumulam; o degradê dissolve essa faixa. -->
          <linearGradient id="brumaHorizonte" gradientUnits="userSpaceOnUse" x1="0" :y1="horizonte" x2="0" y2="620">
            <stop offset="0" stop-color="#000" />
            <stop offset="0.35" stop-color="#666" />
            <stop offset="1" stop-color="#fff" />
          </linearGradient>
          <mask id="mascaraTalhao">
            <rect x="0" y="0" width="1440" height="820" fill="url(#brumaHorizonte)" />
          </mask>
        </defs>

        <g mask="url(#mascaraTalhao)">
          <line
            v-for="(linha, i) in grade"
            :key="i"
            :x1="linha.x1"
            :y1="linha.y1"
            :x2="linha.x2"
            :y2="linha.y2"
          />
        </g>
      </svg>

      <header class="cabecalho">
        <div class="faixa">
          <NuxtLink to="/" class="marca">
            <span class="semente" aria-hidden="true" />
            SafraScore
          </NuxtLink>

          <nav class="navegacao">
            <NuxtLink to="/contratante" class="link">
              Sou contratante
            </NuxtLink>
            <NuxtLink to="/entrar" class="botao botao-solido">
              Entrar no portal
            </NuxtLink>
          </nav>
        </div>
      </header>

      <main class="hero">
        <p class="sobrancelha">
          Prevenção à inadimplência no crédito de insumo
        </p>

        <h1 class="titulo">
          O risco da safra, lido antes da colheita.
        </h1>

        <p class="chamada">
          O pagamento do fornecedor de insumo não depende da saúde financeira do produtor — depende da
          safra que ele ainda vai colher e vender. O SafraScore monitora os dois sinais que decidem
          isso, clima e preço da commodity, e transforma em score, red flag e recomendação de limite
          antes do vencimento.
        </p>

        <div class="acoes">
          <NuxtLink to="/entrar" class="botao botao-solido">
            Portal do analista
          </NuxtLink>
          <NuxtLink to="/contratante" class="botao botao-vazado">
            Portal do contratante
          </NuxtLink>
        </div>
      </main>
    </div>

    <section class="secao">
      <div class="limite">
        <p class="sobrancelha">
          Dois sinais
        </p>
        <h2 class="titulo-secao">
          O que decide se o cliente paga não está no balanço dele.
        </h2>

        <div class="sinais">
          <article v-for="sinal in sinais" :key="sinal.titulo" class="sinal">
            <h3>{{ sinal.titulo }}</h3>
            <p class="fonte">
              {{ sinal.fonte }}
            </p>
            <p>{{ sinal.texto }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="secao secao-alt">
      <div class="limite">
        <p class="sobrancelha">
          Como funciona
        </p>
        <h2 class="titulo-secao">
          Da base pública ao alerta, antes da fatura vencer.
        </h2>

        <ol class="etapas">
          <li v-for="etapa in etapas" :key="etapa.n">
            <span class="numero">{{ etapa.n }}</span>
            <h3>{{ etapa.titulo }}</h3>
            <p>{{ etapa.texto }}</p>
          </li>
        </ol>
      </div>
    </section>

    <footer class="rodape">
      <div class="limite rodape-conteudo">
        <div>
          <p class="marca marca-rodape">
            <span class="semente" aria-hidden="true" />
            SafraScore
          </p>
          <p class="assinatura">
            Sistema inteligente de prevenção à inadimplência · Krill Tech · Hackathon PMI-DF 2026
          </p>
        </div>
        <NuxtLink to="/entrar" class="botao botao-solido">
          Entrar no portal
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.safrascore {
  --creme: #f5f3ea;
  --creme-fundo: #efece1;
  --tinta: #1b2a1a;
  --tinta-suave: #3c4a39;
  --verde: #2d6a3f;
  --verde-escuro: #234f30;
  --borda: rgba(27, 42, 26, 0.14);

  min-height: 100vh;
  background: var(--creme);
  color: var(--tinta);
}

/* Trama de pontos: o grão de fundo do hero. */
.trama {
  position: relative;
  overflow: hidden;
  background-image: radial-gradient(rgba(27, 42, 26, 0.13) 1px, transparent 1px);
  background-size: 7px 7px;
}

.talhao {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.talhao line {
  stroke: #7ba277;
  stroke-width: 1.3;
  opacity: 0.32;
}

.cabecalho {
  position: relative;
  border-bottom: 1px solid var(--borda);
  background: var(--creme);
}

.faixa,
.limite {
  margin-inline: auto;
  width: 100%;
  max-width: 78rem;
  padding-inline: 1.5rem;
}

.faixa {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.9rem;
}

.marca {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--tinta);
}

.semente {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #4a9354 0%, #2d6a3f 55%, #5b4326 100%);
}

.navegacao {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.link {
  font-weight: 600;
  color: var(--verde);
}

.link:hover {
  color: var(--verde-escuro);
}

.botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 1.4rem;
  border-radius: 3px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.botao-solido {
  background: var(--verde);
  color: #fff;
}

.botao-solido:hover {
  background: var(--verde-escuro);
}

.botao-vazado {
  border: 1px solid var(--borda);
  color: var(--tinta);
}

.botao-vazado:hover {
  border-color: var(--tinta);
}

.hero {
  position: relative;
  margin-inline: auto;
  width: 100%;
  max-width: 78rem;
  padding: 7rem 1.5rem 8rem;
}

.sobrancelha {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--verde);
}

.titulo {
  margin-top: 1.6rem;
  max-width: 15ch;
  font-size: clamp(2.75rem, 7.5vw, 5.25rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.chamada {
  margin-top: 2rem;
  max-width: 42rem;
  font-size: clamp(1.05rem, 1.5vw, 1.2rem);
  line-height: 1.75;
  color: var(--tinta-suave);
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.75rem;
}

.secao {
  border-top: 1px solid var(--borda);
  padding-block: 5.5rem;
}

.secao-alt {
  background: var(--creme-fundo);
}

.titulo-secao {
  margin-top: 1rem;
  max-width: 24ch;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.sinais {
  display: grid;
  gap: 3rem;
  margin-top: 3.5rem;
}

.sinal h3 {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.sinal .fonte {
  margin-top: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--borda);
  font-size: 0.85rem;
  color: var(--verde);
}

.sinal p:last-child {
  margin-top: 1rem;
  line-height: 1.7;
  color: var(--tinta-suave);
}

.etapas {
  display: grid;
  gap: 2.5rem;
  margin-top: 3.5rem;
  list-style: none;
}

.etapas .numero {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--verde);
}

.etapas h3 {
  margin-top: 0.6rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--borda);
  font-size: 1.1rem;
  font-weight: 700;
}

.etapas p {
  margin-top: 0.45rem;
  line-height: 1.65;
  color: var(--tinta-suave);
}

.rodape {
  border-top: 1px solid var(--borda);
  padding-block: 3rem;
}

.rodape-conteudo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.marca-rodape {
  font-size: 1.05rem;
}

.assinatura {
  margin-top: 0.4rem;
  font-size: 0.85rem;
  color: var(--tinta-suave);
}

@media (min-width: 48rem) {
  .sinais {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4rem;
  }

  .etapas {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
  }
}
</style>
