# Páginas do Site — Sistema Inteligente de Prevenção à Inadimplência (Krill Tech)

### Separação por página, atualizada com o módulo de Priorização de Cobrança (RF-07)

---

## O que mudou nesta versão

O requisito novo (RF-07 — Relatório de Priorização de Cobrança, ranking por Risco × Valor em Aberto) e o novo papel de acesso (Analista de Cobrança) não cabem dentro da Ficha do Cliente — é uma ferramenta de **atuação em lote**, não de consulta individual. Por isso ganhou página própria. Isso também bate com o requisito não funcional que o próprio documento já registra: *"Telas divididas claramente entre 'Decisão de Crédito' e 'Esteira de Recuperação'"* — então a navegação do Portal Gestor passa a ter duas seções visuais distintas, não só páginas soltas.

---

## Portal Gestor/Analista (uso interno — Krill Tech)

### Seção "Crédito" (decisão de entrada)

**1. Login / Seleção de perfil**
Diferencia os três papéis definidos na Seção 2.1: Analista de Crédito, Analista de Cobrança, Diretoria. O perfil escolhido decide qual seção abre primeiro.

**2. Painel de Clientes (Home)**

- Busca por CNPJ/CPF (RF-01)
- Lista de clientes avaliados, com score/rating visível em cada linha (RF-02)

**3. Ficha do Cliente**
Página de consulta individual — decisão de crédito de um cliente por vez:

- Dados cadastrais (RF-01)
- Score (0–1000) e rating (A–D) (RF-02)
- Matriz de red flags — jurídico, ambiental, climático, commodity (RF-03)
- Relatório em linguagem natural via LLM (RF-04)
- Recomendação de limite de crédito (RF-05)
- Gráfico de evolução do score/PD em 6/12/24 meses (RF-08)
- Explicabilidade do score (RF-09)
- Racional do fator climático (RF-22) e gráfico de preço de commodity com janela de safra (RF-30)
- Calendário de safra x vencimento (RF-29)
- Aprovar/ajustar recomendação, com registro de decisão (RF-11)
- Exportar relatório em PDF (RF-12)

**4. Portfólio (Diretoria)**
Visão agregada por região/cultura + simulador de cenário combinado clima+preço (RF-10). Acesso restrito ao perfil Diretoria.

### Seção "Recuperação" (cliente que já tem crédito em aberto)

**5. Esteira de Priorização de Cobrança** — página nova, é a materialização do RF-07

- Ranking de clientes ordenado por **Risco (rating/PD atualizado) × Valor em Aberto**, não por rating isolado nem por dívida isolada
- Cada linha do ranking mostra: cliente, rating atual, valor em aberto, motivo da entrada no ranking (ex.: "piora climática detectada esta semana")
- Um clique na linha leva direto para a Ficha do Cliente correspondente
- É a tela de trabalho do Analista de Cobrança — pensada para ação em lote, não para leitura de um cliente por vez

**6. Feed de Alertas**
Lista cronológica de eventos: novo processo, embargo, piora climática, queda de preço, mudança de fase ONI (RF-06, RF-23). Alimenta tanto a Esteira de Priorização (Seção Recuperação) quanto a Ficha do Cliente (Seção Crédito) — por isso fica acessível das duas seções, não preso a uma só.

---

## Portal Contratante (uso externo — cliente da Krill Tech)

**7. Login / Identificação**
Identificação por CNPJ/CPF (RF-13).

**8. Minha Situação**
Página única do portal externo:

- Score/rating com explicação dos fatores (RF-14)
- Pendências específicas e orientação de regularização (RF-15)
- Status de solicitação de aumento de limite (RF-16)
- Alertas preventivos de piora climática/preço da própria região/cultura (RF-17)

---

## Onde entram os módulos de clima e commodity

Sem mudança em relação à versão anterior: RF-19 a RF-32 não são páginas — são lógica de bastidor que alimenta o score e o ranking de priorização, e aparecem dentro da Ficha do Cliente, do Feed de Alertas e da Esteira de Priorização.

---

## Resumo: 8 páginas ao todo

| # | Página | Seção/Portal | RFs principais |
| --- | --- | --- | --- |
| 1 | Login / Seleção de perfil | Gestor · Crédito | Acesso |
| 2 | Painel de Clientes | Gestor · Crédito | RF-01, RF-02 |
| 3 | Ficha do Cliente | Gestor · Crédito | RF-01 a RF-05, RF-08, RF-09, RF-11, RF-12, RF-22, RF-29, RF-30 |
| 4 | Portfólio | Gestor · Crédito (Diretoria) | RF-10 |
| 5 | Esteira de Priorização de Cobrança | Gestor · Recuperação | **RF-07** |
| 6 | Feed de Alertas | Gestor · compartilhada | RF-06, RF-23 |
| 7 | Login / Identificação | Contratante | RF-13 |
| 8 | Minha Situação | Contratante | RF-14 a RF-17 |

## Prioridade de construção dado o prazo
