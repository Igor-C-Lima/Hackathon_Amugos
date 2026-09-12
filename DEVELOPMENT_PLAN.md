# Análise de Requisitos — Sistema Inteligente de Prevenção à Inadimplência (Krill Tech)

### Hackathon PMI-DF 2026 · Documento de apoio ao Project Canvas e ao Pitch

---

## 1. Panorama: da dor ao Canvas

### 1.1 A dor, precisamente

A Krill Tech não é uma financeira — ela é uma fornecedora de insumo agrícola (biofertilizante/nanotecnologia) que vende para produtores rurais e agroindústrias. Como é praxe no setor de insumos, essa venda é feita **a prazo, casada com o ciclo da safra**: o produtor recebe o insumo no plantio e paga depois de colher e comercializar sua produção — às vezes até em barter/CPR, entregando parte da colheita em vez de dinheiro (mecanismo descrito no glossário do edital, Seção 4).

Isso é o ponto-chave que muda tudo: **a capacidade de pagamento do cliente da Krill Tech não depende da saúde financeira dele em si — depende do resultado da safra que ele ainda vai colher e vender.** A Krill Tech, portanto, carrega um risco que não controla e que se origina em dois fatores fora do seu negócio:

1. **Risco climático** — se a safra quebra (seca, geada, excesso de chuva, frequentemente associado a fases de El Niño/La Niña), o produtor simplesmente não tem o que colher para vender ou entregar em barter.
2. **Risco de preço de commodity** — mesmo com safra normal, se o preço da commodity que o produtor vende (soja, milho, algodão etc.) despenca no momento da colheita, a receita dele não cobre o que deve à Krill Tech e aos demais credores.

Qualquer um dos dois — ou a combinação dos dois — reduz o caixa do produtor no momento exato em que ele precisaria pagar o fornecedor de insumo. É aí que nasce a inadimplência: primeiro técnica (o produtor atrasa, renegocia, aumenta endividamento), depois financeira, e em casos mais graves, RJ — hoje facilitada para produtor rural pessoa física pela Lei nº 14.112/2020.

### 1.2 Por que a Krill Tech sofre mais que um banco nesse cenário

Um banco tradicionalmente exige garantias robustas (alienação fiduciária) e tem times jurídicos e de cobrança dedicados. A Krill Tech, como fornecedora de insumo, muitas vezes vende com garantia mais fraca (penhor da safra, ou às vezes nem isso) — então, quando o cliente entra em RJ, o crédito da Krill Tech tende a entrar no plano com deságio severo (Seção 2 do edital) e ainda fica sujeito ao Stay Period de 180 dias, período em que a empresa fica legalmente impedida de agir. Some a isso o efeito cascata da cadeia produtiva (Seção 3): se o produtor não paga a Krill Tech, o problema se propaga para trás na cadeia de fornecedores de insumos e serviços tecnológicos.

### 1.3 Diagnóstico central

O problema não é falta de dados — é falta de **antecipação**. Os dois sinais que determinam se o cliente vai conseguir pagar (clima da região/safra e preço da commodity que ele produz) são públicos e monitoráveis *antes* da colheita. Hoje, a Krill Tech provavelmente só percebe o problema quando o cliente já atrasou o pagamento ou já entrou com pedido de RJ — tarde demais para renegociar prazo, ajustar limite de crédito da próxima safra ou acionar garantia a tempo.

### 1.4 Mapa Dor → Solução → Bloco do Canvas

