const { chromium } = require('playwright');

const COMPANY_ID = process.env.COMPANY_ID;
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;
const ACTION = process.env.ACTION; // "clockin" o "clockout"

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🔐 Navegando a EasyClocking...");
    await page.goto('https://easyclocking.net/?ReturnUrl=%2femployee%2ftimecard', { timeout: 60000 });

    console.log("📝 Completando login...");
    await page.fill('input[name="CompanyId"]', COMPANY_ID);
    await page.fill('input[name="UserName"]', USER_NAME);
    await page.fill('input[name="Password"]', PASSWORD);
    await page.click('input[type="submit"][value="Sign In"]');

    console.log("⏳ Esperando segunda pantalla...");
    await page.waitForURL('**/employee/timecard', { timeout: 60000 });

    // Intentar localizar el botón de fichar
    for (let i = 0; i < 3; i++) {
      console.log(`🔎 Buscando botón "${ACTION === 'clockin' ? 'Clock In' : 'Clock Out'}" (intento ${i + 1})...`);
      const botonFichaje = await page.$(`input[type="button"][value="${ACTION === 'clockin' ? 'Clock In' : 'Clock Out'}"]`);
      if (botonFichaje) {
        console.log("✅ Botón localizado.");
        console.log(`🖱️ Pulsando botón "${ACTION === 'clockin' ? 'Clock In' : 'Clock Out'}"...`);
        await botonFichaje.click();
        break;
      }
      await page.waitForTimeout(3000);
    }

    // Confirmación tras fichar
    console.log("🪟 Confirmando acción (botón OK)...");
    await page.click('div.ui-dialog-buttonset button:has-text("OK")', { timeout: 10000 });

    // NUEVO BLOQUE: esperar desaparición del overlay con reintentos
    console.log("🧼 Esperando desaparición del overlay...");
    let overlayRetries = 3;
    while (overlayRetries-- > 0) {
      try {
        await page.waitForSelector('.ui-dialog-overlay', { state: 'detached', timeout: 20000 });
        console.log("✅ Overlay desaparecido.");
        break;
      } catch (error) {
        if (overlayRetries === 0) {
          console.error("❌ El overlay no desapareció tras varios intentos:", error);
          await page.screenshot({ path: 'overlay-error.png' });
          process.exit(1);
        } else {
          console.log("⏳ Reintentando desaparición del overlay...");
          await page.waitForTimeout(5000);
        }
      }
    }

    // Acceder al menú "Options"
    console.log("📂 Abriendo menú Options...");
    const optionsLink = page.locator('a.wijmo-wijmenu-link:has-text("Options")');
    await optionsLink.waitFor({ state: 'visible', timeout: 10000 });
    await optionsLink.hover();
    await page.waitForTimeout(1000);

    // Hacer click en Log Off
    console.log("🚪 Cerrando sesión...");
    await page.click('a:has-text("Log Off")');
    console.log("✅ Sesión cerrada correctamente.");

  } catch (error) {
    console.error("❌ Error durante el proceso:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
