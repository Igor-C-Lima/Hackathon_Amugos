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
      <GridTalhao />

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
        <div class="hero-texto">
          <h1 v-fade-scroll class="titulo entrada" style="--atraso: 0s">
            O risco da safra, lido antes da colheita.
          </h1>

          <p v-fade-scroll class="chamada entrada" style="--atraso: 0.1s">
            O pagamento do fornecedor de insumo não depende da saúde financeira do produtor — depende da
            safra que ele ainda vai colher e vender. O SafraScore monitora os dois sinais que decidem
            isso, clima e preço da commodity, e transforma em score, red flag e recomendação de limite
            antes do vencimento.
          </p>

          <div v-fade-scroll class="acoes entrada" style="--atraso: 0.2s">
            <NuxtLink to="/entrar" class="botao botao-solido">
              Portal do analista
            </NuxtLink>
            <NuxtLink to="/contratante" class="botao botao-vazado">
              Portal do contratante
            </NuxtLink>
          </div>
        </div>

        <!-- Decorativa: o texto já diz tudo o que a foto mostra. Fundo só existe a partir do
             breakpoint em que a coluna aparece, então o mobile nunca baixa esse arquivo. -->
        <div v-fade-scroll class="hero-foto entrada" style="--atraso: 0.3s" aria-hidden="true" />
      </main>
    </div>

    <section class="secao">
      <div class="limite">
        <h2 v-fade-scroll class="titulo-secao">
          O que decide se o cliente paga não está no balanço dele.
        </h2>

        <div class="sinais">
          <article v-for="sinal in sinais" :key="sinal.titulo" v-fade-scroll class="sinal">
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
        <h2 v-fade-scroll class="titulo-secao">
          Da base pública ao alerta, antes da fatura vencer.
        </h2>

        <ol class="etapas">
          <li v-for="etapa in etapas" :key="etapa.n" v-fade-scroll>
            <span class="numero">{{ etapa.n }}</span>
            <h3>{{ etapa.titulo }}</h3>
            <p>{{ etapa.texto }}</p>
          </li>
        </ol>
      </div>
    </section>

    <footer class="rodape">
      <div v-fade-scroll class="limite rodape-conteudo">
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
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
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.botao:focus-visible,
.link:focus-visible,
.marca:focus-visible {
  outline: 2px solid var(--verde);
  outline-offset: 3px;
  border-radius: 3px;
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
  display: grid;
  gap: 3rem;
  margin-inline: auto;
  width: 100%;
  max-width: 78rem;
  padding: 7rem 1.5rem 8rem;
}

.hero-texto {
  min-width: 0;
}

.hero-foto {
  display: none;
}

.titulo {
  max-width: 15ch;
  font-size: clamp(2.75rem, 7.5vw, 5.25rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.03em;
  text-wrap: balance;
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
  max-width: 24ch;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
  text-wrap: balance;
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

/* A coluna de foto só existe a partir daqui — abaixo disso o navegador nunca a baixa. */
@media (min-width: 64rem) {
  .hero {
    grid-template-columns: minmax(0, 1fr) 22rem;
    align-items: center;
  }

  .hero-foto {
    display: block;
    aspect-ratio: 3 / 4;
    border: 1px solid var(--borda);
    background: center / cover no-repeat url('/images/hero-lavoura.jpg');
  }
}

/* Abaixo de ~416px o link secundário não cabe ao lado do botão sem quebrar a palavra
   dentro dele — some daqui; a mesma rota já está no par de botões logo abaixo do hero. */
@media (max-width: 26rem) {
  .navegacao .link {
    display: none;
  }
}

/* Único momento de movimento autoral da página: o hero assenta ao carregar. */
.entrada {
  animation: assentar 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--atraso, 0s);
}

@keyframes assentar {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .entrada {
    animation: none;
  }
}

.safrascore ::selection {
  background: var(--verde);
  color: #fff;
}
</style>
