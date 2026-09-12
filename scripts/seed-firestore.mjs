#!/usr/bin/env node
// Popula o Firestore com a carteira sintética do MVP (DEVELOPMENT_PLAN.md §8).
// Roda fora do Nuxt (SDK client comum + `--experimental-strip-types`, sem tsx/ts-node) —
// os utils que ele importa (mock.ts/dominio.ts/scoring.ts) só usam `import type` da
// Nuxt, que o strip-types apaga em tempo de execução; nada de alias `~~` sobra pra resolver.
//
// Uso:
//   node --env-file=.env --experimental-strip-types scripts/seed-firestore.mjs
//   node --env-file=.env --experimental-strip-types scripts/seed-firestore.mjs --force   (recria do zero)

import { initializeApp } from 'firebase/app'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore'
import { alertas, carteira } from '../app/utils/mock.ts'

const forcar = process.argv.includes('--force')

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
})
const db = getFirestore(app)

async function apagarColecao(ref) {
  const snap = await getDocs(ref)
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  return snap.size
}

async function apagarSubcolecoes(cnpj) {
  const raiz = doc(db, 'clientes', cnpj)
  const historicoN = await apagarColecao(collection(raiz, 'historico'))
  const cobrancasN = await apagarColecao(collection(raiz, 'cobrancas'))
  return historicoN + cobrancasN
}

async function main() {
  const existentes = await getDocs(collection(db, 'clientes'))

  if (!existentes.empty && !forcar) {
    console.error(
      `A coleção "clientes" já tem ${existentes.size} documento(s). `
      + 'Rode de novo com --force pra apagar tudo (clientes + subcoleções + alertas) e semear do zero.',
    )
    process.exitCode = 1
    return
  }

  if (!existentes.empty && forcar) {
    console.log(`Apagando ${existentes.size} cliente(s) existente(s) e suas subcoleções...`)
    for (const d of existentes.docs) {
      await apagarSubcolecoes(d.id)
      await deleteDoc(d.ref)
    }
    const alertasApagados = await apagarColecao(collection(db, 'alertas'))
    console.log(`  ${alertasApagados} alerta(s) apagado(s).`)
  }

  for (const dossie of carteira) {
    const { historico, cobrancas, cliente, ...camposEmbutidos } = dossie
    const cnpj = cliente.cnpj

    await setDoc(doc(db, 'clientes', cnpj), { ...cliente, ...camposEmbutidos })
    for (const ponto of historico) {
      await setDoc(doc(collection(db, 'clientes', cnpj, 'historico')), ponto)
    }
    for (const cobranca of cobrancas) {
      await setDoc(doc(collection(db, 'clientes', cnpj, 'cobrancas')), cobranca)
    }
    console.log(`✔ ${cliente.razaoSocial} (${cnpj}) — ${historico.length} ponto(s) de histórico, ${cobrancas.length} cobrança(s)`)
  }

  for (const alerta of alertas) {
    await setDoc(doc(collection(db, 'alertas')), alerta)
  }
  console.log(`✔ ${alertas.length} alerta(s)`)

  console.log(`\nSemente completa: ${carteira.length} clientes, ${alertas.length} alertas.`)
}

main()
  .then(() => process.exit(0))
  .catch((erro) => {
    console.error('Falha ao semear:', erro)
    process.exit(1)
  })
