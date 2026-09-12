import type { MaybeRefOrGetter } from 'vue'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import type {
  Alerta,
  Cliente,
  ClienteDossie,
  HistoricoScore,
  InteracaoCobranca,
  NovoClienteForm,
} from '~~/types/firestore'
import type { ComId } from '~/utils/firestoreDatas'

/**
 * Acesso ao Firestore. Um documento por cliente em `clientes/{cnpj}` — climatico/commodity/
 * breakdown/imovel/janelaColheita/fimColheita/proximoVencimento embutidos nele (são um valor
 * fixo por cliente, sempre lidos junto; não ganham coleção própria). `historico` e `cobrancas`
 * são subcoleções — crescem com o tempo. `alertas` é coleção de topo, porque o Feed cruza
 * todos os clientes de uma vez (RF-06).
 *
 * `useDossie`/`useListaClientes`/`useAlertasFeed` devolvem os mesmos formatos que
 * app/utils/mock.ts sempre devolveu (`ClienteDossie`, `Cliente[]`, `Alerta[]`) — as páginas
 * não precisam saber que a fonte trocou.
 */

/** Os campos de ClienteDossie que vivem embutidos no documento do cliente, não em subcoleção. */
type CamposEmbutidos = Pick<
  ClienteDossie,
  'climatico' | 'commodity' | 'breakdown' | 'imovel' | 'janelaColheita' | 'fimColheita' | 'proximoVencimento'
>
type ClienteDoc = ComId<Cliente & CamposEmbutidos>

/** Firestore rejeita `undefined` em qualquer campo — campos opcionais viram ausentes, não `undefined`. */
function semUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

function refClientes() {
  const db = useFirestore()
  return collection(db, 'clientes').withConverter(converterComDatas<Cliente & CamposEmbutidos>())
}

function refCliente(cnpj: string) {
  const db = useFirestore()
  return doc(db, 'clientes', cnpj).withConverter(converterComDatas<Cliente & CamposEmbutidos>())
}

function refHistorico(cnpj: string) {
  const db = useFirestore()
  return query(
    collection(db, 'clientes', cnpj, 'historico').withConverter(converterComDatas<HistoricoScore>()),
    orderBy('data', 'asc'),
  )
}

function refCobrancas(cnpj: string) {
  const db = useFirestore()
  return query(
    collection(db, 'clientes', cnpj, 'cobrancas').withConverter(converterComDatas<InteracaoCobranca>()),
    orderBy('data', 'desc'),
  )
}

function refAlertas() {
  const db = useFirestore()
  return query(
    collection(db, 'alertas').withConverter(converterComDatas<Alerta>()),
    orderBy('criadoEm', 'desc'),
  )
}

/** Lista reativa de clientes — Painel de Clientes, Esteira de Cobrança, Portfólio. */
export function useListaClientes() {
  return useCollection(refClientes())
}

/**
 * Ficha completa (RF-01 a RF-05, RF-28, cobrança) — junta o doc do cliente + as duas subcoleções.
 * `cnpj` vazio (ex.: contratante ainda não identificado) vira `null` nas referências — vuefire
 * aceita ref nula pra dizer "nada pra buscar ainda", sem tentar montar um path Firestore inválido.
 */
export function useDossie(cnpj: MaybeRefOrGetter<string>) {
  const valido = computed(() => toValue(cnpj).length > 0)
  const clienteDoc = useDocument(computed(() => (valido.value ? refCliente(toValue(cnpj)) : null)))
  const historico = useCollection(computed(() => (valido.value ? refHistorico(toValue(cnpj)) : null)))
  const cobrancas = useCollection(computed(() => (valido.value ? refCobrancas(toValue(cnpj)) : null)))

  const dossie = computed<ClienteDossie | undefined>(() => {
    if (!clienteDoc.value) return undefined
    const {
      climatico,
      commodity,
      breakdown,
      imovel,
      janelaColheita,
      fimColheita,
      proximoVencimento,
      ...cliente
    } = clienteDoc.value
    return {
      cliente,
      climatico,
      commodity,
      breakdown,
      imovel,
      janelaColheita,
      fimColheita,
      proximoVencimento,
      historico: historico.data.value ?? [],
      cobrancas: cobrancas.data.value ?? [],
    }
  })

  return { dossie, pending: clienteDoc.pending }
}

/** Feed de Alertas (RF-06) — mais recente primeiro, já com `id` pra marcar como lido. */
export function useAlertasFeed() {
  return useCollection(refAlertas())
}

/** RF-13: identificação do contratante — só precisa saber se o CNPJ/CPF existe na carteira. */
export async function existeCliente(cnpj: string): Promise<boolean> {
  const snap = await getDoc(refCliente(cnpj))
  return snap.exists()
}

export async function marcarAlertaLido(id: string, lido: boolean) {
  const db = useFirestore()
  await updateDoc(doc(db, 'alertas', id), { lido })
}

/** RF-11: ajuste manual do limite — só os dois campos que a decisão altera. */
export async function registrarDecisaoCredito(cnpj: string, limite: number, condicoes?: string) {
  const db = useFirestore()
  await updateDoc(doc(db, 'clientes', cnpj), semUndefined({
    limiteCreditoRecomendado: limite,
    condicoesPagamentoRecomendadas: condicoes,
    atualizadoEm: new Date(),
  }))
}

/**
 * RF-01/RF-24: cadastra o cliente e já grava o primeiro ponto de histórico. Busca um cliente
 * existente da mesma cultura pra herdar os índices climático/commodity (mesmo proxy que
 * `montarNovoDossie` sempre usou) — só que agora é uma query no banco, não `Array.find` num
 * array em memória. `getDocs`/`setDoc`/`addDoc` direto do SDK, não os composables reativos
 * (`useCollection`/`useDocument`) — esta função roda num handler de clique, não durante o
 * setup do componente, e os composables reativos esperam o contexto de um componente ativo.
 */
export async function cadastrarClienteNoBanco(form: NovoClienteForm): Promise<ClienteDossie> {
  const db = useFirestore()

  const candidatos = await getDocs(
    query(refClientes(), where('culturaPredominante', '==', form.culturaPredominante)),
  )
  const referenciaDoc = candidatos.docs[0]?.data() as ClienteDoc | undefined
  const referencia: ClienteDossie | undefined = referenciaDoc
    ? {
        cliente: referenciaDoc,
        climatico: referenciaDoc.climatico,
        commodity: referenciaDoc.commodity,
        breakdown: referenciaDoc.breakdown,
        imovel: referenciaDoc.imovel,
        janelaColheita: referenciaDoc.janelaColheita,
        fimColheita: referenciaDoc.fimColheita,
        proximoVencimento: referenciaDoc.proximoVencimento,
        historico: [],
        cobrancas: [],
      }
    : undefined

  const dossie = montarNovoDossie(form, referencia)
  const { historico, cobrancas: _cobrancas, cliente, ...camposEmbutidos } = dossie

  const clienteRef = doc(db, 'clientes', form.cnpj)
  await setDoc(clienteRef, semUndefined({ ...cliente, ...camposEmbutidos }))
  await addDoc(collection(clienteRef, 'historico'), semUndefined(historico[0]))

  return dossie
}
