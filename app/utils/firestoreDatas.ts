import type { FirestoreDataConverter } from 'firebase/firestore'

/**
 * O SDK do Firestore converte `Date` → `Timestamp` sozinho na escrita, mas não faz o
 * caminho de volta: um doc lido cru traz `Timestamp` (com `.toDate()`), não `Date` — e
 * todo o app (dataBR, ordenação por `.getTime()`, etc.) espera `Date`. Este converter
 * resolve isso uma vez, na leitura, em vez de cada composable/página fazer `.toDate()`
 * campo a campo.
 */
function paraDatas(valor: unknown): unknown {
  if (valor && typeof (valor as { toDate?: unknown }).toDate === 'function') {
    return (valor as { toDate: () => Date }).toDate()
  }
  if (Array.isArray(valor)) return valor.map(paraDatas)
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, paraDatas(v)]))
  }
  return valor
}

/** Documento lido do Firestore: os campos de T, mais o id do doc (útil pra update/delete). */
export type ComId<T> = T & { id: string }

/** `collection(db, 'x').withConverter(converterComDatas<T>())` — aplicar em toda leitura. */
export function converterComDatas<T>(): FirestoreDataConverter<ComId<T>> {
  return {
    toFirestore: data => data as Record<string, unknown>,
    fromFirestore: (snapshot, options) => ({
      ...(paraDatas(snapshot.data(options)) as T),
      id: snapshot.id,
    }),
  }
}
