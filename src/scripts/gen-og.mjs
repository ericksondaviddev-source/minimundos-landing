// Genera public/og-image.png (1200x630) desde la sala Home real: material propio, costo cero.
import { chromium } from 'playwright';
import { existsSync, statSync } from 'fs';

const OUT = 'public/og-image.jpg';
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const errores = [];
page.on('pageerror', (e) => errores.push(String(e)));

await page.goto('http://localhost:5173/#/home', { waitUntil: 'networkidle' });
await page.waitForTimeout(1600); // deja que la caverna y las tarjetas despierten
await page.screenshot({ path: OUT, type: 'jpeg', quality: 82 });
await browser.close();

if (errores.length) { console.error('❌ errores:', errores); process.exit(1); }
if (!existsSync(OUT) || statSync(OUT).size < 20000) { console.error('❌ og-image.png demasiado pequeña'); process.exit(1); }
console.log(`✅ og-image.jpg generada (${Math.round(statSync(OUT).size / 1024)} KB)`);
