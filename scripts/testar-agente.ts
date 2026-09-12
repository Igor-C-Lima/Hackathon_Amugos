const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const CNPJ_TESTE = process.env.CNPJ_TESTE ?? '11222333000181'

async function main() {
  console.log(`Chamando POST ${BASE_URL}/api/analise com cnpj=${CNPJ_TESTE}...`)

  const response = await fetch(`${BASE_URL}/api/analise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnpj: CNPJ_TESTE }),
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    console.error(`Erro ${response.status}:`, body)
    process.exit(1)
  }

  console.log('Resposta:', body)
}

main().catch((error) => {
  console.error('Falha ao chamar a rota:', error)
  process.exit(1)
})
