const BASE = '/api'

export async function enviarContacto(datos) {
  const res = await fetch(`${BASE}/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  return res.json()
}

export async function registrarReclamo(datos) {
  const res = await fetch(`${BASE}/reclamaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  return res.json()
}