| # | Bloco do Canvas (edital 7.1) | O que a dor exige | Como o sistema resolve |
| --- | --- | --- | --- |
| 1 | Problema & Diagnóstico | Pagamento do cliente depende do resultado de uma safra futura, não da saúde financeira atual dele | Motor de due diligence que cruza dados cadastrais/jurídicos com os dois fatores de receita do produtor: clima e preço de commodity |
| 2 | Público-Alvo/Beneficiários | Quem decide crédito de insumo e quem é avaliado | Portal Gestor (time comercial/crédito da Krill Tech) + Portal Contratante (produtor/agroindústria cliente) |
| 3 | Lógica de Funcionamento | Fluxo repetível que antecipa risco antes da colheita | Pipeline: coleta cadastral/jurídica → índice climático → índice de commodity/plantação → score consolidado → relatório |
| 4 | Score & Rating | Decisão de crédito de insumo hoje não pondera risco de safra futura | Score 0–1000 + rating A–D, com peso explícito para exposição climática e de preço |
| 5 | Matriz de Red Flags | Sinais de risco de receita futura dispersos (clima, preço, jurídico, fiscal) | Matriz unificada: jurídicos/fiscais/ambientais + os dois novos módulos (clima e commodity/plantação) |
| 6 | Recomendação de Decisão Operacional | Limite de crédito de insumo hoje ignora se a próxima safra é de alto risco | Motor ajusta limite/condições de pagamento conforme exposição projetada da safra |
| 7 | Monitoramento Contínuo (Early Warning) | Descoberta tardia — só quando o produtor já não pagou | Alerta automático quando piora o índice climático da região ou o preço da commodity do cliente despenca, *antes* do vencimento |
| 8 | Arquitetura de Negócios & Custos | Sustentar a solução com dados públicos e baixo custo | Serverless (Firebase) + APIs públicas gratuitas (clima, commodity, jurídico) |
| 9 | Premissas, Restrições e Riscos | Dependência de dados públicos e de qualidade de fonte | Seção 7 deste documento |
| 10 | Próximos Passos | Evolução pós-hackathon | Roadmap (Seção 8) |

Esse mapa é o argumento estrutural do pitch — e agora ele conta uma história mais específica e correta: a Krill Tech não está caçando "clientes ruins" de forma genérica, está antecipando se **a safra que vai gerar o pagamento** vem bem ou mal.

---

## 2. Personas e portais

### 2.1 Portal Gestor/Analista (uso interno — Krill Tech)

**Quem usa:** analistas comerciais/crédito e, num nível mais estratégico, diretoria financeira e comercial.

**Objetivo:** decidir limite de crédito de insumo e condições de pagamento com base na exposição real da safra do cliente — não apenas no histórico financeiro dele.

**Papéis de acesso:**

- **Analista** — consulta clientes, roda due diligence, vê score/red flags/relatório, registra decisão
- **Gestor/Diretoria** — visão agregada de portfólio por região/cultura, acessa o simulador de cenário (stress test climático + de preço)

### 2.2 Portal Contratante (uso externo — cliente da Krill Tech)

**Quem usa:** o produtor rural ou agroindústria que compra insumo a prazo da Krill Tech.

**Objetivo:** transparência sobre a própria situação de crédito e um canal de regularização proativa.

**O que o contratante pode fazer:**

- Ver seu próprio score/rating, com explicação dos fatores (inclusive climático e de preço da sua cultura)
- Ver pendências específicas (ex.: certidão vencida, embargo ambiental) com orientação de regularização
- Acompanhar status de solicitação de aumento de limite
- Receber alerta preventivo quando o índice climático ou de preço da sua região/cultura piorar — valor real para o próprio produtor, não só para a Krill Tech

Decisão de escopo: o cliente **não** tem canal para contestar um red flag — a leitura e a avaliação do risco permanecem uma prerrogativa exclusiva da Krill Tech. O portal do contratante é informativo, não contraditório.

---

## 3. Requisitos funcionais

