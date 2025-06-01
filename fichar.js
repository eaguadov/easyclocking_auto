const { chromium } = require('playwright');

const COMPANY_ID = process.env.COMPANY_ID;
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🌐 Navegando a la página de inicio de sesión...");
    await page.goto('https://easyclocking.net/usa/');
    await page.waitForLoadState('networkidle');

    // Login adaptativo (puede o no aparecer CompanyId)
    const companyIdExists = await page.locator('input[name="CompanyId"]').count();
    if (companyIdExists > 0) {
      console.log("🏢 Introduciendo Company ID...");
      await page.fill('input[name="CompanyId"]', COMPANY_ID);
    }

    console.log("👤 Introduciendo credenciales...");
    await page.fill('input[name="UserName"]', USER_NAME);
    await page.fill('input[name="Password"]', PASSWORD);
    await page.click('input[type="submit"][value="Sign In"]');

    // Esperar navegación a segunda pantalla
    console.log("⏳ Esperando navegación a la pantalla de fichaje...");
    try {
      await page.waitForURL('**/employee/timecard', { timeout: 120000 });
      console.log("✅ Navegación a pantalla de fichaje confirmada.");
    } catch (error) {
      console.error("❌ Error esperando la URL de pantalla de fichaje:", error);
      await page.screenshot({ path: 'timeout-segunda-pantalla.png' });
      process.exit(1);
    }

    // Esperar botón Clock In / Clock Out
    let retries = 3;
    while (retries-- > 0) {
      try {
        await page.waitForSelector('button:has-text("Clock In"), button:has-text("Clock Out")', { timeout: 60000 });
        console.log("✅ Botón Clock In / Out encontrado.");
        break;
      } catch (error) {
        if (retries === 0) {
          console.error("❌ Botón Clock In / Out no detectado:", error);
          await page.screenshot({ path: 'no-clock-button.png' });
          process.exit(1);
        }
        console.log("🔄 Reintentando detección de botón...");
        await page.waitForTimeout(5000);
      }
    }

    // Clic en Clock In o Clock Out
    console.log("🖱️ Clicando botón de fichaje...");
    await page.click('button:has-text("Clock In"), button:has-text("Clock Out")');

    // Confirmación (OK Clock In/Out)
    console.log("✅ Esperando botón de confirmación...");
    await page.waitForSelector('button:has-text("OK Clock In"), button:has-text("OK Clock Out")', { timeout: 15000 });
    await page.click('button:has-text("OK Clock In"), button:has-text("OK Clock Out")');
    console.log("📌 Fichaje confirmado.");

    // Esperar que desaparezca el overlay
    let overlayRetries = 3;
    while (overlayRetries-- > 0) {
      try {
        await page.waitForSelector('.ui-dialog-overlay', { state: 'detached', timeout: 20000 });
        console.log("🧼 Overlay cerrado correctamente.");
        break;
      } catch (error) {
        if (overlayRetries === 0) {
          console.error("❌ Overlay no desapareció:", error);
          await page.screenshot({ path: 'overlay-stuck.png' });
          process.exit(1);
        }
        console.log("🔁 Esperando desaparición del overlay...");
        await page.waitForTimeout(5000);
      }
    }

    // Menú de opciones y log off
    const optionsLink = page.locator('a.wijmo-wijmenu-link:has-text("Options")').nth(0);
    await optionsLink.waitFor({ state: 'visible', timeout: 30000 });
    await optionsLink.hover();
    console.log("📂 Menú Options abierto.");

    const logOff = page.locator('a:has-text("Log Off")');
    await logOff.waitFor({ state: 'visible', timeout: 30000 });
    await logOff.click();
    console.log("👋 Sesión cerrada correctamente.");
  } catch (error) {
    console.error("❌ Error general en la ejecución:", error);
    await page.screenshot({ path: 'fatal-error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

