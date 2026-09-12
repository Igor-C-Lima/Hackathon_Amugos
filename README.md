# SafraScore

Projeto desenvolvido para o **Hackathon PMI-DF 2026**, em parceria com a **Krill Tech**, fornecedora de insumos agrícolas que vende a prazo casado com o ciclo da safra.

## 💡 Sobre o projeto


Fornecedores de insumo agrícola concedem crédito a produtores rurais com base, majoritariamente, no histórico financeiro do cliente — mas a capacidade real de pagamento depende do resultado de uma safra que **ainda vai acontecer**. Quando o clima frustra a produção ou o preço da commodity despenca, o problema só aparece tarde demais: quando a fatura já está vencida.

O **SafraScore** antecipa esse risco *antes* da colheita, cruzando dados públicos para responder duas perguntas centrais:

- **Risco climático** — "a safra vai existir?" Cruza o histórico do índice ONI (El Niño/La Niña, NOAA) com produtividade histórica por região/cultura (CONAB) e clima observado (INMET).
- **Risco de preço de commodity** — "vai valer a pena?" Cruza a tendência de preço da cultura do cliente (CEPEA/ESALQ) com o calendário de plantio/colheita (ZARC).

Esses dois fatores se combinam com sinais jurídicos e fiscais tradicionais (recuperação judicial, protesto, embargo ambiental, inadimplência técnica) em um **score de 0 a 1000** e um **rating de A a F**, permitindo que a Krill Tech ajuste limites e condições de crédito com antecedência — e não apenas reaja a um atraso já consumado.

O sistema é dividido em dois portais:

- **Portal Gestor** (interno) — usado por analistas de crédito, equipe de cobrança e diretoria. Dividido em duas frentes visualmente distintas: **Crédito** (decidir quem recebe limite — Clientes, Ficha, Portfólio) e **Recuperação** (agir sobre o que já está em atraso — esteira de priorização de cobrança, ranqueada por risco × saldo em aberto). Uma seção de Alertas alimenta ambas as frentes.
- **Portal Contratante** (externo) — usado pelo próprio produtor rural/cliente da Krill Tech, em modo somente leitura: ele visualiza seu próprio score e pendências, mas não tem canal para contestar um red flag — a leitura do risco é prerrogativa exclusiva da Krill Tech.

> ⚠️ Este é um projeto de hackathon com prazo curto de entrega. Dados de fontes como SICAR, ZARC, PGFN e TST são representados de forma sintética no MVP, e regras de segurança do Firestore, autenticação completa e trilha de auditoria estão deliberadamente fora do escopo inicial. A única restrição não negociável é que nenhuma chave de API (LLM, CEPEA, etc.) é exposta no client — todas as chamadas externas passam por Cloud Functions.

## 🚀 Tecnologias utilizadas

- [Nuxt 4](https://nuxt.com/) (Vue 3 + TypeScript)
- [Nuxt UI 4](https://ui.nuxt.com/) + [Tailwind CSS 4](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) / [VueFire](https://vuefire.vuejs.org/) — Firestore e Auth
- [Pinia](https://pinia.vuejs.org/) — gerenciamento de estado
- [Zod](https://zod.dev/) — validação de schemas
- [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/) — visualização de score/rating ao longo do tempo
- [Tiptap](https://tiptap.dev/) — editor de texto rico
- [Day.js](https://day.js.org/) — manipulação de datas
- [VueUse](https://vueuse.org/) — utilitários de composição
- [ESLint](https://eslint.org/) (`@nuxt/eslint`)
- [pnpm](https://pnpm.io/) — gerenciador de pacotes

## 🔌 APIs utilizadas

### APIs reais

- **[Receita Federal](https://www.gov.br/receitafederal/)** — validação de CNPJ e dados cadastrais da empresa cliente.
- **[AgroAPI (Embrapa)](https://api.cnptia.embrapa.br/)** — dados agrícolas (a "mágica" do projeto: cruza clima, solo e produtividade por região/cultura).
- **[BrasilAPI](https://brasilapi.com.br/)** — dados públicos brasileiros complementares (CEP, feriados, etc.).
- **Municípios (IBGE)** — dados de localização/município para vincular o cliente à sua região agrícola.
- **ZARC** — Zoneamento Agrícola de Risco Climático (MAPA), usado para o calendário de plantio/colheita por cultura e região.
- **[watsonx (IBM)](https://www.ibm.com/watsonx)** — agente de IA usado para gerar o relatório/análise (`relatorioLLM`) a partir dos dados cruzados do cliente.

### Dados mockados (sintéticos no MVP)

- **DataJud (CNJ)** — processos judiciais (recuperação judicial, protesto).
- **SICAR** — Cadastro Ambiental Rural (embargo ambiental).
- **ONI (NOAA)** — índice El Niño/La Niña, histórico climático.
- **CONAB** — produtividade histórica por região/cultura.
- **INMET** — clima observado.
- **CEPEA/ESALQ** — preço de commodities agrícolas.

> As chaves de API (LLM, CEPEA, etc.) nunca são expostas no client — todas as chamadas a APIs externas passam por Cloud Functions.

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão compatível com Nuxt 4)
- [pnpm](https://pnpm.io/installation)
- Um projeto no [Firebase](https://console.firebase.google.com/) configurado (Firestore + Auth)

## 🔧 Como rodar o projeto

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd Hackathon_Amugos
   ```

2. **Instale as dependências**

   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**

   Copie o arquivo de exemplo e preencha com suas credenciais:

   ```bash
   cp .env.example .env
   ```

   Preencha no `.env`:

   - Credenciais do Firebase (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`, `FIREBASE_MEASUREMENT_ID`)
   - Credenciais do watsonx Orchestrate (`WATSONX_API_KEY`, `WATSONX_SERVICE_URL`, `WATSONX_AGENT_ID`)
   - Credenciais da Embrapa AgroAPI (`AGROAPI_CONSUMER_KEY`, `AGROAPI_CONSUMER_SECRET`)

4. **Rode o servidor de desenvolvimento**

   ```bash
   pnpm dev
   ```

   O projeto ficará disponível em [http://localhost:3000](http://localhost:3000).

### Outros comandos úteis

```bash
pnpm build      # build de produção
pnpm generate   # geração estática
pnpm preview    # preview do build de produção localmente
pnpm lint       # roda o ESLint
```

## 📚 Documentação do projeto

- [`PRODUCT.md`](./PRODUCT.md) — visão de produto resumida
- [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) — plano de desenvolvimento completo e racional de domínio
- [`PAGES.md`](./PAGES.md) — detalhamento das páginas do sistema e numeração atual dos requisitos funcionais (RF)
- [`CLAUDE.md`](./CLAUDE.md) — guia de arquitetura e convenções do repositório

## 👥 Autores e colaboradores

Projeto desenvolvido em equipe para o Hackathon PMI-DF 2026:

- **Amanda de Oliveira Weiler** ([@interludeebloom](https://github.com/interludeebloom))
- **Élvis Corrêa Miranda Júnior** ([@neatzzy](https://github.com/neatzzy))
- **Igor Lima** ([@Igor-C-Lima](https://github.com/Igor-C-Lima))
- **Gustavo Alves Dias** ([@gusfring41](https://github.com/gusfring41))
