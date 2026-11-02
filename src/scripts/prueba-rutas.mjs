// Prueba A1 (enlaces por sala) y A2 (idioma sin recarga): aterriza, navega, cambia idioma y sigue en su sala.
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errores = [];
page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
page.on('pageerror', (e) => errores.push(String(e)));

const fallos = [];
const sala = () => page.evaluate(() => ({
  i: window.__recorrido.currentIndex(),
  hash: location.hash,
  h1: document.querySelector('.room.active, .room:has(.room-head) h1') ? document.querySelectorAll('.room h1')[window.__recorrido.currentIndex()]?.textContent : ''
}));

// A1a: cargar directo con hash aterriza en la sala
await page.goto('http://localhost:5173/#/apps', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const aterrizaje = await sala();
if (aterrizaje.i !== 2) fallos.push(`hash #/apps aterrizó en sala ${aterrizaje.i}, esperado 2`);

// A1b: navegar actualiza la URL
await page.evaluate(() => window.__recorrido.goTo(4));
await page.waitForTimeout(2400);
const navegado = await sala();
if (!navegado.hash.startsWith('#/libros')) fallos.push(`URL tras navegar = ${navegado.hash}, esperado #/libros`);

// B4: el anuncio de sala para lectores de pantalla debe actualizarse
const anuncio = await page.evaluate(() => document.querySelector('.sr-only[aria-live]')?.textContent || '');
if (!anuncio.includes('Sala 5 de 7')) fallos.push(`anuncio aria-live = "${anuncio}", esperado "Sala 5 de 7 ..."`);

// A2: cambiar idioma sin recarga y sin perder la sala
let recargo = false;
page.on('load', () => { recargo = true; });
const antes = await sala();
await page.click('.lang-btn');
await page.waitForTimeout(900);
const despues = await sala();
if (recargo) fallos.push('el cambio de idioma recargó la página entera');
if (despues.i !== antes.i) fallos.push(`idioma movió la sala: ${antes.i} → ${despues.i}`);
if (despues.h1 !== 'Books') fallos.push(`texto no cambió a EN (h1="${despues.h1}", esperado "Books")`);

await browser.close();

console.log(JSON.stringify({ aterrizaje, navegado, antes, despues }, null, 2));
if (errores.length) { console.error('❌ consola:', errores); process.exit(1); }
if (fallos.length) { console.error('❌ rutas:', fallos.join(' | ')); process.exit(1); }
console.log('✅ rutas por sala + idioma sin recarga verificados');