### 3.1 Portal Gestor/Analista

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-01 | Buscar cliente por CNPJ/CPF e consultar dados cadastrais (QSA, CNAE, tempo de atividade) | Must |
| RF-02 | Exibir score (0–1000) e rating (A–D) do cliente | Must |
| RF-03 | Exibir matriz de red flags categorizada (jurídico, fiscal, ambiental, técnico, climático, commodity) | Must |
| RF-04 | Gerar relatório em linguagem natural (resumo executivo) via LLM | Must |
| RF-05 | Exibir recomendação de limite de crédito e condições de pagamento sugeridas | Must |
| RF-06 | Feed de alertas em tempo real (novo processo, embargo, piora climática, queda de preço de commodity) | Must |
| RF-07 | Gráfico de evolução do score/PD em 6/12/24 meses | Should |
| RF-08 | Explicabilidade do score (peso de cada fator na nota final, incluindo clima e commodity) | Should |
| RF-09 | Visão de portfólio agregada por região/cultura, com simulador de cenário (stress test climático + preço) | Should |
| RF-10 | Aprovar/ajustar manualmente a recomendação de crédito, com registro de decisão (auditoria) | Should |
| RF-11 | Exportar relatório do cliente em PDF | Could |
| RF-12 | Comparar cliente com benchmark regional (peers da mesma cultura/região) | Could |

### 3.2 Portal Contratante

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-13 | Login/identificação do contratante por CNPJ/CPF | Must |
| RF-14 | Visualizar próprio score/rating com explicação dos fatores | Must |
| RF-15 | Visualizar pendências específicas e orientação de regularização | Should |
| RF-16 | Acompanhar status de solicitação de aumento de limite | Could |
| RF-17 | Receber alerta preventivo de piora climática/preço na própria região/cultura | Could |

> Fora de escopo por decisão de produto: contestação de red flag pelo cliente. A matriz de risco é lida e ajustada apenas pelo time da Krill Tech (Portal Gestor).

### 3.3 Módulo de Risco Climático (previsor de fase El Niño/La Niña)

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-19 | Consultar o índice ONI (Oceanic Niño Index, NOAA) vigente e a projeção mais recente publicada para os próximos trimestres | Must |
| RF-20 | Calcular Índice de Risco Climático por região/cultura, cruzando histórico de fase ONI com produtividade histórica (CONAB) e clima observado (INMET) | Must |
| RF-21 | Aplicar o Índice de Risco Climático como fator de ponderação no score, proporcional à localização do imóvel (via CAR) e à cultura do cliente | Must |
| RF-22 | Exibir no relatório do cliente o racional do fator climático ("por que este cliente está mais exposto") | Should |
| RF-23 | Alertar automaticamente quando a fase ONI mudar de patamar (ex.: Neutro → El Niño moderado) para todos os clientes expostos | Could |

### 3.4 Módulo de Análise de Commodities e Plantações

Este módulo é o par direto do climático: enquanto um mede se **a safra vai existir**, o outro mede se **ela vai valer o suficiente** — juntos, respondem à pergunta central "esse cliente vai conseguir pagar?".

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-24 | Identificar a(s) cultura(s) predominante(s) do cliente (via CAR/cadastro declarado) | Must |
| RF-25 | Consultar preço histórico e atual das commodities relevantes (soja, milho, algodão, boi, café) via CEPEA/ESALQ | Must |
| RF-26 | Calcular Índice de Exposição a Preço de Commodity: variação recente e tendência do preço da(s) cultura(s) do cliente | Must |
| RF-27 | Aplicar esse índice como segundo fator de ponderação no score (em conjunto com o climático) | Must |
| RF-28 | Consultar área plantada e regularidade da propriedade via CAR/SICAR | Should |
| RF-29 | Cruzar calendário de plantio/colheita da cultura (ZARC) com o calendário de vencimento das faturas do cliente, sinalizando janelas de maior risco de iliquidez (antes da colheita) | Should |
| RF-30 | Exibir gráfico de preço histórico da commodity com a janela de safra do cliente destacada | Should |
| RF-31 | Simulador de cenário combinado: "se o preço da soja cair X% e a região entrar em El Niño forte, qual o impacto estimado no score/carteira?" | Could |
| RF-32 | Monitoramento de integridade da área plantada via índice de vegetação por satélite (NDVI) | Could (roadmap) |

---

## 4. Regras de negócio derivadas do glossário do edital

