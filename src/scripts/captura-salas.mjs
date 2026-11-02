// Captura las 7 salas del recorrido, una por una, en escritorio y móvil.
// Uso: node scripts/captura-salas.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const url = process.argv[2] || 'http://localhost:5173/';
const outDir = '02 LISTOS/Portafolio-v2/evidencia/salas';
mkdirSync(outDir, { recursive: true });

const NOMBRES = ['01-home','02-landings','03-apps','04-musica','05-libros','06-video','07-contacto'];

const browser = await chromium.launch({ headless: true, channel: 'chromium' });

async function capturar(prefix, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.deviceScaleFactor || 1 });
  const page = await context.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  for (let i = 0; i < NOMBRES.length; i++) {
    await page.evaluate((idx) => window.__recorrido.goTo(idx), i);
    await page.waitForTimeout(1600); // espera el smooth scroll + transición de ambiente
    await page.screenshot({ path: `${outDir}/${prefix}-${NOMBRES[i]}.png` });
  }
  await context.close();
  return { prefix, errores };
}

const escritorio = await capturar('desk', { width: 1440, height: 900 });
const movile = await capturar('movil', { width: 390, height: 844, deviceScaleFactor: 3 });
await browser.close();

const fallos = [escritorio, movile].filter((r) => r.errores.length);
if (fallos.length) {
  console.error('❌ errores de consola:', JSON.stringify(fallos, null, 2));
  process.exit(1);
}
console.log('✅ 7 salas capturadas en escritorio y móvil');
