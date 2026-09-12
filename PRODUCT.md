# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two distinct audiences, no shared UI:

- **Portal Gestor (interno):** analistas comerciais/de crédito e diretoria financeira/comercial da Krill Tech, uma fornecedora de insumo agrícola que vende a prazo casado com o ciclo da safra. Job: decidir limite de crédito e condições de pagamento de insumo com base na exposição real da safra do cliente (não só no histórico financeiro). Papéis: Analista (consulta cliente, roda due diligence, vê score/red flags/relatório, registra decisão) e Gestor/Diretoria (visão agregada de portfólio por região/cultura, simulador de stress test).
- **Portal Contratante (externo):** o produtor rural/agroindústria cliente da Krill Tech, muitas vezes usuário não técnico. Job: entender a própria situação de crédito e agir proativamente antes do vencimento. Read-only por decisão de produto — sem canal de contestação de red flag.

## Product Purpose

Sistema de prevenção à inadimplência para fornecedores de insumo agrícola que vendem a prazo. A capacidade de pagamento do cliente depende do resultado de uma safra futura, não da saúde financeira atual dele — então o produto antecipa risco de receita futura (clima + preço de commodity) *antes* da colheita, quando ainda dá tempo de ajustar limite/condições, em vez de só descobrir o problema quando o cliente já atrasou ou entrou com pedido de recuperação judicial (RJ). Sucesso = decisão de crédito e alerta antecipados o bastante para o gestor agir dentro da janela útil, antes do vencimento da fatura.

## Positioning

Devs de score de crédito tradicionais avaliam saúde financeira passada do tomador. Este sistema modela a causa raiz específica do setor de insumo agrícola: o pagamento do produtor depende de uma safra que ele ainda vai colher e vender. Dois módulos de inovação computam isso a partir de dados públicos:

- **Índice de Risco Climático** — cruza a fase ONI (El Niño/La Niña, NOAA) com produtividade histórica por região/cultura (CONAB) e clima observado (INMET). Apresentado como proxy estatístico-histórico, nunca como previsão meteorológica.
- **Índice de Exposição a Preço de Commodity** — tendência de preço da cultura do cliente via CEPEA/ESALQ, cruzada com o calendário de plantio/colheita (ZARC).

Os dois juntos formam o "Índice de Risco de Receita da Safra" e ponderam o score ao lado dos fatores jurídicos/fiscais tradicionais — nenhum concorrente genérico de score de crédito faz essa combinação.

## Operating Context

- Venda de insumo a prazo casada com o ciclo de safra; pagamento às vezes via barter/CPR (Cédula de Produto Rural), entregando parte da colheita em vez de dinheiro.
- Conceitos jurídicos que viram regra de negócio: RJ (Lei 14.112/2020) → red flag crítica, rating cai para D; Stay Period de 180 dias suspende execução/protesto; inadimplência técnica (atraso/renegociação) é monitorada como sinal preventivo antes da inadimplência financeira.
- Garantias: alienação fiduciária reduz o impacto de uma RJ no score; penhor de safra herda o risco climático/de preço da própria safra penhorada; CPR física tem seu valor real ligado ao Índice de Commodity.
- Cliente com barter ativo carrega exposição dupla: precisa que a safra exista (clima) e que o produto entregue valha o suficiente (commodity).
- Fontes de dados públicas usadas como due diligence: DataJud (processos/RJ), BrasilAPI/Receita Federal (cadastral), SICAR/CAR (localização e cultura do imóvel), CEPEA/ESALQ (preço de commodity), NOAA ONI (fase El Niño/La Niña), CONAB (produtividade histórica), INMET (clima observado), ZARC (calendário agrícola).

## Capabilities and Constraints

- Score 0–1000 e rating A–D por cliente, com PD projetada em 6/12/24 meses; ver `types/firestore.ts` (`Cliente`, `RedFlag`, `HistoricoScore`, `Alerta`) para o shape já definido no código.
- Red flags categorizados: jurídico, fiscal, ambiental, técnico, climático, commodity — tipos hoje tipados como `rj | protesto | embargo_ambiental | inadimplencia_tecnica`, com severidade `baixa|media|alta|critica`.
- Relatório executivo em linguagem natural gerado via LLM (RF-04) a partir do score/red flags do cliente.
- Alertas em tempo real via listener do Firestore (< 2s), tanto para o gestor (novo processo, embargo, piora climática, queda de preço) quanto — em versão preventiva — para o próprio contratante.
- Decisão de produto: contestação de red flag pelo cliente está fora de escopo — a leitura do risco é prerrogativa exclusiva da Krill Tech; o Portal Contratante é informativo, não contraditório.
- Restrição de segurança única e não negociável: chaves de API (LLM, CEPEA, demais bases externas) nunca expostas no client — todo acesso externo passa por Cloud Function (proxy). Motivo: uma chave vazada no bundle JS pode ser raspada e abusada por terceiros, quebrando a demo por custo/abuso.
- Regras restritivas de Firestore, autenticação completa e trilha de auditoria são deliberadamente simplificadas/fora do MVP (trade-off consciente de prazo de hackathon, não descuido) — não expandir isso além do pedido.
- Dados sintéticos/plausíveis no MVP para fontes não integradas de fato no prazo: SICAR, ZARC, PGFN, TST. Monitoramento por satélite (NDVI) está fora do MVP, é item de roadmap.
- Deploy alvo: Firebase Hosting, operação dentro do free tier do Firebase para o volume de demonstração.
- Prazo do hackathon (entrega em ~15h a partir da escrita do plano) define prioridade: RF-01 a RF-06, RF-13/RF-14, RF-19 a RF-21, RF-24 a RF-27 são Must; ver `DEVELOPMENT_PLAN.md` Seção 10 para a ordem completa Must → Should → Could antes de decidir o que construir a seguir.

## Brand Commitments

Sem nome de produto/marca definido ainda para o sistema em si (distinto do nome do cliente "Krill Tech") — decisão em aberto.

## Evidence on Hand

Nenhum dado real de carteira ou conteúdo de demonstração no repositório ainda. Todas as integrações de dados públicos (DataJud, SICAR, CEPEA/ESALQ, NOAA ONI, CONAB, INMET, ZARC) e o conteúdo de clientes/red flags serão sintéticos/mockados para o MVP do hackathon — não fabricar testemunhos, cases ou números reais de carteira além disso.

## Product Principles

1. Antecipação, não descoberta tardia — o produto só cumpre sua tese se o alerta chega antes do vencimento da fatura, não depois do atraso.
2. O score reflete causa raiz específica do setor (a safra vai existir? vai valer a pena?), não um score de crédito genérico reaproveitado.
3. Dois portais, dois contratos de confiança: o Portal Gestor decide e audita: o Portal Contratante informa, nunca contesta.
4. Explicabilidade é parte do produto, não um extra — o gestor e o produtor precisam entender por que o score é o que é (peso climático, peso de commodity, red flags), sob risco do score parecer caixa-preta.
5. Rigor de escopo de hackathon: segurança formal e integrações completas são conscientemente adiadas; a única linha dura é nunca expor chave de API no client.

## Accessibility & Inclusion

Portal Contratante precisa ser utilizável por usuário não técnico (produtor rural) — linguagem simples, sem jargão financeiro/jurídico não explicado.
