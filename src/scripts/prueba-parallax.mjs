// Prueba del parallax de títulos: la sala activa debe asentar con su título
// nítido (opacidad ~1) y alineado (translateX ~0). Cubre el bug de 2026-10-29:
// la fórmula olvidaba restar el centro del viewport y en reposo todos los
// títulos caían al suelo de opacidad (.45) quedando desplazados -3%.
// Uso: node scripts/prueba-parallax.mjs [url]
import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:5173/'
const fallos = []

const browser = await chromium.launch({ headless: true, channel: 'chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errores = []
page.on('pageerror', (e) => errores.push(String(e)))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

const filas = []
for (let i = 0; i < 7; i++) {
  await page.evaluate((i) => window.__recorrido.goTo(i), i)
  await page.waitForTimeout(3000) // da tiempo a que la persecución se asiente

  const d = await page.evaluate(() => {
    const stage = document.querySelector('.stage')
    const rooms = [...document.querySelectorAll('.room')]
    const rw = rooms[0].getBoundingClientRect().width
    const sl = stage.scrollLeft
    const i = Math.round(sl / rw)
    const off = (i * rw + rw / 2 - (sl + rw / 2)) / rw // igual que en recorrido.js
    const head = rooms[i].querySelector('.room-head')
    return {
      sala: i + 1,
      titulo: head.querySelector('h1').textContent,
      opacidad: Number(getComputedStyle(head).opacity),
      desplaz: Number.parseFloat(getComputedStyle(head).transform.split(',')[4] || '0'),
      off: Number(off.toFixed(4))
    }
  })
  filas.push(d)

  if (d.opacidad < 0.95) {
    fallos.push(`sala ${d.sala} "${d.titulo}": título activo con opacidad ${d.opacidad.toFixed(2)} (esperado ~1)`)
  }
  if (Math.abs(d.desplaz) > 4) {
    fallos.push(`sala ${d.sala} "${d.titulo}": título desplazado ${d.desplaz.toFixed(1)}px (esperado ~0)`)
  }
}
if (errores.length) fallos.push(`errores de consola: ${errores.join(' | ')}`)

console.table(filas.map((f) => ({ ...f, opacidad: f.opacidad.toFixed(3) })))

await browser.close()

if (fallos.length) {
  console.error(`❌ prueba-parallax: ${fallos.length} fallo(s)`)
  for (const f of fallos) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('✅ prueba-parallax: títulos activos nítidos y alineados en las 7 salas')