| Conceito do glossário | Regra de negócio no sistema |
| --- | --- |
| **Recuperação Judicial (RJ)** | Pedido de RJ identificado (via DataJud) → red flag crítica → rating cai automaticamente para D |
| **Stay Period** | Se RJ deferida, sistema sinaliza que execução/protesto está suspenso por 180 dias — orienta o próximo passo correto ao gestor |
| **Inadimplência Técnica vs. Financeira** | Sistema monitora índices contratuais como red flag preventiva, antes do atraso de pagamento em si |
| **CPR (Cédula de Produto Rural)** | Presença de CPR como garantia é fator mitigante — mas seu valor real depende diretamente do Índice de Exposição a Commodity (RF-26), já que CPR Física é liquidada em produto |
| **Barter/Operação de Troca** | Cliente com barter ativo tem exposição *dupla* explícita: precisa que a safra exista (módulo climático) **e** que o produto entregue valha o suficiente (módulo de commodity) |
| **Alienação Fiduciária vs. Penhor** | Alienação fiduciária reduz o impacto de uma RJ no score; penhor de safra herda o risco climático/de preço da própria safra penhorada |
| **Rating & Score (PD)** | Score 0–1000 → rating A–D, com PD em 6/12/24 meses; consolida risco cadastral/jurídico + climático + commodity |

---

## 5. Módulo de inovação I: Índice de Risco Climático (El Niño/La Niña)

Ressalva técnica importante para o pitch: **prever a ocorrência de El Niño/La Niña é modelagem climática oceano-atmosférica** (domínio de centros como NOAA e INPE/CPTEC), fora de escopo para um hackathon. O sistema não faz isso — ele faz algo mais estreito e defensável:

1. **Consome** o índice ONI, publicado pelo NOAA CPC, que classifica cada trimestre como El Niño, La Niña ou Neutro, com intensidade
2. **Cruza** historicamente essa fase com produtividade agrícola por região/cultura (CONAB) e clima observado (INMET)
3. **Deriva** um Índice de Risco Climático regional/por cultura ("regiões produtoras de soja no Centro-Oeste, sob El Niño forte, historicamente tiveram X% de queda de produtividade")
4. **Aplica** esse índice ao score do cliente, proporcional à sua localização (CAR) e cultura

Isso é apresentado como proxy estatístico-histórico, não previsão meteorológica.

## 6. Módulo de inovação II: Análise de Commodities e Plantações

Esse módulo responde à segunda metade da pergunta "o cliente vai pagar?": mesmo com safra normal, o preço pode não fechar a conta.

1. **Identifica** a cultura predominante do cliente (CAR/cadastro)
2. **Consulta** série histórica e preço atual da commodity via CEPEA/ESALQ (fonte pública, gratuita, referência de mercado no Brasil)
3. **Calcula** a variação/tendência recente do preço e classifica a exposição do cliente (ex.: queda >15% nos últimos 6 meses = exposição alta)
4. **Cruza** com o calendário de colheita (ZARC) para saber se a janela de venda do cliente coincide com um momento de preço desfavorável
5. **Aplica** esse índice como segundo fator de ponderação no score, ao lado do climático — os dois juntos formam o "Índice de Risco de Receita da Safra"

Monitoramento de área plantada por satélite (NDVI) fica como evolução de roadmap (RF-32) — tecnicamente possível (dados gratuitos via Sentinel/Embrapa), mas processamento de imagem de satélite é caro em tempo de desenvolvimento para o prazo do hackathon.

---

## 7. Requisitos não funcionais

Escopo de hackathon: segurança formal (regras restritivas de Firestore, autenticação completa, auditoria) fica deliberadamente fora do MVP — é uma escolha de velocidade de entrega, não descuido, e está registrada como tal no bloco de Premissas/Restrições do Canvas (Seção 8). Existe apenas **um ponto não-negociável**, que não é sobre segurança de dados e sim sobre não vazar uma credencial paga publicamente:

