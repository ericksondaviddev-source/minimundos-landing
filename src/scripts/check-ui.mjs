import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fallos = []

function check(ok, mensaje) {
  if (!ok) fallos.push(mensaje)
}

// ── 1. i18n: ES y EN deben tener exactamente las mismas claves ──
const textosSrc = readFileSync(join(root, 'src', 'textos.js'), 'utf8')
const { default: textos } = await import(new URL('../src/textos.js', import.meta.url))

const claves = (obj, pre = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? claves(v, `${pre}${k}.`) : [`${pre}${k}`]
  )

const es = new Set(claves(textos.es))
const en = new Set(claves(textos.en))

for (const k of es) if (!en.has(k)) fallos.push(`i18n: falta la clave "${k}" en EN`)
for (const k of en) if (!es.has(k)) fallos.push(`i18n: falta la clave "${k}" en ES`)

// Ningún texto puede quedar vacío (salvo que sea intencional)
for (const [lang, obj] of Object.entries(textos)) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.trim() === '') fallos.push(`i18n: "${lang}.${k}" está vacío`)
  }
}

// ── 2. WhatsApp: un solo número, sin placeholders ──
const mainSrc = readFileSync(join(root, 'src', 'main.js'), 'utf8')
const wa = mainSrc.match(/whatsappNumber:\s*'(\d+)'/)
check(!!wa, 'main.js: no se encontró CONFIG.whatsappNumber')
if (wa) {
  check(wa[1] === '584241875518', `main.js: WhatsApp "${wa[1]}" no es el aprobado`)
  check(!wa[1].includes('0000000'), 'main.js: WhatsApp parece un placeholder')
}
for (const archivo of ['src/proyectos.js', 'src/salas.js', 'src/textos.js', 'index.html']) {
  const src = readFileSync(join(root, archivo), 'utf8')
  check(!/wa\.me\/\d+/.test(src), `${archivo}: hay un número de WhatsApp hardcodeado (usa CONFIG)`)
  check(!/584120000000/.test(src), `${archivo}: queda el número placeholder 584120000000`)
}

// ── 3. Todo proyecto debe estar en una sala existente ──
const { default: proyectos } = await import(new URL('../src/proyectos.js', import.meta.url))
const { default: salas } = await import(new URL('../src/salas.js', import.meta.url))
const idsSalas = new Set(salas.map((s) => s.id))
for (const p of proyectos) {
  check(idsSalas.has(p.sala), `proyectos.js: "${p.id}" apunta a la sala inexistente "${p.sala}"`)
  check(!!p.title?.es && !!p.title?.en, `proyectos.js: "${p.id}" sin título en ambos idiomas`)
  check(!!p.description?.es && !!p.description?.en, `proyectos.js: "${p.id}" sin descripción en ambos idiomas`)
  check(!!p.propuesta?.es && !!p.propuesta?.en, `proyectos.js: "${p.id}" sin propuesta en ambos idiomas`)
}
for (const s of salas) {
  check(!!s.titulo?.es && !!s.titulo?.en, `salas.js: "${s.id}" sin título en ambos idiomas`)
  check(!!s.resumen?.es && !!s.resumen?.en, `salas.js: "${s.id}" sin resumen en ambos idiomas`)
}

// ── 4. Firma ED-Dev y assets sin huérfanos ──
const html = readFileSync(join(root, 'index.html'), 'utf8')
check(/ED-Dev/.test(html), 'index.html: falta la firma ED-Dev')
check(html.includes('name="description"'), 'index.html: falta meta description')
check(html.includes('og:image'), 'index.html: falta og:image')
check(existsSync(join(root, 'public', 'robots.txt')), 'public/robots.txt no existe')
check(existsSync(join(root, 'public', 'llms.txt')), 'public/llms.txt no existe')

for (const asset of ['hero.png', 'javascript.svg', 'vite.svg']) {
  check(!existsSync(join(root, 'src', 'assets', asset)), `src/assets/${asset} sigue presente y no se usa`)
}

// ── 5. Sin comentarios de desarrollo sueltos en el bundle-ready ──
check(!/\bTODO\b|\bFIXME\b/.test(mainSrc), 'main.js: quedan TODO/FIXME')

if (fallos.length) {
  console.error(`❌ check-ui: ${fallos.length} problema(s)`)
  for (const f of fallos) console.error(`  - ${f}`)
  process.exit(1)
}

console.log('✅ check-ui: todo en verde')
