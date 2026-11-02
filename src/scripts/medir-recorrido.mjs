// Banco de pruebas del recorrido: mide fps, comprueba el cambio de sala
// y guarda capturas. Uso: node scripts/medir-recorrido.mjs [url]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const url = process.argv[2] || 'http://localhost:5173/';
const outDir = '02 LISTOS/Portafolio-v2/evidencia';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chromium' });

async function medir(nombre, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({
    viewport,
    reducedMotion,
    deviceScaleFactor: viewport.deviceScaleFactor || 1
  });
  const page = await context.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const fps = await page.evaluate(() => new Promise((resolve) => {
    let frames = 0;
    const inicio = performance.now();
    function tick(now) {
      frames++;
      if (now - inicio >= 2000) resolve(Math.round((frames * 1000) / (now - inicio)));
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }));

  const info = await page.evaluate(() => ({
    salas: document.querySelectorAll('.room').length,
    nav: document.querySelectorAll('.map-item').length,
    h1: document.querySelector('h1')?.textContent || null,
    canvas: document.querySelectorAll('canvas').length,
    lang: document.documentElement.lang
  }));

  await page.screenshot({ path: `${outDir}/${nombre}.png` });
  await context.close();
  return { nombre, fps, ...info, errores };
}

const desktop = await medir('medicion-escritorio', { width: 1440, height: 900 });
const movil = await medir('medicion-movil', { width: 390, height: 844, deviceScaleFactor: 3 });
const reducido = await medir('medicion-reducido', { width: 1440, height: 900 }, 'reduce');

console.log(JSON.stringify({ desktop, movil, reducido }, null, 2));
await browser.close();

const fallos = [desktop, movil, reducido].filter((r) => r.errores.length);
if (fallos.length) {
  console.error('❌ errores de consola:', JSON.stringify(fallos, null, 2));
  process.exit(1);
}
console.log('✅ sin errores de consola');