| Categoria | Requisito |
| --- | --- |
| Segurança (única obrigatória) | Chaves de API (LLM, CEPEA, bases externas) nunca expostas no client — só em Cloud Functions. Motivo: uma chave exposta no bundle JS pode ser raspada e usada por terceiros, gerando custo/abuso — isso quebraria a demo, não é uma questão burocrática |
| Firestore | Leitura e escrita liberadas para simplificar e acelerar a implementação da demo |
| Performance | Painel de monitoramento deve refletir mudança em tempo real (< 2s) via listener do Firestore |
| Disponibilidade | Deploy em Firebase Hosting, sem dependência de infraestrutura própria |
| Usabilidade | Portal Contratante utilizável por usuário não técnico (produtor rural), linguagem simples |
| Custo | Operação dentro do free tier do Firebase para o volume de demonstração |

---

## 8. Premissas, restrições e riscos (insumo para o bloco 9 do Canvas)

**Premissas:**

- Bases públicas (DataJud, BrasilAPI/Receita Federal, SICAR, CEPEA/ESALQ, NOAA ONI) estão acessíveis via API/download aberto durante o hackathon
- O cliente tem cultura predominante identificável via CAR ou cadastro declarado

**Restrições:**

- Prazo do hackathon não permite integrar todas as fontes da Seção 5 do edital — SICAR, ZARC, PGFN, TST serão representadas com dados sintéticos plausíveis no MVP
- Monitoramento por satélite (NDVI) não entra no MVP — fica no roadmap (Seção 9)
- Segurança formal (regras restritivas de Firestore, autenticação completa, auditoria) foi deliberadamente simplificada para acelerar a entrega — trade-off consciente de escopo de hackathon, não descuido, e não afeta a integridade da lógica de score apresentada
- Contestação de red flag pelo cliente foi excluída por decisão de produto: a leitura de risco é prerrogativa exclusiva da Krill Tech
- Não há exigência de implementação funcional (edital, Seção 6) — o sistema é diferencial, o Canvas precisa se sustentar mesmo sem demo completa

**Riscos e mitigação:**

- *Indisponibilidade de API pública durante a demo* → cache local dos dados consultados antes da apresentação
- *CORS/autenticação inesperada* → todo acesso externo passa por Cloud Function (proxy), nunca direto do client
- *Score parecer "caixa-preta" para a banca* → coberto pelo requisito de explicabilidade (RF-08)
- *Confundir "previsor de El Niño" com previsão meteorológica real* → discurso do pitch deixa explícito que é proxy histórico-estatístico, não modelo climático

---

## 9. Próximos passos (pós-hackathon, insumo para o bloco 10 do Canvas)

1. Integração real com SICAR, ZARC, PGFN, TST (hoje sintéticos no MVP)
2. Modelo de ML supervisionado treinado com histórico real de carteira da Krill Tech
3. Monitoramento de integridade de área plantada via satélite (NDVI)
4. Expansão do Índice de Commodity para futuros/derivativos (B3), não só preço à vista
5. Reforço de segurança: regras restritivas de Firestore e autenticação completa (simplificadas no MVP por prazo de hackathon)
6. Certificação de conformidade com LGPD para tratamento de dados cadastrais de terceiros

---

## 10. Priorização dado o prazo (entrega até 15h de amanhã)

1. **Must haves primeiro:** RF-01 a RF-06, RF-13/RF-14, RF-19 a RF-21, RF-24 a RF-27 — cobre 4 dos 10 blocos do Canvas com demonstração ao vivo (score, red flags, recomendação, alerta) **com os dois módulos de inovação (clima + commodity) já influenciando o score real**
2. **Should haves se sobrar tempo:** explicabilidade (RF-08), visão de portfólio (RF-09), calendário de safra x vencimento (RF-29), gráfico de preço com janela de safra (RF-30)
3. **Could haves viram roadmap:** RF-11, RF-12, RF-16, RF-17, RF-31, RF-32 — citados no Canvas como "Próximos Passos", não codificados

Isso garante que a demonstração ao vivo prova exatamente a tese central do pitch: o score não é genérico, ele reflete se a safra do cliente vai existir (clima) e se vai valer a pena (commodity) — que é a causa raiz real da inadimplência da Krill Tech.
